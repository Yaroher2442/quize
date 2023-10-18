import React, {useEffect, useState} from 'react';
import {RequestHandler, AppStore} from "utils";
import {CountDown} from "components";
import "./style.css"
import {toast} from "react-toastify";

const QuestionSelect = () => {

    const request = new RequestHandler();

    const {
        timeToAnswer,
        timeToAnswerLeft,
        showCorrectAnswer,
        correctAnswer,
        answers,
        currentAnswer,
        accentColor,
        questionName,
        usedRemoveAnswer,
    } = AppStore.useState(s => ({
        timeToAnswer: s.timeToAnswer,
        timeToAnswerLeft: s.timeToAnswerLeft,
        showCorrectAnswer: s.showCorrectAnswer,
        correctAnswer: s.correctAnswer,
        answers: s.answers,
        currentAnswer: s.currentAnswer,
        accentColor: s.accentColor,
        questionName: s.questionName,
        usedRemoveAnswer: s.usedRemoveAnswer,
    }));

    const [inputLock, setInputLock] = useState(false);
    const [inputAnswer, setInputAnswer] = useState('');
    const [currentTimeToAnswer, setCurrentTimeToAnswer] = useState(timeToAnswer);

    const sendAnswer = async (hard = false) => {
        if (inputAnswer !== '' || hard) {
            setInputLock(true);
            await request.sendAnswer({
                "answer": inputAnswer,
                "time": timeToAnswerLeft,
                "remove_answer": usedRemoveAnswer
            });
            AppStore.update(s => {s.currentAnswer = inputAnswer;});
            toast('Ожидайте ведущего', {toastId: 'wait'});
        } else {
            toast('Выберите ответ', {toastId: 'noAnswer'});
        }
    };

    const handleTap = (text) => {
        setInputAnswer(text.trim());
    };

    useEffect(() => {
        checkRemovedAnswers();
    }, [usedRemoveAnswer]);

    const checkRemovedAnswers = () => {
        if (parseInt(usedRemoveAnswer) === 1) {
            console.log('check1');
            removeAnswer();
        } else if (parseInt(usedRemoveAnswer) === 2 && answers.length === 4) {
            // console.log('check2');
            // removeAnswer(2);
            // App.js 298:1
        } else if (parseInt(usedRemoveAnswer) === 2 && answers.length === 3) {
            console.log('check3');
            removeAnswer();
        }
    };

    const removeAnswer = () => {
        // при нажатии убрать непр ответ
        setInputAnswer('');
        AppStore.update(s => {
            if (answers[answers.length - 1] !== correctAnswer) {
                s.answers.pop();
            } else {
                s.answers.shift();
            }
        });
    };

    useEffect(() => {
        if (currentAnswer !== null) {
            setInputLock(true);
            toast('Ожидайте ведущего', {toastId: 'wait'});
        } else if (timeToAnswerLeft <= 0) {
            toast('Время вышло!', {toastId: 'timeOut'});
            sendAnswer(true);
        } else {
            setCurrentTimeToAnswer(timeToAnswerLeft);
        }
    }, [timeToAnswerLeft]);

    const getButtonStyle = (answer) => {
        let style = {};
        if (showCorrectAnswer && answer === correctAnswer) {
            style.background = 'linear-gradient(180deg, #29C01C 0%, #1F5B07 100%)';
            style.color = 'white';
        }
        else if (showCorrectAnswer && answer === inputAnswer) {
            style.background = 'linear-gradient(180deg, #FA5E5E 0%, #C53735 100%)';
            style.color = 'white';
        }
        else if (answer === inputAnswer || answer === currentAnswer) {
            style.background = 'grey';
            style.color = 'white'
        }
        return style;
    }

    return(
        <section className="question-select">
            <h3>{questionName}</h3>
            <h3 className="yellow-title">Выберите вариант ответа</h3>
            <div className="question-select__answers">
                { answers.map(answer => (
                    <button
                        className="question-select__answer"
                        onClick={() => handleTap(answer)}
                        key={answer}
                        style={getButtonStyle(answer)}
                        disabled={inputLock}
                    >
                        {answer}
                    </button>
                ))}
            </div>
            <CountDown totalTime={timeToAnswer} timeLeft={currentTimeToAnswer ?? timeToAnswer}/>
            <button className="question-select__send-btn" onClick={() => sendAnswer()} disabled={inputLock} style={{'color': accentColor}}>Отправить</button>
        </section>
    )
}

export default QuestionSelect;
