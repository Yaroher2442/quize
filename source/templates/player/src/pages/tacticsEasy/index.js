import React from 'react';
import {RequestHandler, AppStore} from "utils";
import './style.css';

const TacticsEasy = () => {
    const request = new RequestHandler();


    const {
        accentColor,
    } = AppStore.useState(s => ({
        accentColor: s.accentColor,
    }));

    const goToPrevPage = () => {
        AppStore.update(s => {s.gamePage = 'chooseTactics'});
    };

    const goToNextPage = async () => {
        await request.chooseTactic({
            "tactic": 'without',
            "amount": null
        });
        AppStore.update(s => {
            s.currentTactic = 'without';
            s.gamePage = 'textBeforeQuestion';
        });
    };

    return(
        <section className="tactics-easy">
            <h2>Выбрана<br/>Простая игра</h2>
            <div className="small-buttons-container">
                <button className="button-small" onClick={() => goToPrevPage()} style={{'color': accentColor}}>Назад</button>
                <button className="button-small" onClick={() => goToNextPage()} style={{'color': accentColor}}>Подтвердить</button>
            </div>
        </section>
    )
}

export default TacticsEasy;