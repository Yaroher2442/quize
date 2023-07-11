import os
import uuid

from loguru import logger
from pydantic import ValidationError
from sanic import exceptions as sanic_exc
from sanic import json, Request
from sanic.request import File
from sanic.views import HTTPMethodView, stream

from source.db.models import *
from source.exceptions import *
from source.routes.dto import *


class RegisterTeamApi(HTTPMethodView):
    async def post(self, request: Request):
        try:
            tactic_b = TeamTacticBalance(
                **request.app.ctx.game.get_tactic_balance().dict())
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
                                 tactic_balance=tactic_b,
                                 current_score=0.0,
                                 correct_in_row=0,
                                 current_place=0,
                                 current_tactic=None,
                                 current_answer=None,
                                 current_blitz_answers={},
                                 current_counted=tactic_counter,
                                 avatar="",
                                 **request.json)
            request.app.ctx.game.teams.add_team(team_obj, request.app.ctx.emitter)
            return json({"team_id": team_obj.uid})
        except ValidationError:
            raise sanic_exc.SanicException("Can't parse json")
        except BaseGameException as e:
            logger.error(e)
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class GetAllTeams(HTTPMethodView):
    async def get(self, request: Request):
        return json({"teams": [team.dict() for team in request.app.ctx.game.teams.get_all_teams()]})


class TeamApi(HTTPMethodView):

    async def get(self, request: Request, uid: str):
        team = request.app.ctx.game.teams.get_team(uid)
        return json(team.dict())

    async def patch(self, request: Request, uid: str):
        try:
            new_name = request.json["new_name"]
            update = request.app.ctx.game.teams.update_team_name(request.app.ctx.emitter, uid, new_name)
            return json({"team_id": uid, "status": update})
        except BaseGameException as e:
            logger.error(e)
            raise sanic_exc.SanicException(e.__str__(), status_code=409)

    async def delete(self, request: Request, uid: str):
        try:
            removed = await request.app.ctx.game.teams.drop_team(request.app.ctx.emitter, uid)
            return json({"team_id": uid, "status": "removed"})
        except BaseGameException as e:
            logger.error(e)
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class TeamTactic(HTTPMethodView):
    async def post(self, request: Request, uid: str):
        if uid in request.app.ctx.game.teams:
            try:
                dto = TacticChosePOST(uid=uid, **request.json)
                await request.app.ctx.game.teams.team_chose_tactic(dto, request.app.ctx.emitter)
                return json({})
            except ValidationError:
                raise sanic_exc.SanicException("Can't parse json")
            except BaseGameException as e:
                logger.error(e)
                raise sanic_exc.SanicException(e.__str__(), status_code=409)
        else:
            raise sanic_exc.Unauthorized("user not found")


class TeamChoseAnswer(HTTPMethodView):
    async def post(self, request: Request, uid: str):
        if uid in request.app.ctx.game.teams:
            try:
                dto = AnswerChosePOST(uid=uid, **request.json)
                await request.app.ctx.game.teams.team_chose_answer(dto, request.app.ctx.emitter)
                return json({})
            except ValidationError:
                raise sanic_exc.SanicException("Can't parse json")
            except BaseGameException as e:
                logger.error(e)
                raise sanic_exc.SanicException(e.__str__(), status_code=409)
        else:
            raise sanic_exc.Unauthorized("user not found")


class TeamBlitzChoseAnswer(HTTPMethodView):
    async def post(self, request: Request, uid: str):
        if uid in request.app.ctx.game.teams:
            try:
                dto = BlitzAnswerChosePOST(uid=uid, **request.json)
                await request.app.ctx.game.teams.team_answer_blitz(request.app.ctx.emitter, dto)
                return json({})
            except ValidationError:
                raise sanic_exc.SanicException("Can't parse json")
            except BaseGameException as e:
                logger.error(e)
                raise sanic_exc.SanicException(e.__str__(), status_code=409)
        else:
            raise sanic_exc.Unauthorized("user not found")


class AcquireAvatar(HTTPMethodView):
    async def post(self, request: Request, uid: str):
        try:
            ress = request.app.ctx.game.teams.acquire_avatar(request.app.ctx.emitter, uid, request.json["path"])
            return json(ress)
        except BaseGameException as e:
            logger.error(e)
            raise sanic_exc.SanicException(e.__str__(), status_code=409)


class UploadAvatar(HTTPMethodView):
    async def post(self, request: Request, uid: str):
        try:
            upload_file: File = request.files.get('image')
            id = str(uuid.uuid4())
            type = "." + upload_file.type.split("/")[-1]
            path = os.path.join(os.getcwd(), 'config', "media", "image", "avatar", id + type)
            with open(path, "wb") as f:
                f.write(upload_file.body)
            request.app.ctx.game.teams.upload_avatar(uid, id + type)
            return json({"path": id + type})
        except Exception as e:
            logger.error(e)
            raise sanic_exc.SanicException(e.__str__(), status_code=400)
