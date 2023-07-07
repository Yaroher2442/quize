class BaseGameException(Exception):
    def __init__(self, exception=None):
        super(BaseGameException, self).__init__(exception)


class RegisterTeamException(BaseGameException):
    pass


class GameFinishedException(BaseGameException):
    pass


class WrongSequence(BaseGameException):
    pass
