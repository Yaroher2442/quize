import asyncio
import json
import os
import sys
from typing import Type

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
from source.tools.sllist import Dllistnode, Dllist


class Round:
    questions: Dllist[Union[QuestionScenario, BlitzQuestionScenario]]
    current_question: Dllistnode[Union[QuestionScenario, BlitzQuestionScenario]]
    info: RoundInfo
    base_round: Union[RoundScenario, BlitzRoundScenario]

    def __init__(self, round_data: Union[RoundScenario, BlitzRoundScenario]):
        self.base_round = round_data
        self.questions = Dllist(round_data.questions)
        self.current_question = self.questions.first
        self.info = round_data

    def next_question(self):
        self.current_question = self.current_question.next

    def get_question(self) -> Union[QuestionScenario, BlitzQuestionScenario]:
        return self.current_question.value


class QuizeGame:
    rounds: Dllist[Round]
    current_round: Dllistnode[Round]
    base_scenario: GameScenario
    teams: TeamsStorage
    _finished: bool = False
    _sanic: Sanic = None
    _emitter: AsyncIOEventEmitter
    now_blitz: bool
    db: TinyDB

    @property
    def sanic(self):
        return self._sanic

    @sanic.setter
    def sanic(self, item: Sanic):
        self._sanic = item

    @property
    def emitter(self):
        return self._emitter

    @emitter.setter
    def emitter(self, item: AsyncIOEventEmitter):
        self._emitter = item

    async def timer_task(self):
        while True:
            self.current_time -= 1
            self.emmit_event(TimerTickEvent, payload={"time": self.current_time})
            if self.current_time == 0:
                self.emmit_event(AllTeamAnswered)
                break
            self.write_snapshot()
            await asyncio.sleep(0.95)

    def write_snapshot(self):
        game_state = GameState(
            current_round=self.current_round.idx,
            current_question=self.get_round().current_question.idx,
            now_blitz=self.now_blitz,
            is_finished=self._finished,
            stage=str(self.stage.name),
            prv_stage=str(self.stage.name),
            current_time=self.current_time,
        )
        if len(self.db.table(GameState.__name__)) == 0:
            self.db.table(GameState.__name__).insert(game_state.model_dump())
        else:
            for i in self.db.table(GameState.__name__).all():
                self.db.table(GameState.__name__).update(doc_ids=[i.doc_id],
                                                         fields=game_state.model_dump())

    def emmit_event(self, name: Type[SseEvent], payload: JSONserializeble = None):
        if not payload:
            payload = {}
        event = name([i.model_dump() for i in self.teams.get_all_teams()], payload)
        e_payload = {"payload": event.payload, "teams": event.teams}
        self.emitter.emit(event.name, event)

    def restore_game_state(self):
        game_state = GameState(
            current_round=0,
            current_question=0,
            now_blitz=False,
            is_finished=False,
            stage=str(GameStage.WAITING_START.name),
            prv_stage=str(GameStage.WAITING_START.name),
            current_time=0,
        )
        if len(self.db.table(GameState.__name__)) != 0:
            for i in self.db.table(GameState.__name__).all():
                game_state = GameState(**self.db.table(GameState.__name__).get(doc_id=i.doc_id))

        self._finished = game_state.is_finished
        self.now_blitz = game_state.now_blitz
        self.stage = GameStage.all_names()[game_state.stage]
        self.current_time = game_state.current_time

        self.load_rounds()
        for r in self.rounds.iternodes():
            if r.idx == game_state.current_round:
                self.current_round = r
        for q in self.get_round().questions.iternodes():
            if q.idx == game_state.current_question:
                self.get_round().current_question = q
        if self.current_time != 0 and self.stage == GameStage.CHOSE_ANSWERS:
            async def start_timer(app: Sanic, loop: asyncio.AbstractEventLoop):
                try:
                    self.sanic.add_task(self.timer_task(), name='timer')
                except Exception as e:
                    logger.warning(f"task canceled {e}")

            self.sanic.register_listener(start_timer, "after_server_start")

    def load_rounds(self):
        self.rounds = Dllist()
        rounds: List[Round] = []
        for r in self.base_scenario.rounds:
            rounds.append(Round(r))
        self.rounds = Dllist(rounds)

    def __init__(self, scenario_name: str, inited_database: TinyDB, sanic: Sanic, emitter: AsyncIOEventEmitter):
        self._sanic = sanic
        self._emitter = emitter
        self.base_scenario: GameScenario = GameScenario(
            **json.load(open(f"config/{scenario_name}", encoding=sys.getdefaultencoding()))["game"])
        self.stage = GameStage.WAITING_START
        self.load_rounds()
        self.current_round = self.rounds.first

        self.db = inited_database
        self.current_time = self.get_round().current_question.value.time_to_answer
        self.now_blitz = False
        self.restore_game_state()
        self.teams: TeamsStorage = TeamsStorage(self)

    def get_round(self) -> Round:
        return self.current_round()

    def is_next_round(self) -> bool:
        return self.get_round().current_question.next is None

    def get_round_settings(self) -> SettingsScenario:
        return self.get_round().info.settings

    def get_tactic_balance(self) -> TacticsScenario:
        return self.base_scenario.game_settings.tactics

    @check_sequence(GameStage.WAITING_START, GameStage.WAITING_NEXT)
    def start_game(self):
        self.emmit_event(StartGameEvent,
                         payload={"skip_emails": self.base_scenario.game_settings.skip_emails})
        return {"round": self.get_round().base_round.model_dump()}

    @check_sequence([GameStage.WAITING_NEXT, GameStage.SHOW_RESULTS, GameStage.NEXT_ROUND], GameStage.CHOSE_TACTICS)
    def next_question(self) -> Dict[str, Any]:
        cur_round = self.get_round()
        if self._finished:
            self.emmit_event(GameEndedEvent)
            return {"fished": True}
        self.teams.erase_teams_state()
        r = cur_round.base_round.model_dump()
        r.update({"current_round": self.current_round.idx, "current_question": self.get_round().current_question.idx,
                  "all_rounds": len(self.rounds),
                  'all_questions': len(self.get_round().questions)})
        self.emmit_event(NextQuestionEvent, r)

        if cur_round.info.type == "blitz":
            self.current_time = cur_round.info.settings.time_to_answer
        else:
            self.current_time = cur_round.current_question.value.time_to_answer
        return cur_round.base_round.model_dump()

    @check_sequence(GameStage.ALL_CHOSE, GameStage.SHOW_MEDIA_BEFORE)
    def show_media_before(self):
        self.emmit_event(ShowMediaBeforeEvent,
                         self.get_round().get_question().media_data.model_dump())

    @check_sequence(GameStage.SHOW_MEDIA_BEFORE, GameStage.SHOW_QUESTION)
    def show_question(self, ):
        self.emmit_event(ShowQuestionsEvent, self.get_round().get_question().model_dump())

    @check_sequence(GameStage.SHOW_QUESTION, GameStage.CHOSE_ANSWERS)
    def show_answers(self, ):
        q = self.get_round().get_question().model_dump()
        if self.now_blitz:
            q.update({"type": "blitz"})
        self._sanic.add_task(self.timer_task(), name='timer')
        self.emmit_event(ShowAnswersEvent, q)

    @check_sequence(GameStage.ALL_ANSWERED, GameStage.SHOW_MEDIA_AFTER)
    def show_media_after(self):
        self.emmit_event(ShowMediaAfterEvent, self.get_round().get_question().media_data.model_dump())

    @check_sequence(GameStage.SHOW_MEDIA_AFTER, GameStage.SHOW_CORRECT_ANSWER)
    def show_correct_answers(self):
        self.teams.count_results()
        self.teams.count_places()
        if self.now_blitz:
            self.emmit_event(ShowCorrectAnswersEvent, self.get_round()[0].model_dump())
        self.emmit_event(ShowCorrectAnswersEvent, self.get_round().get_question().model_dump())

    @check_sequence(GameStage.SHOW_CORRECT_ANSWER, GameStage.SHOW_RESULTS)
    def show_results(self):
        # if self.now_blitz and self.current_round.next is None:
        #     self._finished = True
        # elif not self.now_blitz and self.get_round().current_question.next is None:
        #     self._finished = True
        self.teams.count_results()
        self.teams.count_places()
        self.emmit_event(ShowResultsEvent, {"next_round": self.get_round().current_question.next is None})
        if self.get_round().current_question.next is not None:
            self.get_round().current_question = self.get_round().current_question.next

    @check_sequence(GameStage.SHOW_RESULTS, GameStage.NEXT_ROUND)
    def next_round(self):
        if self.current_round.next is not None:
            self.current_round = self.current_round.next
        if self.get_round().info.type == "blitz":
            self.now_blitz = True
        if self.get_round().info.settings.is_test:
            self.teams.erase_test_score()
        self.teams.erase_team_tactic_balance()
        self.teams.erase_teams_state()
        self.emmit_event(NextRound, payload={"next_test": self._is_next_test()})

    def end_game(self):
        self.emmit_event(GameEndedEvent, payload={"next_test": self._is_next_test()})

    def _is_next_test(self) -> bool:
        next_round: Round = self.current_round.next
        re = False
        if next_round:
            re = next_round.value.base_round.settings.is_test
        return re

    def _is_next_blitz(self) -> bool:
        next_round: Round = self.current_round.next
        re = False
        if next_round:
            re = next_round.value.base_round.type == "blitz"
        return re

    def is_media_exists(self) -> bool:
        media = self.get_round().get_question().media_data
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

    def payload_state(self):
        data = self.get_round().base_round
        p = {"current_round": self.current_round.idx, "current_question": self.get_round().current_question.idx,
             "all_rounds": len(self.rounds),
             'all_questions': len(self.get_round().questions),
             "stage": self.stage.name,
             "teams": [i.model_dump() for i in self.teams.get_all_teams()],
             "question": self.get_round().get_question().model_dump(),
             "next_test": self._is_next_test(),
             "next_blitz": self._is_next_blitz(),
             "round": data.model_dump(),
             "next_round": self.get_round().current_question.next is None,
             "timer": self.current_time,
             "skip_emails": self.base_scenario.game_settings.skip_emails
             }
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
        except Exception as e:
            logger.warning(e)
        self.restore_game_state()

    def get_add_info(self):
        return self.base_scenario.game_info.model_dump()

    # def _replicate_to_other_file(self):
    #     dumps = os.listdir("config")
    #     max_dump_num = 0
    #     for dump in dumps:
    #         if "db_" in dump:
    #             try:
    #                 num = int(dump.split("_")[-1].replace(".json", ""))
    #                 if num > max_dump_num:
    #                     max_dump_num = num
    #             except Exception as e:
    #                 logger.warning(str(e))
    #                 max_dump_num = 0
    #                 break
    #     db_dump = TinyDB(f'config/db_{max_dump_num + 1}.json')
    #     db_dump.table(GameState.__name__).insert(GameState(**vars(self)).dict())
    #     for team in self.teams.get_all_teams():
    #         db_dump.table(TeamModel.__name__).insert(team.dict())
