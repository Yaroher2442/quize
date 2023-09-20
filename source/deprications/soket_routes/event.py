import json
from asyncio import Queue
from enum import Enum
from typing import List, Union
from pydantic import BaseModel


class EventCell(Enum):
    LEAD = 1
    TEAMS = 2
    MONITOR = 3


class EventContext(BaseModel):
    name: Union[None, str] = None

    @property
    def context(self):
        context = self.dict()
        if not self.name:
            context.update({"event_name": self.__class__.__name__})
        else:
            context.update({"event_name": self.name})
        context.pop("name")
        return context


class Event():
    def __init__(self, data: EventContext, cell: EventCell):
        self.data = data
        self.cell = cell

    def __repr__(self):
        return f"{self.data.__class__.__name__}, {self.cell}"

    @property
    def payload(self):
        return json.dumps(self.data.context)


class MultipleCellEvent:
    def __init__(self, data: EventContext, cells: List[EventCell]):
        self.data = data
        self.cells = cells

    def __repr__(self):
        return f"{self.data.__class__.__name__}, {[i for i in self.cells]}"

    @property
    def events_list(self) -> List[Event]:
        return [Event(self.data, cell) for cell in self.cells]


class EventManager:
    def __init__(self):
        self.events = Queue(maxsize=100)

    @property
    def has_events(self):
        return not self.events.empty()

    def sent_event(self, event: Union[Event, MultipleCellEvent]):
        if isinstance(event, MultipleCellEvent):
            for ev in event.events_list:
                self.events.put_nowait(ev)
        else:
            self.events.put_nowait(event)

    def get_next_event(self):
        return self.events.get_nowait()

    def pushback_event(self, event: Event):
        self.sent_event(event)
