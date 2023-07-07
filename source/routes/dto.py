from typing import Union, List, Optional

from pydantic import BaseModel

from source.deprications.soket_routes.event import EventContext


class TacticChosePOST(BaseModel):
    uid: str
    tactic: str
    amount: Optional[Union[float, str]]


class AnswerChosePOST(BaseModel):
    uid: str
    answer: Optional[str]
    time: int
    remove_answer: int


class BlitzAnswerChosePOST(BaseModel):
    uid: str
    answer: Optional[str]
    id: int
