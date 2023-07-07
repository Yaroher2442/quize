""" pyinstaller --onedir --console --collect-all asyncio --collect-all sanic --paths "./venv/Lib/site-packages" --add-data "./config;config/"  cli.py """
from subprocess import Popen
import os
from distutils.dir_util import copy_tree


class BuildError(Exception):
    def __init__(self, strs):
        self.strs = strs

    def __str__(self):
        return self.strs


if __name__ == '__main__':
    pyinstaller_string = "pyinstaller --clean --noconfirm cli.spec"
    process = Popen(pyinstaller_string)
    exit_code = process.wait()
    if exit_code == 0:
        try:
            copy_tree("config", "dist/config")
            copy_tree("source/templates/player/build_front", "dist/front/player/build_front")
            copy_tree("source/templates/lead/build_front", "dist/front/lead/build_front")
            copy_tree("source/templates/monitor/build_front", "dist/front/monitor/build_front")
            new_name = 'build_1.7z'
            try:
                os.remove(rf"C:\Pycharm\quize_software\dist\{new_name}")
            except:
                pass
            try:
                os.remove(os.path.join(os.getcwd(), "dist", "config", "db.json"))
            except:
                pass
        except Exception as e:
            raise BuildError(f"Cant file operation cause {e.__str__()}")
    else:
        raise BuildError("Build failed by PYINSTALLER")
