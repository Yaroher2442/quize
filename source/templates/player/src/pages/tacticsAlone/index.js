import React from 'react';
import {RequestHandler, AppStore} from "utils";
import {toast} from "react-toastify";
import './style.css';

const TacticsAlone = () => {

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
            "tactic": 'one_for_all',
            "amount": null
        });
        AppStore.update(s => {
            s.currentTactic = 'one_for_all';
            s.gamePage = 'textBeforeQuestion'
        });
        toast('Ожидайте ведущего', {toastId: 'wait'});
    };

    return(
        <section className="tactics-alone">
            <h2>Выбрана тактика<br/>”Один за всех”</h2>
            <h3 className="yellow-title">Внимание!<br/>За столом должен остаться<br/>один игрок</h3>
            <div className="small-buttons-container">
                <button className="button-small" onClick={() => goToPrevPage()} style={{'color': accentColor}}>Назад</button>
                <button className="button-small" onClick={() => goToNextPage()} style={{'color': accentColor}}>Подтвердить</button>
            </div>
        </section>
    )
}

export default TacticsAlone;