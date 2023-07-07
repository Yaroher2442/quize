import asyncio
import socket
import threading
import traceback
from tkinter import filedialog as fd
import PySimpleGUI as sg
import loguru
import qrcode
from loguru import logger
from pyee.asyncio import AsyncIOEventEmitter
import csv
from config.config_ import conf
from source.game_core.game import QuizeGame
from source.game_core.stages import GameStage
from source.interface.qr_code import QRCodeGenerator
from source.log_handler import LogsHandler
from source.sse.sse import conn_pool


class TechnicalGUI:
    def __init__(self, game: QuizeGame, emitter: AsyncIOEventEmitter):
        super(TechnicalGUI, self).__init__()
        self.loop = asyncio.new_event_loop()
        self.game = game
        self.emitter = emitter
        self.qr = QRCodeGenerator()
        sg.theme('DarkBlue2')  # Keep things interesting for your users

    def _create_layout(self):

        game_tab = [
            [
                sg.Column([
                    [sg.Table([[]], expand_x=True, headings=["value", "curr_state"], key="game_table")],

                    [
                        sg.T("CONTROLS"),
                        sg.Button("round -"),
                        sg.Button("round +"),
                        sg.Button("question -"),
                        sg.Button("question +"),
                        sg.Button("prev stage"),
                        sg.Button("next stage")
                    ],

                    [sg.T(
                        "------------------------------------------------------------------------------------------")],
                    [
                        sg.T("BEFORE"),
                        sg.Button("waiting_start"),
                        sg.Button("waiting_next"),
                        sg.Button("show_media_before"),
                        sg.Button("show_question"),
                        sg.Button("show_answers"),
                    ],
                    [sg.T(
                        "------------------------------------------------------------------------------------------")],
                    [
                        sg.T("TEAM INPUTS"),
                        sg.Button("chose_tactics"),
                        sg.Button("all_chose"),
                        sg.Button("chose_answers"),
                        sg.Button("all_answered"),
                    ],
                    [sg.T(
                        "------------------------------------------------------------------------------------------")],
                    [
                        sg.T("AFTER"),
                        sg.Button("show_media_after"),
                        sg.Button("show_correct_answer"),
                        sg.Button("show_results"),
                    ],

                    [sg.T(
                        "------------------------------------------------------------------------------------------")],
                    [
                        sg.T("SYSTEM"),
                        sg.Button("Restart All game"),
                        sg.Button("Show Result state"),
                        sg.Button("Next question")
                    ],
                    [sg.T(
                        "------------------------------------------------------------------------------------------")],
                    [
                        sg.T("Actions"),
                        sg.Button("Save teams"),
                    ],
                ], expand_x=True, expand_y=True),
                sg.Column([
                    [sg.Table([[]], expand_x=True, expand_y=True,
                              headings=["team_name",
                                        "current_tactic",
                                        "current_answer",
                                        "current_score"], key="teams_table")]
                ], expand_x=True, expand_y=True),

            ]
        ]

        sys_tab = [
            [
                sg.Table(values=[[]], headings=["num", "ip", "state", "last_event"], key="sse_clients",
                         expand_x=True
                         )
            ],
            [

                sg.Listbox([], key="Logger", expand_x=True, expand_y=True, auto_size_text=True)
            ]
        ]
        qr_tab = [
            [
                sg.Text("                                         "),
                sg.Image(data=self.qr.generate_qr("http://<local_ip>:8844/lead/ui/index.html"), key="-LEAD_QR-"),
                sg.Text("                                                         "),
                sg.Image(data=self.qr.generate_qr("http://<local_ip>:8844/player/ui/index.html"), key="-TEAM_QR-")
            ],
            [
                sg.Text("                                                                     "),
                sg.Text("LEAD", expand_x=True),
                sg.Text("                                                                 "),
                sg.Text("TEAM", expand_x=True),
            ]
        ]

        layout = [
            [
                sg.TabGroup(
                    [
                        [sg.Tab("GAME", game_tab)],
                        [sg.Tab('SYSTEM_INFO', sys_tab)],
                        [sg.Tab("QR_CODE", qr_tab)]
                    ],
                    size=(1280, 720)
                )
            ],
        ]
        return layout

    def _generate_qr(self, conection_string: str):
        local_ip = socket.gethostbyname(socket.gethostname())
        img = qrcode.make(f"http://{local_ip}:8888/game/round_settings")
        type(img)  # qrcode.image.pil.PilImage
        img.save("some_file.png")

    async def _logs_list(self):
        while not LogsHandler.gui_logs_queue.empty():
            old_logs = self.window["Logger"].get_list_values()
            log = LogsHandler.gui_logs_queue.get_nowait()
            self.window["Logger"].update(old_logs + [log])
            self.window['Logger'].set_vscroll_position(100)

    async def _sse_statuses(self):
        num = 0
        update = []
        for conn in conn_pool.coons:
            num += 1
            update.append([num, conn.ip,
                           conn.state,
                           conn.last_event])
        self.window["sse_clients"].update(update)

    async def _game_state(self):
        self.window["game_table"].update([
            ["Stage", self.game.stage],
            ["prv_stage", self.game.prv_stage],
            ["current_round", self.game.current_round],
            ["current_question", self.game.current_question],
            ["now_blitz", self.game.now_blitz],
            ["is_finished", self.game.is_finished],
            ["all_rounds", self.game.all_rounds],
            ["all_questions", self.game.all_questions],
            ["current_time", self.game.current_time]
        ])
        self.window["teams_table"].update(
            [[team.team_name, team.current_tactic, team.current_answer, team.current_score] for team in
             self.game.teams.get_all_teams()
             ])

    async def _state_handler(self):
        await self._logs_list()
        await self._sse_statuses()
        await self._game_state()

    async def _app_loop(self):
        self.window = sg.Window('QUIZ GAME', self._create_layout(), size=(1280, 720))
        while True:
            try:
                event, values = self.window.read(400)
                if event != "__TIMEOUT__":
                    logger.debug(event)
                if event == sg.WIN_CLOSED or event == 'Exit':
                    break
                if event == "Restart All game":
                    await self.game.new()
                if event == "prev stage":
                    self.game.prev_stage()
                if event == "next stage":
                    self.game.next_stage()
                if event == "Next question":
                    self.game.next_question(self.emitter)
                if event == "Show Result state":
                    self.game.stage = GameStage.SHOW_RESULTS

                if event == "waiting_start":
                    self.game.start_game(self.emitter)
                if event == "waiting_next":
                    self.game.next_question(self.emitter)
                if event == "chose_tactics":
                    self.game.stage = GameStage.CHOSE_TACTICS
                if event == "all_chose":
                    self.game.stage = GameStage.ALL_CHOSE
                if event == "show_media_before":
                    self.game.show_media_before(self.emitter)
                if event == "show_answers":
                    self.game.show_answers(self.emitter)
                if event == "show_question":
                    self.game.show_question(self.emitter)
                if event == "chose_answers":
                    self.game.stage = GameStage.CHOSE_ANSWERS
                if event == "all_answered":
                    self.game.stage = GameStage.ALL_ANSWERED
                if event == "show_media_after":
                    self.game.show_media_after(self.emitter)
                if event == "show_correct_answer":
                    self.game.show_correct_answers(self.emitter)
                if event == "show_results":
                    self.game.show_results(self.emitter)

                if event == "Save teams":
                    file = fd.asksaveasfilename(title="Куда сохранить команды", filetypes=[("CSV", "*.csv")],
                                                defaultextension=".csv")
                    with open(file, "w") as f:
                        writer = csv.writer(f)
                        for team in self.game.teams.get_all_teams():
                            writer.writerow(["Имя:", team.team_name, "Номер стола", str(team.table_num)])
                            for user in team.users:
                                writer.writerow(["Имя участника:", user.user_name, "Почта:", user.email])
                if event == "round -":
                    if self.game.current_round > 1:
                        self.game.current_round -= 1
                if event == "round +":
                    if self.game.current_round < self.game.all_rounds:
                        self.game.current_round += 1
                if event == "question -":
                    if self.game.current_question > 1:
                        self.game.current_question -= 1
                if event == "question +":
                    if self.game.current_question < self.game.all_questions:
                        self.game.current_question += 1

                await self._state_handler()
                self.window.refresh()
                await asyncio.sleep(conf.ui_timeout)
            except Exception as e:
                logger.error(str(e), exception=True, backtrace=True, diagnose=True)
                # traceback.print_tb(e.__traceback__)

        self.window.close()
        await self._app_loop()

    async def as_run(self):
        await self._app_loop()


class UiThread(threading.Thread):
    ui: TechnicalGUI

    def __init__(self, ui: TechnicalGUI, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ui = ui

    def run(self) -> None:
        asyncio.run(self.ui.as_run())
