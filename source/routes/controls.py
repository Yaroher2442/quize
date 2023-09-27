from sanic import exceptions as sanic_exc
from sanic import json, Request

from source.exceptions import *
from sanic.views import HTTPMethodView


class GetState(HTTPMethodView):
    async def get(self, request: Request):
        try:
            return json(request.app.ctx.game.payload_state())
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class BlitzFinish(HTTPMethodView):
    async def post(self, request: Request):
        try:
            await request.app.ctx.game.teams.finish_blitz()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class StartGame(HTTPMethodView):
    async def post(self, request: Request):
        try:
            resp = request.app.ctx.game.start_game()
            return json(resp)
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class NextQuestionApi(HTTPMethodView):
    async def post(self, request: Request):
        try:
            question = request.app.ctx.game.next_question()
            q = {"state": request.app.ctx.game.payload_state()}
            q.update(question)
            return json(q)
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class ShowMediaBefore(HTTPMethodView):
    async def post(self, request: Request):
        try:
            request.app.ctx.game.show_media_before()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class ShowQuestions(HTTPMethodView):
    async def post(self, request: Request):
        try:
            request.app.ctx.game.show_question()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class ShowAnswers(HTTPMethodView):
    async def post(self, request: Request):
        try:
            request.app.ctx.game.show_answers()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class ShowCorrectAnswers(HTTPMethodView):
    async def post(self, request: Request):
        try:
            request.app.ctx.game.show_correct_answers()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class ShowMediaAfter(HTTPMethodView):
    async def post(self, request: Request):
        try:
            request.app.ctx.game.show_media_after()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class ShowResults(HTTPMethodView):
    async def post(self, request: Request):
        try:
            request.app.ctx.game.show_results()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class ShowNextRound(HTTPMethodView):
    async def post(self, request: Request):
        try:
            request.app.ctx.game.next_round()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class EndGameRound(HTTPMethodView):
    async def post(self, request: Request):
        try:
            request.app.ctx.game.end_game()
            return json({})
        except BaseGameException as e:
            raise sanic_exc.SanicException(e.__str__(), status_code=409)
