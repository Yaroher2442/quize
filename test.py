import asyncio
import os
import pprint
import uuid

import loguru
from Levenshtein import distance
from pyee import AsyncIOEventEmitter
from tinydb import TinyDB

from source.db.models import TeamTacticBalance, ResultModelCounted
from source.game_core.game import QuizeGame
from source.game_core.stages import GameStage
from source.game_core.teams import TeamModel
from source.routes.dto import AnswerChosePOST, TacticChosePOST


def create_team(team_name: str, table_num: int):
    tactic_b = TeamTacticBalance(
        remove_answer=10,
        one_for_all=10,
        question_bet=10,
        all_in=10,
        team_bet=10
    )
    # without
    tactic_counter = ResultModelCounted(base_score=0,
                                        remove_answer=0,
                                        earned_points=0.0,
                                        one_for_all=False,
                                        question_bet=0,
                                        all_in=False,
                                        team_bet=None,
                                        correct=False,
                                        once_correct=False,
                                        question_bet_score=0.0,
                                        team_bet_score=0.0,
                                        correct_in_row_reached=False
                                        )

    team_obj = TeamModel(uid=uuid.uuid4().__str__(),
                         team_name=team_name,
                         table_num=table_num,
                         tactic_balance=tactic_b,
                         current_score=0.0,
                         correct_in_row=0,
                         current_place=0,
                         current_tactic=None,
                         current_answer=None,
                         current_blitz_answers={},
                         current_counted=tactic_counter,
                         avatar="")
    return team_obj


emitter = AsyncIOEventEmitter()


async def team_answer_correct(game: QuizeGame, team: TeamModel):
    await game.teams.team_chose_answer(AnswerChosePOST(
        uid=team.uid,
        answer=game.scenario.rounds[game.current_round - 1].questions[game.current_question - 1].correct_answer,
        time=10,
        remove_answer=0,
    ), emitter)


async def team_answer_fail(game: QuizeGame, team: TeamModel):
    await game.teams.team_chose_answer(AnswerChosePOST(
        uid=team.uid,
        answer="",
        time=10,
        remove_answer=0,
    ), emitter)


async def team_chose_tactic(game: QuizeGame, team: TeamModel, tactic: str, amount=None):
    await game.teams.team_chose_tactic(TacticChosePOST(
        uid=team.uid,
        tactic=tactic,
        amount=amount
    ), emitter)


async def count(game, team_1, team_2):
    await team_answer_correct(game, team_1)
    await team_answer_correct(game, team_2)
    game.teams.count_results()


async def test_round_cycle_correct_in_row(game,
                                          team_1,
                                          team_2,
                                          question: int = 1,
                                          last_val: int = 0,
                                          reached: int = True):
    game.current_question = question
    await count(game, team_1, team_2)
    game.stage = GameStage.SHOW_RESULTS
    game.next_question(emitter)
    await count(game, team_1, team_2)
    game.stage = GameStage.SHOW_RESULTS
    game.next_question(emitter)
    await count(game, team_1, team_2)
    db_team_1 = game.teams.get_team(team_1.uid)
    db_team_2 = game.teams.get_team(team_2.uid)
    assert db_team_1.correct_in_row == last_val
    assert db_team_2.correct_in_row == last_val
    assert db_team_1.current_counted.correct_in_row_reached is reached
    assert db_team_2.current_counted.correct_in_row_reached is reached


async def with_new_env(f, **kwargs):
    if os.path.exists("config/db.json"):
        os.remove("config/db.json")
    db = TinyDB(f'config/db.json')
    game = QuizeGame("scenario.json", db)
    round = kwargs.pop("round")
    game.current_round = round if round else 1
    game.emitter = emitter
    team_1 = create_team("team_1", 1)
    team_2 = create_team("team_2", 2)
    game.teams.add_team(team_1, emitter)
    game.teams.add_team(team_2, emitter)
    game.start_game(emitter)
    res = True
    try:
        await f(game, team_1, team_2, **kwargs)
    except AssertionError as e:
        import traceback
        traceback.print_tb(e.__traceback__)
        res = False
    if not res:
        loguru.logger.error(f"{f.__name__} NOT PASSED: with round {game.current_round} {kwargs}")
    else:
        loguru.logger.success(f"{f.__name__} PASSED: with round {game.current_round} {kwargs}")


async def main():
    await with_new_env(test_round_cycle_correct_in_row, round=2, question=1, last_val=0, reached=True)
    await with_new_env(test_round_cycle_correct_in_row, round=1, question=2, last_val=1, reached=False)
    # await with_new_env(test_round_cycle_correct_in_row, round=2, question=3, last_val=2, reached=False)
    # await with_new_env(test2)


if __name__ == '__main__':
    asyncio.run(main())
