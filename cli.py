import multiprocessing
import traceback
from functools import partial

import click
from pyee.asyncio import AsyncIOEventEmitter
from sanic import Sanic
from sanic.worker.loader import AppLoader
from sanic_cors import CORS
from tinydb import TinyDB

from source.app import HttpApp
from source.game_core.game import QuizeGame
from source.log_handler import setup_loggers
from source.routes.admin import AdminReloadState, AdminResetGame, AdminGetData
from source.routes.controls import *
from source.routes.infos import *
from source.routes.teams import *
from source.sse.sse import SSEController


def sanic_factory(scenario_file: str) -> Sanic:
    sanic = Sanic.get_app("test", force_create=True)
    game = QuizeGame(scenario_file, TinyDB('config/db.json'))
    game.emitter = AsyncIOEventEmitter()
    game.sanic = sanic

    async def setup_worker_context(app: Sanic):
        app.ctx.emitter = game.emitter
        app.ctx.game = game

    sanic.register_listener(setup_worker_context, "before_server_start")
    CORS(sanic)
    sanic.static("/player/ui", file_or_directory="./front/player/build_front", name="player_ui")
    sanic.static("/player/ui/static", file_or_directory="./front/player/build_front/static", name="player_ui_static")
    sanic.static("/lead/ui", file_or_directory="./front/lead/build_front", name="lead_ui")
    sanic.static("/lead/ui/static", file_or_directory="./front/lead/build_front/static", name="lead_ui_static")
    sanic.static("/monitor/ui", file_or_directory="./front/monitor/build_front", name="monitor_ui")
    sanic.static("/monitor/ui/static", file_or_directory="./front/monitor/build_front/static", name="monitor_ui_static")
    sanic.static("/admin/ui", file_or_directory="./front/admin/build_front", name="admin_ui")
    sanic.static("/admin/ui/static", file_or_directory="./front/admin/build_front/static", name="admin_ui_static")
    sanic.add_route(SSEController.as_view(), "/event")
    sanic.add_route(GameAddInfo.as_view(), "/game/info")
    sanic.add_route(RoundSettingsApi.as_view(), "/game/round_settings")
    sanic.add_route(StartGame.as_view(), "/game/start")
    sanic.add_route(NextQuestionApi.as_view(), "/game/next_question")
    sanic.add_route(ShowMediaBefore.as_view(), "/game/media/before")
    sanic.add_route(ShowQuestions.as_view(), "/game/show_question")
    sanic.add_route(ShowAnswers.as_view(), "/game/show_answers")
    sanic.add_route(ShowCorrectAnswers.as_view(), "/game/show_correct")
    sanic.add_route(ShowMediaAfter.as_view(), "/game/media/after")
    sanic.add_route(ShowResults.as_view(), "/game/show_results")
    sanic.add_route(ShowNextRound.as_view(), "/game/next_round")
    sanic.add_route(EndGameRound.as_view(), "/game/end_game")
    sanic.add_route(BlitzFinish.as_view(), "/game/blitz_finish")
    sanic.add_route(GetState.as_view(), "/game/state")
    sanic.add_route(Avatars.as_view(), "/game/avatars")
    sanic.add_route(AcquiredAvatars.as_view(), "/game/avatars/acquired")
    sanic.add_route(UploadAvatar.as_view(), "/game/avatars/<uid:str>/upload")
    sanic.add_route(Media.as_view(), "/game/<st_path:path>")
    sanic.add_route(RegisterTeamApi.as_view(), "/team")
    sanic.add_route(AcquireAvatar.as_view(), "/team/<uid:str>/avatar")
    sanic.add_route(GetAllTeams.as_view(), "/team/all")
    sanic.add_route(TeamApi.as_view(), "/team/<uid:str>")
    sanic.add_route(TeamTactic.as_view(), "/team/<uid:str>/tactic")
    sanic.add_route(TeamChoseAnswer.as_view(), "/team/<uid:str>/answer")
    sanic.add_route(TeamBlitzChoseAnswer.as_view(), "/team/<uid:str>/answer/blitz")
    sanic.add_route(AdminReloadState.as_view(), "admin/reload")
    sanic.add_route(AdminResetGame.as_view(), "admin/reset")
    sanic.add_route(AdminGetData.as_view(), "admin/data")

    setup_loggers()
    return sanic


@click.command()
@click.option('--scenario', default="scenario.json", required=False, type=str)
def main(scenario: str = "scenario.json"):
    loader = AppLoader(factory=partial(sanic_factory, scenario_file=scenario))
    app = loader.load()
    app.prepare(host="0.0.0.0", port=8844, single_process=True)
    Sanic.serve(primary=app, app_loader=loader)
    traceback.print_exc()


if __name__ == '__main__':
    multiprocessing.freeze_support()
    main()
