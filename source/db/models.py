from typing import List, Union, Dict

from pydantic import BaseModel


class UserModel(BaseModel):
    user_name: str
    email: str


class TeamTacticBalance(BaseModel):
    remove_answer: int
    one_for_all: int
    question_bet: int
    all_in: int
    team_bet: int


class ResultModelCounted(BaseModel):
    base_score: float
    remove_answer: int
    earned_points: float
    correct: bool
    once_correct: bool
    correct_in_row_reached: bool

    one_for_all: bool
    question_bet: float
    all_in: bool
    team_bet: Union[str, None] = None

    question_bet_score: float
    team_bet_score: float


class TeamModel(BaseModel):
    uid: str
    team_name: str
    avatar: str
    table_num: int
    current_place: int
    current_score: float
    correct_in_row: int
    current_tactic: Union[str, None] = None
    current_answer: Union[str, None] = None
    current_blitz_answers: Dict
    tactic_balance: TeamTacticBalance
    users: Union[List[UserModel], None] = None
    current_counted: ResultModelCounted


class GameState(BaseModel):
    current_round: int
    current_question: int
    now_blitz: bool
    is_finished: bool
    stage: str
    prv_stage: str
    current_time: int


class GameInfo(BaseModel):
    uuid: str
