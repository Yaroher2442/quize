import asyncio
import io
import json
import re
import time
import uuid
from queue import Queue
from typing import Dict, Optional, List

from loguru import logger
from pydantic import BaseModel
from sanic import Request
from sanic.exceptions import SanicException
from sanic.response import stream, ResponseStream
from source.log_handler import LogsHandler
from sanic.views import HTTPMethodView

from source.sse.sse_event import SseEvent


class SseEventProtocol(BaseModel):
    _DEFAULT_SEPARATOR = "\r\n"

    event_id: Optional[str]
    event_name: str
    data: Optional[Dict]
    retry: Optional[int]

    def _prepare(self):
        buffer = io.StringIO()
        buffer.write('event: ' + self.event_name + self._DEFAULT_SEPARATOR)
        if self.event_id:
            buffer.write('id: ' + self.event_id + self._DEFAULT_SEPARATOR)
        if self.retry:
            buffer.write('retry: ' + str(self.retry) + self._DEFAULT_SEPARATOR)
        if self.data:
            buffer.write('data: ' + json.dumps(self.data))
        else:
            buffer.write('data: ')
        buffer.write("\r\n\r\n")
        return buffer.getvalue()

    @property
    def to_send(self):
        return self._prepare()


class SseConnection():
    ip: str
    state: str
    last_event: str = None

    def __init__(self, request: Request):
        self.ip = request.ip
        self.state = "online"


class SsePool:
    _coonections: List[SseConnection] = []

    def conn(self, request: Request):
        conn = SseConnection(request)
        self._coonections.append(conn)
        return conn

    def close(self, conn: SseConnection):
        self._coonections.pop(self._coonections.index(conn))

    @property
    def coons(self):
        return self._coonections


conn_pool = SsePool()


class SSEController(HTTPMethodView):
    async def get(self, request: Request) -> ResponseStream:
        conn = conn_pool.conn(request)
        ev = Queue()

        async def write_event(event: SseEvent):
            nonlocal ev
            nonlocal conn
            nonlocal request
            conn.last_event = event.name
            e_payload = {"payload": event.payload,"teams": event.teams}
            proto = SseEventProtocol(event_id=str(uuid.uuid4()),
                                     event_name=event.name, data=e_payload)
            ev.put(proto.to_send)

        for name in SseEvent.all_names():
            request.app.ctx.emitter.on(name, write_event)

        async def sent_ping(response: ResponseStream):
            logger.debug(f"SSE Ping to {request.ip} ACVTIVE")
            while True:
                try:
                    logger.debug(f"SSE Ping to {request.ip}")
                    proto = SseEventProtocol(event_name="ping")
                    await response.write(proto.to_send.encode())
                    await asyncio.sleep(10)
                except:
                    return

        async def streaming(response: ResponseStream):
            ping_task = request.app.loop.create_task(sent_ping(response))
            nonlocal ev
            try:
                while True:
                    if not response.stream:
                        break
                    while not ev.empty():
                        await response.write(ev.get().encode())
                    await asyncio.sleep(0.1)
            finally:
                ping_task.cancel()
                # await response.eof()
                logger.error("sse disconnected")
                conn_pool.close(conn)

        # headers = {"keep-alive": "timeout=500, max=1000"}
        "text/json; charset=utf-8"
        return stream(streaming, headers={}, content_type="text/event-stream; charset=utf-8")
