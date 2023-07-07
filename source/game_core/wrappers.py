from typing import Union, List

from source.exceptions import *
from source.game_core.game import *
from source.log_handler import LogsHandler
import inspect
from loguru import logger


def check_sequence(now: Union[List[GameStage], GameStage], next: GameStage):
    def innner(method):
        def wrap(*args):
            cls_self = args[0]
            if not cls_self.now_blitz:
                if isinstance(now, list):
                    # LogsHandler.info(f"{cls_self.stage.name} , now= {[i.name for i in now]} next= {next.name}")
                    if cls_self.stage not in now:
                        cls_self.write_snapshot()
                        raise WrongSequence(
                            f"Wrong sequence, now state: {cls_self.stage.name} ,expected: {[i.name for i in now]}")
                else:
                    # LogsHandler.info(f"{cls_self.stage.name} , now= {now.name} next= {next.name}")
                    if cls_self.stage != now:
                        cls_self.write_snapshot()
                        raise WrongSequence(f"Wrong sequence, now state: {cls_self.stage.name} ,expected: {now.name}")
            method_result = method(*args)
            if cls_self.now_blitz and (cls_self.stage in [GameStage.WAITING_NEXT, GameStage.SHOW_RESULTS]):
                cls_self.prv_stage = cls_self.stage
                cls_self.stage = GameStage.SHOW_QUESTION
            elif cls_self.now_blitz and cls_self.stage == GameStage.ALL_ANSWERED:
                cls_self.prv_stage = cls_self.stage
                cls_self.stage = GameStage.SHOW_CORRECT_ANSWER
            else:
                cls_self.prv_stage = cls_self.stage
                cls_self.stage = next
            cls_self.write_snapshot()
            return method_result

        return wrap

    return innner


def write_game_snapshot(method):
    def wrap(*args):
        cls_self = args[0]
        method_result = method(*args)
        cls_self.snapshot.game_state_snaphot(cls_self)
        return method_result

    return wrap


def resolver_change(method):
    def wrap(*args):
        cls_self = args[0]
        return method(*args)

    return wrap
