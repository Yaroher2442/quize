import React, {useEffect, useRef, useState} from 'react';
import {AppStore, RequestHandler} from "utils";
import './style.css';
import {CountDown} from "components";
import {toast} from "react-toastify";
import useDetectKeyboardOpen from "use-detect-keyboard-open";

const BlitzInput = ({getAppState}) => {

    const request = new RequestHandler();

    const {
        timeToAnswer,
        timeToAnswerLeft,
        blitzQuestions,
        teamBlitzAnswers,
        accentColor,
        currentBlitzQuestionNum,
        questionsCount,
    } = AppStore.useState(s => ({
        timeToAnswer: s.timeToAnswer,
        timeToAnswerLeft: s.timeToAnswerLeft,
        blitzQuestions: s.blitzQuestions,
        teamBlitzAnswers: s.teamBlitzAnswers,
        accentColor: s.accentColor,
        currentBlitzQuestionNum: s.currentBlitzQuestionNum,
        questionsCount: s.questionsCount,
    }));

    const answerInInput = useRef(null);

    const getRemained = () => blitzQuestions
        .filter(
            question => !Object.keys(teamBlitzAnswers).includes(question.id.toString()))
        .sort((a,b) => a.id - b.id);

    const [inputLock, setInputLock] = useState(false);
    const [remainedQuestions, setRemainedQuestions] = useState(getRemained);

    const startTimer = () => {
        return setInterval(() => {
            AppStore.update(s => {s.timeToAnswerLeft -= 1;});
        }, 1000);
    };

    useEffect(() => {
        const timer = startTimer();
        if (timeToAnswerLeft <= 0 || inputLock) {
            setInputLock(true);
            clearInterval(timer);
            toast('Время вышло!', {toastId: 'timeOut'});
            sendAnswer(true);
        }
        return () => clearInterval(timer);
    }, [timeToAnswerLeft]);

    useEffect(() => {
        setRemainedQuestions(getRemained);
    }, [teamBlitzAnswers]);

    const sendAnswer = async (hard) => {
        console.log('hard ===', hard);
        const answer = answerInInput.current.value.trim().replace(/(\r\n|\n|\r)/gm, "");
        if (answer !== '' || hard) {
            request.sendAnswerBlitz({
                id: remainedQuestions[currentBlitzQuestionNum-1].id,
                answer: answer
            });
            if (hard !== true) {
                AppStore.update(s => {
                    s.teamBlitzAnswers[remainedQuestions[currentBlitzQuestionNum-1].id] = answer;
                    if (currentBlitzQuestionNum === remainedQuestions.length) {
                        s.currentBlitzQuestionNum = 1;
                    }
                });
                answerInInput.current.value = '';
            }
        } else {
            toast('Ответ пустой', {toastId: 'blitzAnswer'});
        }
    };

    useEffect(() => {
        AppStore.update((s) => {
            s.headerBlitzQuestionNum = remainedQuestions.length === 0
                ? questionsCount
                : remainedQuestions[currentBlitzQuestionNum-1].id + 1 ?? questionsCount
        });
    }, [currentBlitzQuestionNum, remainedQuestions]);

    const skipAnswer = async () => {
        request.sendAnswerBlitz({
            id: remainedQuestions[currentBlitzQuestionNum-1].id,
            answer: ""
        });
        AppStore.update(s => {
            if (currentBlitzQuestionNum !== remainedQuestions.length) {
                ++s.currentBlitzQuestionNum
            }
            else {
                s.currentBlitzQuestionNum = 1
            }
        });
        answerInInput.current.value = '';
    };

    const isKeyboardOpen = useDetectKeyboardOpen();

    return(
        <section className={`blitz-input ${isKeyboardOpen ? 'blitz-input_focused-input' : ''}`}>
            <h2>РАУНД БЛИЦ</h2>
            { remainedQuestions.length !== 0
                ?<>
                    <h3>{remainedQuestions[currentBlitzQuestionNum-1].question}</h3>
                    <div className="textarea" onClick={() => answerInInput.current.focus()}>
                        <input type="text"
                               placeholder='Ваш ответ'
                               disabled={inputLock}
                               ref={answerInInput}
                        />
                    </div>
                    <div className="blitz-input__btns_wrapper">
                        <button onClick={skipAnswer} style={{'color': accentColor}} disabled={inputLock}>Пропустить</button>
                        <div className="pick-avatar__btns_spacer" />
                        <button onClick={sendAnswer} style={{'color': accentColor}} disabled={inputLock}>Отправить</button>
                    </div>
                    <CountDown totalTime={timeToAnswer} timeLeft={timeToAnswerLeft ?? timeToAnswer}/>
                </>
                : <h3 className="blitz-input__all-answered">Вы ответили на все вопросы!</h3>
            }
        </section>
    )
}

export default BlitzInput;
