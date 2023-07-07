import React, {useEffect, useRef, useState} from 'react';
import {AppStore, RequestHandler} from "../../utils";
import blitz_img from '../../assets/countdown_big.svg'
import './style.css';

const BlitzTime = ({getAppState}) => {

    const request = new RequestHandler();

    const {
        timerToAnswer,
        timerToAnswerLeft,
        allTeamsChosenAnswer
    } = AppStore.useState(s => ({
        timerToAnswer: s.timerToAnswer,
        timerToAnswerLeft: s.timerToAnswerLeft,
        allTeamsChosenAnswer: s.allTeamsChosenAnswer,
    }));

    const [blitzState, setBlitzState] = useState('beforeShowAnswers');
    const [blitzTime, setBlitzTime] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(true);

    const timeout = useRef(null);

    const loadTimerStatus = async () => {
        await getAppState();
        if (timerToAnswer > timerToAnswerLeft) {
            setBlitzState('showAnswers');
        }
        setBlitzTime(timerToAnswerLeft);
    };

    useEffect(() => {
        loadTimerStatus();
    }, []);

    useEffect(() => {
        if ((blitzTime != '' && blitzTime <= 0) || allTeamsChosenAnswer) {
            clearInterval(timeout.current);
            setButtonDisabled(false);
        }
    }, [blitzTime, timeout]);

    useEffect(() => {
        if (blitzState === 'showAnswers') {
            timeout.current = setInterval(() => setBlitzTime(prevState => prevState - 1), 1000)
        }
        return () => {
            if (timeout != null) clearInterval(timeout.current);
        }
    }, [blitzState]);

    const sendShowAnswers = async () => {
        await request.showAnswers();
        setBlitzState('showAnswers');
    };

    const sendShowResult = async () => {
        await request.showResult();
        AppStore.update(s => {
            s.gamePage = 'showResults';
        });
    };

    return(
        <section className="blitz-time">
            <h1>Раунд блиц</h1>
            <div className="blitz-time__total-time">
                <img src={blitz_img} alt="time"/>
                <h3>{blitzTime}</h3>
            </div>
            {blitzState === 'beforeShowAnswers' && <button onClick={() => sendShowAnswers()}>Старт</button> }
            {blitzState === 'showAnswers'       && <button disabled={buttonDisabled} onClick={() => sendShowResult()}>Результат ответа</button> }
        </section>
    )
}

export default BlitzTime;
