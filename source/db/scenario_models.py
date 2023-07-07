from pydantic import BaseModel, ValidationError, validator, constr
from typing import List, Dict, Optional, Union


class TacticsScenario(BaseModel):
    remove_answer: int
    one_for_all: int
    question_bet: int
    all_in: int
    team_bet: int


class ImageScenario(BaseModel):
    player_displayed: bool
    before: str
    after: str


class VideoScenario(BaseModel):
    before: str
    after: str


class MediaDataScenario(BaseModel):
    show_image: bool
    image: ImageScenario
    video: VideoScenario


class QuestionScenario(BaseModel):
    type: str
    question: str
    answers: Union[str, List[str]]
    correct_answer: str
    time_to_answer: int
    media_data: MediaDataScenario


class BlitzQuestionScenario(BaseModel):
    id: int
    type: str
    question: str
    correct_answer: str


class SettingsScenario(BaseModel):
    is_test: bool
    name: str
    display_name: bool
    time_to_answer: int
    use_special_tactics: Union[bool, None]
    blitz_score: Union[int, None]


class BlitzRoundScenario(BaseModel):
    type: str
    settings: SettingsScenario
    questions: List[BlitzQuestionScenario]


class RoundScenario(BaseModel):
    type: str
    settings: SettingsScenario
    questions: List[QuestionScenario]


class GameSettingsScenario(BaseModel):
    tactics: TacticsScenario
    skip_emails: bool


class GameAddInfo(BaseModel):
    name: str
    theme: str
    client: str
    date: str


class AvatarScenario(BaseModel):
    path: str


class GameScenario(BaseModel):
    game_info: GameAddInfo
    game_settings: GameSettingsScenario
    rounds: List[Union[RoundScenario, BlitzRoundScenario]]
