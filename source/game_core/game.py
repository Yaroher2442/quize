import asyncio
import json
import os
import sys
import uuid
from typing import Type, Tuple

from loguru import logger
from pyee.asyncio import AsyncIOEventEmitter
from sanic import Sanic
from tinydb import TinyDB

from source.db.models import *
from source.db.scenario_models import *
from source.game_core.stages import GameStage
from source.game_core.teams import TeamsStorage
from source.game_core.wrappers import check_sequence
from source.sse.sse_event import *


class QuizeGame:
    """('./config', 'config/')"""
    _sanic: Sanic

    def __init__(self, scenario_name: str, inited_database: TinyDB):
        self.scenario: GameScenario = GameScenario(
            **json.load(open(f"config/{scenario_name}", encoding=sys.getdefaultencoding()))["game"])
        self.loop = asyncio.get_event_loop()
        self.db = inited_database
        self.teams: TeamsStorage = TeamsStorage(self)
        self.stage = GameStage.WAITING_START
        self.prv_stage = None
        self.current_round: int = 1
        self.current_question: int = 1
        self.now_blitz = False
        self.is_finished = False
        self.all_rounds = len(self.scenario.rounds)
        self.all_questions = len(self.scenario.rounds[self.current_round - 1].questions)
        self.current_time = 0
        self.restore_game_state()

    @property
    def sanic(self):
        return self._sanic

    @sanic.setter
    def sanic(self, item: Sanic):
        self._sanic = item

    async def timer_task(self, emitter: AsyncIOEventEmitter):
        while self.current_time >= 0:
            self._emmit_event(emitter, TimerTickEvent, payload={"time": self.current_time})
            self.current_time -= 1
            self.write_snapshot()
            await asyncio.sleep(0.95)
            # if self.current_time == 1:
            #     await asyncio.sleep(1)
            #     self._emmit_event(emitter, AllTeamAnswered)
            #     break
            # else:
            #     logger.warning(f"TIMER: {self.current_time}")
            #     self.current_time -= 1
            #     self.write_snapshot()
            #     await asyncio.sleep(1)
        else:
            self._emmit_event(emitter, AllTeamAnswered)
        return

    def write_snapshot(self):
        if len(self.db.table(GameState.__name__)) == 0:
            v = vars(self).copy()
            v["stage"] = str(self.stage.name)
            if self.prv_stage:
                v["prv_stage"] = str(self.prv_stage.name)
            self.db.table(GameState.__name__).insert(GameState(**v).dict())
        else:
            for i in self.db.table(GameState.__name__).all():
                v = vars(self).copy()
                v["stage"] = str(self.stage.name)
                if self.prv_stage:
                    v["prv_stage"] = str(self.prv_stage.name)
                self.db.table(GameState.__name__).update(doc_ids=[i.doc_id],
                                                         fields=GameState(**v).dict())

    def next_stage(self):
        self.stage = self.stage.next()
        self.prv_stage = self.stage.prev()

    def prev_stage(self):
        if self.stage.prev():
            self.stage = self.stage.prev()
            self.prv_stage = self.stage.prev()

    def _get_from_db(self) -> Union[GameState, None]:
        if len(self.db.table(GameState.__name__)) != 0:
            for i in self.db.table(GameState.__name__).all():
                return GameState(**self.db.table(GameState.__name__).get(doc_id=i.doc_id))
        else:
            return None

    def restore_game_state(self):
        game_state = self._get_from_db()
        if game_state is None:
            self.current_round = 1
            self.current_question = 1
            self.all_rounds = len(self.scenario.rounds)
            self.all_questions = len(self.scenario.rounds[self.current_round - 1].questions)
            self.is_finished = False
            self.now_blitz = False
            self.current_time = 0
            self.stage = GameStage.WAITING_START

        if game_state:
            for k, v in game_state:
                if k == "stage":
                    self.stage = GameStage.all_names()[v]
                elif k == "prv_stage":
                    self.prv_stage = GameStage.all_names()[v]
                else:
                    setattr(self, k, v)

    def get_round(self, state=False) -> Tuple[Union[RoundScenario, BlitzRoundScenario], bool]:
        if state:
            is_next_round = False
            if self.now_blitz and self.current_round < self.all_rounds:
                is_next_round = True
            else:
                if self.current_question > self.all_questions:
                    is_next_round = True

            return self.scenario.rounds[self.current_round - 1], is_next_round
        if self.stage == GameStage.SHOW_RESULTS or self.stage == GameStage.NEXT_ROUND:
            # logger.warning(
            #     f"SHOW_RESULTS current_question: {self.current_question}, current_round: {self.current_round} "
            #     f", all_questions: {self.all_questions} all_rounds: {self.all_rounds}")
            is_next_round = False
            if self.now_blitz and self.current_round < self.all_rounds:
                self.current_round += 1
                self.current_question = 1
                is_next_round = True
            else:
                self.current_question += 1
                try:
                    self.all_questions = len(self.scenario.rounds[self.current_round - 1].questions)
                except:
                    self.is_finished = True
                    return None
                if self.current_question > self.all_questions:
                    self.current_question = 1
                    self.current_round += 1
                    is_next_round = True
            try:
                round = self.scenario.rounds[self.current_round - 1]
            except:
                pass
            if round.type == "blitz":
                self.now_blitz = True
            else:
                self.now_blitz = False
            if is_next_round:
                try:
                    prev_round = self.scenario.rounds[self.current_round - 2]
                    if prev_round.settings.is_test:
                        self.teams.erase_test_score()
                except:
                    self.is_finished = True
                    return None, is_next_round
            try:
                self.all_questions = len(self.scenario.rounds[self.current_round - 1].questions)
            except:
                self.is_finished = True
                return None, is_next_round
            self.current_time = round.settings.time_to_answer
            return round, is_next_round
        elif self.stage == GameStage.WAITING_NEXT:
            round = self.scenario.rounds[self.current_round - 1]
            self.current_round = 1
            self.current_question = 1
            logger.warning(
                f"WAITING_NEXT current_question: {self.current_question}, current_round: {self.current_round} "
                f", all_questions: {self.all_questions} all_rounds: {self.all_rounds}")
            if round.type == "blitz":
                self.now_blitz = True
            else:
                self.now_blitz = False
            self.all_questions = len(self.scenario.rounds[self.current_round - 1].questions)
            self.current_time = round.settings.time_to_answer
            return round, False
        else:
            round = self.scenario.rounds[self.current_round - 1]
            logger.warning(
                f"SHOW_CORRECT_ANSWER current_question: {self.current_question}, current_round: {self.current_round} "
                f", all_questions: {self.all_questions} all_rounds: {self.all_rounds}")
            if round.type == "blitz":
                self.now_blitz = True
            else:
                self.now_blitz = False
            self.all_questions = len(self.scenario.rounds[self.current_round - 1].questions)
            self.current_time = round.settings.time_to_answer
            return round, self.current_question >= self.all_questions

    def get_question(self) -> QuestionScenario:
        return self.scenario.rounds[self.current_round - 1].questions[self.current_question - 1]

    def get_tactic_balance(self) -> TacticsScenario:
        return self.scenario.game_settings.tactics

    def get_round_settings(self) -> SettingsScenario:
        return self.get_round()[0].settings

    def _emmit_event(self, emitter: AsyncIOEventEmitter, name: Type[SseEvent], payload: JSONserializeble = None):
        if not payload:
            payload = {}
        event = name([i.dict() for i in self.teams.get_all_teams()], payload)
        e_payload = {"payload": event.payload, "teams": event.teams}
        emitter.emit(event.name, event)

    @check_sequence(GameStage.WAITING_START, GameStage.WAITING_NEXT)
    def start_game(self, emitter: AsyncIOEventEmitter):
        self._emmit_event(emitter, StartGameEvent, payload={"skip_emails": self.scenario.game_settings.skip_emails})
        return {"round": self.get_round(state=True)[0].dict()}

    @check_sequence([GameStage.WAITING_NEXT, GameStage.SHOW_RESULTS, GameStage.NEXT_ROUND], GameStage.CHOSE_TACTICS)
    def next_question(self, emitter: AsyncIOEventEmitter) -> Dict[str, Any]:
        round = self.get_round()[0]
        if self.is_finished:
            self._emmit_event(emitter, GameEndedEvent)
            return {"fished": self.is_finished}
        self.teams.erase_teams_state()
        self.get_question()
        r = round.dict()
        r.update({"current_round": self.current_round, "current_question": self.current_question,
                  "all_rounds": self.all_rounds,
                  'all_questions': self.all_questions})
        self._emmit_event(emitter, NextQuestionEvent, r)
        return round

    @check_sequence(GameStage.ALL_CHOSE, GameStage.SHOW_MEDIA_BEFORE)
    def show_media_before(self, emitter: AsyncIOEventEmitter):
        self._emmit_event(emitter, ShowMediaBeforeEvent, self.get_question().media_data.dict())

    @check_sequence(GameStage.SHOW_MEDIA_BEFORE, GameStage.SHOW_QUESTION)
    def show_question(self, emitter: AsyncIOEventEmitter):
        self._emmit_event(emitter, ShowQuestionsEvent, self.get_question().dict())

    @check_sequence(GameStage.SHOW_QUESTION, GameStage.CHOSE_ANSWERS)
    def show_answers(self, emitter: AsyncIOEventEmitter):
        q = self.get_question().dict()
        if self.now_blitz:
            q.update({"type": "blitz"})
        self._sanic.add_task(self.timer_task(emitter), name='timer')
        self._emmit_event(emitter, ShowAnswersEvent, q)

    @check_sequence(GameStage.ALL_ANSWERED, GameStage.SHOW_MEDIA_AFTER)
    def show_media_after(self, emitter: AsyncIOEventEmitter):
        self._emmit_event(emitter, ShowMediaAfterEvent, self.get_question().media_data.dict())

    @check_sequence(GameStage.SHOW_MEDIA_AFTER, GameStage.SHOW_CORRECT_ANSWER)
    def show_correct_answers(self, emitter: AsyncIOEventEmitter):
        self.teams.count_results()
        self.teams.count_places()
        if self.now_blitz:
            self._emmit_event(emitter, ShowCorrectAnswersEvent, self.get_round()[0].dict())
        self._emmit_event(emitter, ShowCorrectAnswersEvent, self.get_question().dict())

    @check_sequence(GameStage.SHOW_CORRECT_ANSWER, GameStage.SHOW_RESULTS)
    def show_results(self, emitter: AsyncIOEventEmitter):
        if self.now_blitz and (self.current_round == self.all_rounds):
            self.is_finished = True
        elif not self.now_blitz and (self.current_question - 1 == self.all_questions):
            self.is_finished = True
        self.teams.count_results()
        self.teams.count_places()
        data, nexts = self.get_round()
        self._emmit_event(emitter, ShowResultsEvent, {"next_round": nexts})

    @check_sequence(GameStage.SHOW_RESULTS, GameStage.NEXT_ROUND)
    def next_round(self, emitter: AsyncIOEventEmitter):
        self._emmit_event(emitter, NextRound, payload={"next_test": self.next_test()})

    def next_test(self):
        try:
            return self.scenario.rounds[self.current_round + 1].settings.is_test
        except:
            return False

    def next_blitz(self):
        try:
            is_blitz = self.scenario.rounds[self.current_round].type
            return is_blitz == "blitz"
        except:
            return False

    def end_game(self, emitter: AsyncIOEventEmitter):
        self._emmit_event(emitter, GameEndedEvent, payload={"next_test": self.next_test()})

    def is_media_exists(self) -> bool:
        media = self.scenario.rounds[self.current_round - 1].questions[self.current_question - 1].media_data
        if self.stage == GameStage.CHOSE_TACTICS:
            if media.show_image:
                if media.image.before == "":
                    return False
            else:
                if media.video.before == "":
                    return False
        if self.stage == GameStage.CHOSE_ANSWERS:
            if media.show_image:
                if media.image.after == "":
                    return False
            else:
                if media.video.after == "":
                    return False
        return True

    def _check_uuid(self, uuid_to_test: str) -> bool:
        try:
            uuid_obj = uuid.UUID(uuid_to_test, version=4)
        except ValueError:
            return False
        return True

    def acquired_avatars(self):
        path = os.path.join(os.getcwd(), 'config', "media", "image", "avatar")
        all = [i for i in os.listdir(path) if "default" not in i and not self._check_uuid(i.split(".")[0])]
        q = [t.avatar for t in self.teams.get_all_teams() if t.avatar in all]
        return q

    def get_avatars(self):
        path = os.path.join(os.getcwd(), 'config', "media", "image", "avatar")
        return [i for i in os.listdir(path) if "default" not in i and not self._check_uuid(i.split(".")[0])]

    def payload_state(self):
        logger.warning(self.stage)
        """
        if self.current_time != 0 and not self._sanic.get_task(name="timer",
                                                               raise_exception=False) and (
                self.stage != GameStage.SHOW_QUESTION and
                self.stage != GameStage.CHOSE_TACTICS and
                self.stage != GameStage.CHOOSE_ANSWERS and
                self.stage != GameStage.SHOW_MEDIA_BEFORE and
                self.stage != GameStage.SHOW_MEDIA_AFTER):
            self.sanic.add_task(self.timer_task(self.emitter, self.current_time), name="timer")
        """
        data = self.get_round(state=True)
        p = {"current_round": self.current_round, "current_question": self.current_question,
             "all_rounds": len(self.scenario.rounds),
             'all_questions': len(self.scenario.rounds[self.current_round - 1].questions),
             "stage": self.stage.name,
             "teams": [i.dict() for i in self.teams.get_all_teams()],
             "question": self.get_question().dict(),
             "next_test": self.next_test(),
             "next_blitz": self.next_blitz(),
             "round": data[0].dict(),
             "next_round": data[1],
             "timer": self.current_time,
             "skip_emails": self.scenario.game_settings.skip_emails
             }
        if self.prv_stage:
            p.update({"prv_stage": self.prv_stage.name})
        else:
            p.update({"prv_stage": None})
        return p

    async def new(self):
        if len(self.db.table(GameState.__name__)) != 0:
            for i in self.db.table(GameState.__name__).all():
                self.db.table(GameState.__name__).remove(doc_ids=[i.doc_id])
        if len(self.db.table(TeamModel.__name__)) != 0:
            self.db.table(TeamModel.__name__).remove(
                doc_ids=[i.doc_id for i in self.db.table(TeamModel.__name__).all()])
        try:
            await self.sanic.cancel_task(name='timer')
        except:
            pass
        self.restore_game_state()
        self.prv_stage = None

    def get_add_info(self):
        return self.scenario.game_info.dict()

    def _replicate_to_other_file(self):
        dumps = os.listdir("config")
        max_dump_num = 0
        for dump in dumps:
            if "db_" in dump:
                try:
                    num = int(dump.split("_")[-1].replace(".json", ""))
                    if num > max_dump_num:
                        max_dump_num = num
                except Exception as e:
                    logger.warning(str(e))
                    max_dump_num = 0
                    break
        db_dump = TinyDB(f'config/db_{max_dump_num + 1}.json')
        db_dump.table(GameState.__name__).insert(GameState(**vars(self)).dict())
        for team in self.teams.get_all_teams():
            db_dump.table(TeamModel.__name__).insert(team.dict())
