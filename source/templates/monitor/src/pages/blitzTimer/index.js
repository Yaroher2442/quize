import React, {useEffect, useState} from 'react';
import {AppStore} from "utils";
import './style.css';

const BlitzTimer = () => {

    const {
        blitzTime,
        allAnswered,
    } = AppStore.useState(s => ({
        blitzTime: s.blitzTime,
        allAnswered: s.allAnswered,
    }));

    const [timeLeft, setTimeLeft] = useState(blitzTime);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(timeLeft-1), 1000);
        if (timeLeft <= 0 || allAnswered) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [timeLeft]);

    return(
        <section className="blitz-timer">
            { allAnswered
                ? <h1>Все команды ответили</h1>
                : <>
                    <h1>Времени осталось:</h1>
                    <div className="blitz-timer__total-time">
                        <h2>{timeLeft}</h2>
                    </div>
                </>}
        </section>
    )
}

export default BlitzTimer;