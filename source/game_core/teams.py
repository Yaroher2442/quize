from typing import Type

from loguru import logger
from pyee.asyncio import AsyncIOEventEmitter
from tinydb import Query, TinyDB
from tinydb.table import Document

from source.db.models import *
from source.db.scenario_models import BlitzRoundScenario
from source.exceptions import *
from source.game_core.stages import GameStage
from source.routes.dto import *
from source.sse.sse_event import *
from Levenshtein import distance


class Tactics:
    without = "without"
    one_for_all = 'one_for_all'
    question_bet = 'question_bet'
    all_in = 'all_in'
    team_bet = 'team_bet'


def erase_team_stats(team: TeamModel):
    team.current_counted.correct_in_row_reached = False
    team.current_counted.base_score = 0
    team.current_counted.correct = False
    team.current_counted.remove_answer = 0
    team.current_counted.one_for_all = False
    team.current_counted.question_bet = 0
    team.current_counted.all_in = False
    team.current_counted.earned_points = 0.0
    team.current_counted.once_correct = False
    team.current_counted.team_bet = ""


def _check_in_row(team: TeamModel, increment=True):
    team.correct_in_row += 1
    team.current_counted.correct_in_row_reached = False
    if team.correct_in_row >= 3:
        if increment:
            team.current_counted.correct_in_row_reached = True
            team.correct_in_row = 0


def _cast_to_pd(doc: Document) -> TeamModel:
    t = TeamModel(**doc)
    t.current_counted.earned_points = round(t.current_counted.earned_points, 1)
    t.current_score = round(t.current_score, 1)
    return t


class TeamsStorage:

    def __init__(self, game):
        self.game = game
        self.db: TinyDB = self.game.db

    def __contains__(self, uid: str):
        return self.db.table(TeamModel.__name__).contains(cond=Query().uid == uid)

    def __len__(self):
        return len(self.db.table(TeamModel.__name__).all())

    def get_all_teams(self) -> List[TeamModel]:
        return self._all_pd()

    def add_team(self, team_obj: TeamModel, emmiter):
        if not self.db.table(TeamModel.__name__).get(
                cond=Query().team_name == team_obj.team_name and Query().table_num == team_obj.table_num):
            try:
                self.db.table(TeamModel.__name__).insert(team_obj.dict())
                self._emmit_event(emmiter, NewTeamEvent)
            except ValueError as e:
                raise RegisterTeamException(f"Can't create user in db cause {e}")
        else:
            raise RegisterTeamException("not unique user")

    async def drop_team(self, emmiter: AsyncIOEventEmitter, team_uid: str):
        try:
            self.db.table(TeamModel.__name__).remove(cond=Query().uid == team_uid)
            self._emmit_event(emmiter, TeamWasRemoved, payload={"team_uid": team_uid})
            await self.sent_all_teams_chose(emmiter)
            await self.sent_all_teams_answered(emmiter)
            return "team_removed"
        except Exception as e:
            logger.error(f"Can't delete team {e} from db")
            raise BaseGameException("Can't delete team from db")

    def update_team_name(self, emmiter: AsyncIOEventEmitter, team_uid: str, new_name: str):
        try:
            self.db.table(TeamModel.__name__).update(cond=Query().uid == team_uid,
                                                     fields={"team_name": new_name})
            self._emmit_event(emmiter, TeamWasUpdated, payload={"new_name": new_name, "team_uid": team_uid})
            return "team_removed"
        except Exception as e:
            logger.error(f"Can't delete team {e} from db")
            raise BaseGameException("Can't delete team from db")

    def acquire_avatar(self, emitter: AsyncIOEventEmitter, team_id: str, avatar_path: str):
        # for t in self._all_pd():
        #     if t.avatar == avatar_path and "default" not in t.avatar:
        #         raise BaseGameException("Avatar already acquired")
        if self.get_team(team_id).avatar != "":
            raise BaseGameException("You have avatar")
        else:
            self._emmit_event(emitter, AcquireAvatarEvent, {"path": avatar_path})
            self.db.table(TeamModel.__name__).update(cond=Query().uid == team_id, fields={"avatar": avatar_path})
        return avatar_path

    def upload_avatar(self, team_id: str, avatar_path: str):
        if self.get_team(team_id).avatar != "":
            raise BaseGameException("You have avatar")
        else:
            self.db.table(TeamModel.__name__).update(cond=Query().uid == team_id, fields={"avatar": avatar_path})

    def get_team(self, team_uid: str) -> TeamModel:
        return _cast_to_pd(self.db.table(TeamModel.__name__).get(cond=Query().uid == team_uid))

    def erase_teams_state(self):
        for team in self._all_pd():
            team.current_tactic = None
            team.current_answer = None
            erase_team_stats(team)

            self.db.table(TeamModel.__name__).update(cond=Query().uid == team.uid, fields=team.dict())

    def erase_test_score(self):
        for team in self._all_pd():
            team.current_score = 0.0
            tactic_b = TeamTacticBalance(
                **self.game.get_tactic_balance().dict())
            team.tactic_balance = tactic_b
            team.correct_in_row = 0
            team.current_answer = None
            team.current_tactic = None
            team.current_blitz_answers = {}
            erase_team_stats(team)
            team.current_place = 0
            self.db.table(TeamModel.__name__).update(cond=Query().uid == team.uid, fields=team.dict())

    def _emmit_event(self, emitter: AsyncIOEventEmitter, name: Type[SseEvent], payload: JSONserializeble = None):
        if not payload:
            payload = {}
        event = name([i.dict() for i in self.get_all_teams()], payload)
        emitter.emit(event.name, event)

    def _set_tactics(self, team: TeamModel, dto: TacticChosePOST):
        team.current_tactic = dto.tactic
        if dto.tactic == 'one_for_all':
            team.current_counted.one_for_all = True
            if team.tactic_balance.one_for_all - 1 >= 0:
                team.tactic_balance.one_for_all -= 1
        elif dto.tactic == "question_bet":
            team.current_counted.question_bet = dto.amount
            if team.tactic_balance.question_bet - 1 >= 0:
                team.tactic_balance.question_bet -= 1
        elif dto.tactic == "all_in":
            team.current_counted.all_in = True
            if team.tactic_balance.all_in - 1 >= 0:
                team.tactic_balance.all_in -= 1
        elif dto.tactic == "team_bet":
            team.current_counted.team_bet = dto.amount
            if team.tactic_balance.team_bet - 1 >= 0:
                team.tactic_balance.team_bet -= 1

        self.db.table(TeamModel.__name__).update(cond=Query().uid == dto.uid, fields=team.dict())

    async def sent_all_teams_chose(self, emitter: AsyncIOEventEmitter):
        if self._check_all_team_chose():
            media = self.game.is_media_exists()
            logger.warning(media)
            self.game.stage = GameStage.ALL_CHOSE
            if media:
                self._emmit_event(emitter, AllTeamChosenTactic)
            else:
                self._emmit_event(emitter, AllTeamChosenTactic)
                self.game.show_media_before(self.game.emitter)

    async def team_chose_tactic(self, dto: TacticChosePOST, emitter: AsyncIOEventEmitter):
        team = self.get_team(dto.uid)
        if team.current_tactic:
            raise WrongSequence("Tactic already chosen")
        if dto.tactic not in ["one_for_all", "question_bet", "all_in", "team_bet", "without"]:
            raise BaseGameException("Tactic not allowed")
        self._set_tactics(team, dto)
        self._emmit_event(emitter, TeamChoseTactic, self.get_team(dto.uid).dict())
        await self.sent_all_teams_chose(emitter)

    async def sent_all_teams_answered(self, emitter: AsyncIOEventEmitter):
        if self._check_all_team_answer():
            media = self.game.is_media_exists()
            self.game.stage = GameStage.ALL_ANSWERED
            self._emmit_event(emitter, AllTeamAnswered)
            if not media:
                self.game.show_media_after(self.game.emitter)
            try:
                await self.game.sanic.cancel_task(name='timer')
            except Exception as e:
                logger.error(e)

    async def team_chose_answer(self, dto: AnswerChosePOST, emitter: AsyncIOEventEmitter):
        team = self.get_team(dto.uid)
        if team.current_answer:
            raise BaseGameException("You already answered")
        team.current_counted.base_score = dto.time
        team.current_counted.remove_answer = dto.remove_answer
        team.current_answer = dto.answer if dto.answer else ""
        if team.tactic_balance.remove_answer - dto.remove_answer >= 0:
            team.tactic_balance.remove_answer -= dto.remove_answer
        self.db.table(TeamModel.__name__).update(cond=Query().uid == dto.uid, fields=team.dict())
        self._emmit_event(emitter, TeamChoseAnswer, self.get_team(dto.uid).dict())
        await self.sent_all_teams_answered(emitter)

    async def team_answer_blitz(self, emitter, dto: BlitzAnswerChosePOST):
        team = self.get_team(dto.uid)
        team.current_blitz_answers.update({str(dto.id): {"answr": dto.answer, "correct": False}})
        self.db.table(TeamModel.__name__).update(cond=Query().uid == dto.uid, fields=team.dict())
        if self._check_all_team_blitzed():
            self._emmit_event(emitter, AllTeamAnswered)
            try:
                await self.game.sanic.cancel_task(name='timer')
            except Exception as e:
                logger.error(e)

    async def finish_blitz(self, emitter: AsyncIOEventEmitter):
        self.game.stage = GameStage.ALL_ANSWERED
        self._emmit_event(emitter, AllTeamAnswered)

    def _check_correct(self, team: TeamModel) -> bool:
        if team.current_answer:
            cur = team.current_answer.strip().lower()
            q = self.game.get_question()
            cor: str = q.correct_answer.strip().lower()
            if cur:
                if q.type == "select":
                    return cur == cor
                else:
                    if cur.isdigit() and cor.isdigit():
                        return int(cur) == int(cor)
                    else:
                        if len(cor) < 3:
                            return cur == cor
                        else:
                            if distance(cur, cor) <= 1:
                                return True
            return False
        else:
            return False

    def _get_base_score(self, team):
        result = team.current_counted.base_score
        if team.current_counted.remove_answer != 0:
            mul = 1
            for i in range(team.current_counted.remove_answer):
                mul -= 0.25
            result *= mul
        if team.current_counted.correct_in_row_reached:
            result *= 3
        corrects = []
        for t in self.get_all_teams():
            if self._check_correct(t) and t.uid != team.uid:
                corrects.append(t)
        if not corrects:
            result *= 2
            team.current_counted.once_correct = True
        return result

    def _count_team_res(self, team: TeamModel) -> float:
        result = self._get_base_score(team)
        is_correct = team.current_counted.correct

        if team.current_counted.one_for_all:
            result *= 3
        if team.current_counted.team_bet:
            if is_correct:
                if self._check_correct(bet_team):
                    bet_team = self.get_team(team.current_counted.team_bet)
                    result += self._get_base_score(bet_team)
                else:
                    result = 0
            else:
                result = 0
        if result < 0:
            return 0
        return result

    def count_results(self):
        if self.game.now_blitz:
            cur_round: BlitzRoundScenario = self.game.get_round()[0]
            for team in self.get_all_teams():
                if team.current_counted.earned_points != 0.0:
                    continue
                res = 0
                for answ_id, answr in team.current_blitz_answers.items():
                    for qestion in cur_round.questions:
                        if int(qestion.id) == int(answ_id):
                            cur = answr["answr"].strip().lower()
                            cor: str = qestion.correct_answer.strip().lower()
                            if cur:
                                if cur.isdigit() and cor.isdigit():
                                    if int(cur) == int(cor):
                                        res += cur_round.settings.blitz_score
                                        answr["correct"] = True
                                else:
                                    if len(cor) < 3:
                                        if cur == cor:
                                            res += cur_round.settings.blitz_score
                                            answr["correct"] = True
                                    else:
                                        if distance(cur, cor) <= 1:
                                            res += cur_round.settings.blitz_score
                                            answr["correct"] = True
                team.current_counted.earned_points = res
                team.current_score += res
                team.current_score = team.current_score
                self.db.table(TeamModel.__name__).update(cond=Query().uid == team.uid, fields=team.dict())
        else:
            for team in self.get_all_teams():
                if team.current_counted.earned_points != 0:
                    continue
                team.current_counted.correct = self._check_correct(team)
                if not team.current_counted.correct:
                    team.correct_in_row = 0
                    team.current_counted.correct_in_row_reached = False
                if team.current_counted.all_in:
                    if not team.current_counted.correct:
                        team.current_counted.earned_points = -team.current_score
                        team.current_score = 0
                        team.current_counted.earned_points = round(team.current_counted.earned_points, 1)
                        team.current_score = round(team.current_score, 1)
                        self.db.table(TeamModel.__name__).update(cond=Query().uid == team.uid, fields=team.dict())
                        continue
                    else:
                        _check_in_row(team, increment=False)
                        team.current_counted.earned_points = team.current_score
                        team.current_score *= 2
                        self.db.table(TeamModel.__name__).update(cond=Query().uid == team.uid, fields=team.dict())
                        continue

                if team.current_counted.question_bet != 0:
                    s = team.current_score * team.current_counted.question_bet
                    if team.current_counted.correct:
                        _check_in_row(team, increment=False)
                        team.current_score += s
                        team.current_counted.earned_points = s
                    else:
                        team.current_counted.earned_points = -s
                        team.current_score -= s
                        team.current_counted.earned_points = round(team.current_counted.earned_points, 1)
                        team.current_score = round(team.current_score, 1)
                    self.db.table(TeamModel.__name__).update(cond=Query().uid == team.uid, fields=team.dict())
                    continue

                if team.current_counted.team_bet:
                    bet_team = self.get_team(team.current_counted.team_bet)
                    team.current_counted.team_bet_score = self._get_base_score(bet_team)
                    
                if team.current_counted.correct:
                    _check_in_row(team)
                    res = self._count_team_res(team)
                    team.current_counted.earned_points = res
                    team.current_score += res
                else:
                    team.current_counted.earned_points = 0
                team.current_counted.earned_points = round(team.current_counted.earned_points, 1)
                team.current_score = round(team.current_score, 1)
                self.db.table(TeamModel.__name__).update(cond=Query().uid == team.uid, fields=team.dict())

    def count_places(self):
        teams = self.get_all_teams()
        scores = list(dict.fromkeys([team.current_score for team in teams]))
        scores.sort(reverse=True)
        for team in teams:
            for score in scores:
                if team.current_score == score:
                    team.current_place = scores.index(score)
                    break
        for team in teams:
            team.current_place += 1
            self.db.table(TeamModel.__name__).update(cond=Query().uid == team.uid, fields=team.dict())

    def _all_pd(self) -> Union[List[TeamModel], None]:
        return [_cast_to_pd(db_team) for db_team in self.db.table(TeamModel.__name__).all()]

    def _check_all_team_chose(self) -> bool:
        chose = []
        all_teams = self._all_pd()

        for team in all_teams:
            if team.current_tactic:
                chose.append(team.current_tactic)
        if len(all_teams) == len(chose):
            return True
        return False

    def _check_all_team_answer(self) -> bool:
        answered = []
        all_teams = self._all_pd()
        for team in all_teams:
            if team.current_answer:
                answered.append(team.current_answer)
            if team.current_answer == "":
                answered.append(team.current_answer)
        if len(all_teams) == len(answered):
            return True
        return False

    def _check_all_team_blitzed(self) -> bool:
        logger.warning(self.game.all_questions)
        cond = all(
            [len(team.current_blitz_answers.keys()) == len(self.game.get_round()[0].questions) for team in
             self._all_pd()])
        logger.warning(cond)
        # if cond:
        #     try:
        #         await self.game.sanic.cancel_task(name='timer')
        #         self.game.current_time = 0
        #     except:
        #         pass
        return cond
