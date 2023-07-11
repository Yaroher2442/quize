from typing import Dict, List, Union, Optional, Any

JSONserializeble = Union[Optional[Dict[str, Any]], Optional[List[Dict[str, Any]]]]


class SseEvent:
    name: str
    payload: JSONserializeble
    teams: JSONserializeble

    def __init__(self, teams: JSONserializeble, payload: JSONserializeble = None):
        self.payload = payload
        self.teams = teams

    @staticmethod
    def all_names():
        return [cls.name for cls in SseEvent.__subclasses__()]

    @staticmethod
    def all_classes():
        return SseEvent.__subclasses__()


class NewTeamEvent(SseEvent):
    name = "new_team"


class StartGameEvent(SseEvent):
    name = "start"


class NextQuestionEvent(SseEvent):
    name = "next_question"


class ShowMediaBeforeEvent(SseEvent):
    name = "media_before"


class ShowQuestionsEvent(SseEvent):
    name = "show_question"


class ShowAnswersEvent(SseEvent):
    name = "show_answers"


class ShowCorrectAnswersEvent(SseEvent):
    name = "show_correct"


class ShowMediaAfterEvent(SseEvent):
    name = "media_after"


class ShowResultsEvent(SseEvent):
    name = "show_results"


class NextRound(SseEvent):
    name = "next_round"


class GameEndedEvent(SseEvent):
    name = "game_end"


# ---------------------------TEAMS-------------------------

class TeamWasRemoved(SseEvent):
    name = "team_was_removed"


class TeamWasUpdated(SseEvent):
    name = "team_was_updated"


class TeamChoseTactic(SseEvent):
    name = "team_chose_tactic"


class AllTeamChosenTactic(SseEvent):
    name = "all_teams_chosen_tactic"


class TeamChoseAnswer(SseEvent):
    name = "team_chose_answer"


class AllTeamAnswered(SseEvent):
    name = "all_teams_chosen_answer"


class TimerTickEvent(SseEvent):
    name = "timer_tick"


class AcquireAvatarEvent(SseEvent):
    name = "acquire_avatar"
