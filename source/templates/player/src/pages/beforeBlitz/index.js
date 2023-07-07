import React, {useEffect} from 'react';
import {AppStore} from "utils";
import './style.css';

const BeforeBlitz = () => {

    const {
        timeToAnswer,
    } = AppStore.useState(s => ({
        timeToAnswer: s.timeToAnswer,
    }));

    useEffect(() => {
        AppStore.update(s => {
            s.roundType = 'blitz';
            s.currentBlitzQuestionNum = 1
        });
    }, []);

    return(
        <section className="before-blitz">
            <h1>Раунд блиц</h1>
            <div className="before-blitz__total-time">
                <p>{timeToAnswer}</p>
            </div>
            <p className="yellow-title">УСПЕЙТЕ ОТВЕТИТЬ НА МАКСИМАЛЬНОЕ КОЛИЧЕСТВО ВОПРОСОВ ЗА ОТВЕДЕННОЕ ВРЕМЯ</p>
        </section>
    )
}

export default BeforeBlitz;