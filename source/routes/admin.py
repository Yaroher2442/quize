from sanic import json, Request
from sanic.views import HTTPMethodView

from source.sse.sse import conn_pool
from source.sse.sse_event import AdminReloadEvent
from source.tools.ip import MY_IP


class AdminReloadState(HTTPMethodView):
    async def post(self, request: Request):
        request.app.ctx.game._emmit_event(request.app.ctx.emitter, AdminReloadEvent)
        return json({"status": "ok"})


class AdminResetGame(HTTPMethodView):
    async def post(self, request: Request):
        await request.app.ctx.game.new()
        request.app.ctx.game._emmit_event(request.app.ctx.emitter, AdminReloadEvent)
        return json({"status": "ok"})


class AdminGetData(HTTPMethodView):
    async def get(self, request: Request):
        game_data = {"Stage": str(request.app.ctx.game.stage),
                     "current_round": request.app.ctx.game.current_round,
                     "current_question": request.app.ctx.game.current_question,
                     "now_blitz": request.app.ctx.game.now_blitz,
                     "is_finished": request.app.ctx.game.is_finished,
                     "all_rounds": request.app.ctx.game.all_rounds,
                     "all_questions": request.app.ctx.game.all_questions,
                     "current_time": request.app.ctx.game.current_time}
        data = {"Game": game_data, "SSE": []}
        data["base_url"] = f'http://{MY_IP}:8844'
        for conn in conn_pool.coons:
            data["SSE"].append(
                {"conn_id": conn.ip,
                 "conn_state": conn.state,
                 "last_event": conn.last_event,
                 "team_id": conn.team_id
                 })
        data["Teams"] = request.app.ctx.game.teams.all_json()
        for i in data["Teams"]:
            i["url"] = f'http://{MY_IP}:8844/player/ui/index.html?team_id={i["uid"]}'
        return json(data)
