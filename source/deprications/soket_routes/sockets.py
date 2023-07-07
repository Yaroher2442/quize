import asyncio
from sanic import Request
from sanic.server.websockets.impl import WebsocketImplProtocol

from config.config_ import conf
from source.deprications.soket_routes.event import *
from source.deprications.soket_routes.event import EventCell
from source.log_handler import LogsHandler
from websockets.connection import State


class WsConnect:
    ws: WebsocketImplProtocol
    entire: str

    def __init__(self, entire: str, ws: WebsocketImplProtocol):
        self.ws = ws
        self.entire = entire


class WsManager:
    enable_routes = ["lead", "monitor", "team"]
    conections: List[WsConnect]

    def __init__(self):
        self.conections = []

    @property
    def state(self):
        return [conn for conn in self.conections if conn.ws.connection.state == State.OPEN]

    def attach_ws(self, conn: WsConnect):
        LogsHandler.debug(f"{conn.ws.io_proto.conn_info.client_ip} open connect as {conn.entire.upper()}")
        self.conections.append(conn)

    async def notify_teams(self, event: Event):
        for _ws in self.conections:
            if _ws.entire == "team":
                await _ws.ws.send(event.payload)


ws_manager = WsManager()


class WebsocketApi:
    @staticmethod
    async def route(reqest: Request, ws: WebsocketImplProtocol, entire: str):
        if entire not in WsManager.enable_routes:
            await ws.close(code=1014)
        ws_conn = WsConnect(entire, ws)
        ws_manager.attach_ws(ws_conn)
        while True:
            while reqest.app.ctx.game.event_manager.has_events:
                event = reqest.app.ctx.game.event_manager.get_next_event()
                if event.cell is EventCell.TEAMS:
                    await ws_manager.notify_teams(event)
                elif "lead" in entire and event.cell is EventCell.LEAD:
                    await ws.send(event.payload)
                elif "monitor" in entire and event.cell is EventCell.MONITOR:
                    await ws.send(event.payload)
                    break
                else:
                    reqest.app.ctx.game.event_manager.pushback_event(event)
                    # LogsHandler.debug(
                    #     f'{event} in PUSHED BACK by {entire.upper()} - {ws.io_proto.conn_info.client_ip}')
                await asyncio.sleep(conf.event_queue_timeout)
            await asyncio.sleep(conf.websocket_timeout)
