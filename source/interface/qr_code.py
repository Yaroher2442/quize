import base64
from io import BytesIO

import qrcode
from loguru import logger
import socket

class QRCodeGenerator:
    def __init__(self):
        s= socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        self.local_ip = s.getsockname()[0]
        s.close()

    def generate_qr(self, string_template: str, save: bool = False) -> bytes:
        new_str = string_template.replace("<local_ip>", self.local_ip)
        logger.debug(new_str)
        img = qrcode.make(new_str, box_size=9)
        buffered = BytesIO()
        img.save(buffered, format="png")
        if save:
            img.save(f"qr_code_{new_str.split('/')[-1]}.png")
        return base64.b64encode(buffered.getvalue())


if __name__ == '__main__':
    import socket

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    print(s.getsockname()[0])
    s.close()
    # qr = QRCodeGenerator()
    # qr.generate_qr("http://<local_ip>:8888/game/round_settings", save=True)
