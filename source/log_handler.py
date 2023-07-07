import logging
from typing import List, Tuple

from loguru import logger
from queue import Queue


class SanicLogMessage:
    def __init__(self, record):
        self.record = record
        self.msg = " ".join([record.name, record.host, record.request, str(record.status)])


class LogsHandler(logging.Handler):
    gui_logs_queue = Queue()

    def emit(self, record):
        # Retrieve context where the logging call occurred, this happens to be in the 6th frame upward
        logger_opt = logger.opt(depth=6, exception=record.exc_info)
        try:
            if record.name == "sanic.access":
                record.msg = SanicLogMessage(record).msg
            if hasattr(record, "status"):
                if (record.status < 200) or (record.status > 300):
                    logger_opt.warning(record.msg)
                elif record.status > 500:
                    logger_opt.error(record.msg)
                else:
                    logger_opt.log(record.levelname, record.msg)
                self.gui_logs_queue.put_nowait(record.msg)
            else:
                self.gui_logs_queue.put_nowait(record.getMessage())
                logger_opt.log(record.levelname, record.getMessage())
        except Exception as exx:
            logger.warning(f"LOGGER {record.name} ERROR {exx}")
            pass

    @staticmethod
    def debug(message):
        logger.debug(message)
        LogsHandler.gui_logs_queue.put_nowait(message)

    @staticmethod
    def info(message):
        logger.info(message)
        LogsHandler.gui_logs_queue.put_nowait(message)

    @staticmethod
    def warning(message):
        logger.warning(message)
        LogsHandler.gui_logs_queue.put_nowait(message)

    @staticmethod
    def error(message):
        logger.error(message)
        LogsHandler.gui_logs_queue.put_nowait(message)


def setup_loggers():
    for logger_name, logger_obj in logging.root.manager.loggerDict.items():
        logging.getLogger(logger_name).handlers.clear()
        logging.basicConfig(handlers=[LogsHandler()], level=0)
