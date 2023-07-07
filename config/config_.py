import json

from pydantic import BaseModel, ValidationError


class AppConf(BaseModel):
    websocket_timeout: float
    event_queue_timeout: float
    ui_timeout: float


conf = AppConf(**json.loads(open("config/config.json").read()))
