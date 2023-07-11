import importlib

from pyee.asyncio import AsyncIOEventEmitter
from sanic import Sanic
from sanic_cors import CORS

from source.deprications.soket_routes.sockets import *
from source.interface.gui import TechnicalGUI, UiThread
from source.log_handler import setup_loggers
from source.routes.controls import *
from source.routes.infos import *
from source.routes.teams import *
from source.sse.sse import SSEController


class HttpApp:
    def __init__(self, game):
        super().__init__()
        importlib.import_module("source.game_core.game")
        self.sanic_app = Sanic("__main__")
        self.emitter = AsyncIOEventEmitter()
        self.game = game
        self.game.emitter = self.emitter
        self.game.sanic = self.sanic_app
        self.sanic_app.register_listener(self.setup_worker_context, "before_server_start")
        self.sanic_app.config.NOISY_EXCEPTIONS = True
        CORS(self.sanic_app)
        self._register_api()
        setup_loggers()
        # self.sanic_app.add_task(self.run_ui())
        self.sanic_app.add_task(self.run_ui())

    async def run_ui(self):
        tk = TechnicalGUI(self.game, self.emitter)
        await tk.as_run()

    #     self.sanic_app.add_task(self.thread_ui())

    # async def thread_ui(self):
    #     tk = TechnicalGUI(self.game, self.emitter)
    #     ui = UiThread(tk)
    #     ui.daemon = True
    #     ui.start()

    #     def check_thread_alive(thr):
    #         thr.join(timeout=0.0)
    #         return thr.is_alive()

    #     while True:
    #         if check_thread_alive(ui):
    #             await asyncio.sleep(0.2)
    #         else:
    #             ui.start()

    async def run_ui(self):
        tk = TechnicalGUI(self.game, self.emitter)
        await tk.as_run()

    async def setup_worker_context(self, app: Sanic, loop: asyncio.AbstractEventLoop):
        app.ctx.emitter = self.emitter
        app.ctx.game = self.game

    def _register_api(self):
        self.sanic_app.static("/player/ui", file_or_directory="./front/player/build_front")
        self.sanic_app.static("/player/ui/static", file_or_directory="./front/player/build_front/static")

        self.sanic_app.static("/lead/ui", file_or_directory="./front/lead/build_front")
        self.sanic_app.static("/lead/ui/static", file_or_directory="./front/lead/build_front/static")

        self.sanic_app.static("/monitor/ui", file_or_directory="./front/monitor/build_front")
        self.sanic_app.static("/monitor/ui/static", file_or_directory="./front/monitor/build_front/static")
        self.sanic_app.add_route(SSEController.as_view(), "/event")
        self.sanic_app.add_route(GameAddInfo.as_view(), "/game/info")

        self.sanic_app.add_route(RoundSettingsApi.as_view(), "/game/round_settings")

        self.sanic_app.add_route(StartGame.as_view(), "/game/start")
        self.sanic_app.add_route(NextQuestionApi.as_view(), "/game/next_question")
        self.sanic_app.add_route(ShowMediaBefore.as_view(), "/game/media/before")
        self.sanic_app.add_route(ShowQuestions.as_view(), "/game/show_question")
        self.sanic_app.add_route(ShowAnswers.as_view(), "/game/show_answers")
        self.sanic_app.add_route(ShowCorrectAnswers.as_view(), "/game/show_correct")
        self.sanic_app.add_route(ShowMediaAfter.as_view(), "/game/media/after")
        self.sanic_app.add_route(ShowResults.as_view(), "/game/show_results")
        self.sanic_app.add_route(ShowNextRound.as_view(), "/game/next_round")
        self.sanic_app.add_route(EndGameRound.as_view(), "/game/end_game")

        self.sanic_app.add_route(BlitzFinish.as_view(), "/game/blitz_finish")
        self.sanic_app.add_route(GetState.as_view(), "/game/state")
        self.sanic_app.add_route(Avatars.as_view(), "/game/avatars")
        self.sanic_app.add_route(AcquiredAvatars.as_view(), "/game/avatars/acquired")
        self.sanic_app.add_route(UploadAvatar.as_view(), "/game/avatars/<uid:str>/upload")

        self.sanic_app.add_route(Media.as_view(), "/game/<st_path:path>")

        self.sanic_app.add_route(RegisterTeamApi.as_view(), "/team")
        self.sanic_app.add_route(AcquireAvatar.as_view(), "/team/<uid:str>/avatar")
        self.sanic_app.add_route(GetAllTeams.as_view(), "/team/all")
        self.sanic_app.add_route(TeamApi.as_view(), "/team/<uid:str>")
        self.sanic_app.add_route(TeamTactic.as_view(), "/team/<uid:str>/tactic")
        self.sanic_app.add_route(TeamChoseAnswer.as_view(), "/team/<uid:str>/answer")
        self.sanic_app.add_route(TeamBlitzChoseAnswer.as_view(), "/team/<uid:str>/answer/blitz")

    def run(self):
        self.sanic_app.run(host="0.0.0.0", port=8844)

    async def as_run(self):
        self.sanic_app.run(host="0.0.0.0", port=8844)
