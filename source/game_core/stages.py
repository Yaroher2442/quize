from enum import Enum


class GameStage(Enum):
    WAITING_START = 1
    WAITING_NEXT = 2
    CHOSE_TACTICS = 3
    ALL_CHOSE = 4
    SHOW_MEDIA_BEFORE = 5
    SHOW_QUESTION = 6
    CHOSE_ANSWERS = 7
    ALL_ANSWERED = 8
    SHOW_MEDIA_AFTER = 9
    SHOW_CORRECT_ANSWER = 10
    SHOW_RESULTS = 11
    NEXT_ROUND = 12

    def next(self):
        if self.value + 1 > 11:
            return GameStage(2)
        return GameStage(self.value + 1)

    def prev(self):
        if self.value - 1 < 1:
            return GameStage.WAITING_START
        return GameStage(self.value - 1)

    @staticmethod
    def all_names():
        return {i.name: i for i in GameStage}


# print(GameStage.all_names())
