import click
from tinydb import TinyDB

from source.app import HttpApp
from source.game_core.game import QuizeGame
from threading import Thread
from source.interface.gui import UiThread, TechnicalGUI


@click.command()
@click.option('--scenario', default="scenario.json", required=False, type=str)
def main(scenario: str = "scenario.json"):
    db = TinyDB(f'config/db.json')
    try:
        game = QuizeGame(scenario, db)
        app = HttpApp(game)
        app.run()

    except Exception:
        db.close()
        import traceback

        traceback.print_exc()
        input("Program crashed; press Enter to exit")


if __name__ == '__main__':
    main()
