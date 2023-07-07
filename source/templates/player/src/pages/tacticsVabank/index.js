import React from 'react';
import {RequestHandler, AppStore} from "utils";
import './style.css';

const TacticsVabank = () => {
    const request = new RequestHandler();

    const {
        accentColor,
        currentScore,
    } = AppStore.useState(s => ({
        accentColor: s.accentColor,
        currentScore: s.currentScore,
    }));

    const goToPrevPage = () => {
        AppStore.update(s => {s.gamePage = 'chooseTactics'});
    };

    const goToNextPage = async () => {
        await request.chooseTactic({
            "tactic": 'all_in',
            "amount": null
        });
        AppStore.update(s => {
            s.currentTactic = 'all_in';
            s.gamePage = 'textBeforeQuestion';
        });
    };

    return(
        <section className="tactics-vabank">
            <h2>Выбрана тактика<br/>”Ва-банк”</h2>
            <h3 className="yellow-title">У вас сейчас</h3>
            <input type="text" className="tactics-vabank__points-input" readOnly placeholder={currentScore + ' баллов'}/>
            <h3 className="yellow-title">
                Внимание!<br/>
                Выигрыш удвоит ваши баллы,<br/>
                но не забывайте, что вы рискуете<br/>
                потерять все!
            </h3>
            <div className="small-buttons-container">
                <button className="button-small" onClick={() => goToPrevPage()} style={{'color': accentColor}}>Назад</button>
                <button className="button-small" onClick={() => goToNextPage()} style={{'color': accentColor}}>Подтвердить</button>
            </div>
        </section>
    )
}

export default TacticsVabank;