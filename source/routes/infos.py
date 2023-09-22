import os.path

from sanic import json, Request, response
from sanic.exceptions import FileNotFound, InvalidUsage
from sanic.views import HTTPMethodView

from source.tools.uuid import check_uuid


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
    @staticmethod
    def get_avatars():
        path = os.path.join(os.getcwd(), 'config', "media", "image", "avatar")
        if not os.path.exists(path) or not os.path.isdir(path):
            return []
        return [i for i in os.listdir(path) if "default" not in i and not check_uuid(i.split(".")[0])]

    async def get(self, request: Request):
        return json(self.get_avatars())


class AcquiredAvatars(HTTPMethodView):
    async def get(self, request: Request):
        return json(request.app.ctx.game.teams.acquired_avatars())
