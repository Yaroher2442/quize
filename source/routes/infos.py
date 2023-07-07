import os.path

from loguru import logger
from sanic import json, Request, response

from sanic.views import HTTPMethodView
from sanic.exceptions import FileNotFound, InvalidUsage


class RoundSettingsApi(HTTPMethodView):
    async def get(self, reqest: Request):
        return json(reqest.app.ctx.game.get_round_settings().dict())


class GameAddInfo(HTTPMethodView):
    async def get(self, reqest: Request):
        return json(reqest.app.ctx.game.get_add_info())


class Media(HTTPMethodView):
    async def get(self, request: Request, st_path: str):
        path = os.path.join(os.getcwd(), 'config', st_path.replace("/", "\\"))
        if not os.path.exists(path):
            raise FileNotFound("File not found", path, request.path)
        if "mpeg" in path:
            mime_type = "video/mpeg"
        elif "mp4" in path:
            mime_type = "video/mp4"
        elif "webm" in path:
            mime_type = "video/webm"
        elif "jpg" in path:
            mime_type = "image/jpg"
        elif "jpeg" in path:
            mime_type = "image/jpeg"
        elif "png" in path:
            mime_type = "image/png"
        elif "gif" in path:
            mime_type = "image/gif"
        else:
            raise InvalidUsage(message="Invalid type of media")
        # if "video" in mime_type:
        #     from sanic.response import HTTPResponse
        #     from base64 import b32encode
        #     r = HTTPResponse()
        #     logger.warning(mime_type)
        #     r.headers = {
        #         "Content-Type": f"{mime_type}"
        #     }
        #     with open(path, 'rb') as f:
        #         r.body = b32encode(f.read())
        #     return r
        # else:
        return await response.file(
            path,
            mime_type=mime_type,
            headers={
                # "Content-Disposition": f'Attachment; filename="{os.path.basename(path)}"',
                "Content-Type": f"{mime_type}",
            },
        )


class Avatars(HTTPMethodView):
    async def get(self, request: Request):
        return json(request.app.ctx.game.get_avatars())


class AcquiredAvatars(HTTPMethodView):
    async def get(self, request: Request):
        return json(request.app.ctx.game.acquired_avatars())
