from sanic import json, Request
from sanic.views import HTTPMethodView

from source.sse.sse import conn_pool
from source.sse.sse_event import AdminReloadEvent


class AdminReloadState(HTTPMethodView):
    async def post(self, request: Request):
        request.app.ctx.game.emmit_event(AdminReloadEvent)
        return json({"status": "ok"})


class AdminResetGame(HTTPMethodView):
    async def post(self, request: Request):
        await request.app.ctx.game.new()
        request.app.ctx.game.emmit_event(AdminReloadEvent)
        return json({"status": "ok"})


class AdminGetData(HTTPMethodView):
    async def get(self, request: Request):
        game_data = {"Stage": str(request.app.ctx.game.stage),
                     "current_round": request.app.ctx.game.current_round.idx,
                     "current_question": request.app.ctx.game.get_round().current_question.idx,
                     "now_blitz": request.app.ctx.game.now_blitz,
                     "is_finished": request.app.ctx.game._finished,
                     "all_rounds": len(request.app.ctx.game.rounds),
                     "all_questions": len(request.app.ctx.game.get_round().questions),
                     "current_time": request.app.ctx.game.current_time}
        data = {"Game": game_data, "Teams": []}
        for team in request.app.ctx.game.teams.all_pd():
            for conn in conn_pool.coons:
                if team and conn.team_id and team.uid == conn.team_id:
                    t_data = team.model_dump()
                    t_data.update({"conn_ip": conn.ip,
                                   "conn_state": conn.state,
                                   "last_event": conn.last_event,
                                   "team_id": conn.team_id
                                   })
                    data["Teams"].append(t_data)
        return json(data)
