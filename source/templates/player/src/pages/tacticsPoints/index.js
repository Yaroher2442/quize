import React, {useState} from 'react';
import {RequestHandler, AppStore} from "utils";
import {toast} from "react-toastify";
import './style.css';

const TacticsPoints = () => {
    const request = new RequestHandler();
    const [points, setPoints] = useState(10);

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
            "tactic": 'question_bet',
            "amount": points/100
        });
        AppStore.update(s => {
            s.currentTactic = 'question_bet';
            s.gamePage = 'textBeforeQuestion';
        });
    };

    const addPoints = () => {
        if (points === 30) {
            toast('Ставка не может быть больше 30%', { toastId: 'addPoints'});
        }
        else {
            setPoints(points + 10);
        }
    };

    const reducePoints = () => {
        if (points === 10) {
            toast('Ставка не может быть меньше 10%', { toastId: 'reducePoints'});
        } else {
            setPoints(points - 10);
        }
    };

    const calcBet = () => {
        const bet = (points / 100 * currentScore).toString();
        const mainInt = bet.split('.')[0];
        const sliceLength = mainInt.length + 2;
        return bet.slice(0, sliceLength);
    };

    return(
        <section className="tactics-points">
            <h2>Выбрана тактика<br/>”Баллы на бочку”</h2>
            <div>
                <h3 className="yellow-title">У вас сейчас</h3>
                <input type="text" className="tactics-points__points-input" readOnly
                       placeholder={currentScore + ' баллов'}/>
            </div>

            <div>
                <h3 className="yellow-title">Выберите вашу ставку</h3>
                <div className="tactics-points__calc-points">
                    <button onClick={() => reducePoints()} style={{'color': accentColor}}>-</button>
                    <h2>{points}%</h2>
                    <button onClick={() => addPoints()} style={{'color': accentColor}}>+</button>
                </div>
            </div>

            <div>
                <h3 className="yellow-title">Ваша ставка составляет</h3>
                <input type="text" className="tactics-points__points-input" readOnly
                       placeholder={calcBet() + ' баллов'}/>
            </div>

            <div className="small-buttons-container">
                <button className="button-small" onClick={() => goToPrevPage()} style={{'color': accentColor}}>Назад</button>
                <button className="button-small" onClick={() => goToNextPage()} style={{'color': accentColor}}>Подтвердить</button>
            </div>
        </section>
    )
}

export default TacticsPoints;