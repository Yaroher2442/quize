import React, {useEffect, useRef, useState} from 'react';
import {AppStore, RequestHandler} from "utils";
import './style.css';
import {CountDown} from "components";
import {toast} from "react-toastify";
import useDetectKeyboardOpen from "use-detect-keyboard-open";

const QuestionInput = () => {

    const request = new RequestHandler();

    const {
        timeToAnswer,
        timeToAnswerLeft,
        showCorrectAnswer,
        accentColor,
        currentAnswer,
        correctAnswer,
        questionName,
        usedRemoveAnswer,
        teamResult,
    } = AppStore.useState(s => ({
        timeToAnswer: s.timeToAnswer,
        timeToAnswerLeft: s.timeToAnswerLeft,
        showCorrectAnswer: s.showCorrectAnswer,
        accentColor: s.accentColor,
        currentAnswer: s.currentAnswer,
        correctAnswer: s.correctAnswer,
        questionName: s.questionName,
        usedRemoveAnswer: s.usedRemoveAnswer,
        teamResult: s.teamResult,
    }));

    const inputRef = useRef(null);
    const [inputLock, setInputLock] = useState(false);
    const [currentTimeToAnswer, setCurrentTimeToAnswer] = useState(timeToAnswer);

    const sendAnswer = async (hard = false) => {
        const answer = inputRef.current.value.trim().replace(/(\r\n|\n|\r)/gm, "");
        if (answer !== '' || hard) {
            setInputLock(true);
            await request.sendAnswer({
                "answer": answer,
                "time": timeToAnswerLeft,
                "remove_answer": usedRemoveAnswer
            });
            AppStore.update(s => {
                s.currentAnswer = answer;
                s.usedRemoveAnswer = 0;
            });
        } else {
            toast('Ответ не может быть пустым', {toastId: 'noAnswer'});
        }
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

    const getTextareaStyle = () => {
        if (showCorrectAnswer && !teamResult.correct) return {
            'color': 'red',
            'textDecoration': 'line-through red',
            '-webkit-text-decoration-line': 'line-through',
            '-webkit-text-decoration-color': 'red'
        }
        else if (showCorrectAnswer && teamResult.correct) return {
            'color': 'green',
        }
    };

    const isKeyboardOpen = useDetectKeyboardOpen();

    return(
        <section className={`question-input ${isKeyboardOpen ? 'question-input_focused-input' : ''}`}>
            <h3 className="yellow-title">
                Внимание!<br/>
                Вопрос открытый<br/>
                (без вариантов ответа)</h3>
            <h3>{questionName}</h3>
            <div className="textarea" onClick={() => inputRef.current.focus()}>
                <input type="text"
                   placeholder={currentAnswer !== null ? currentAnswer : 'Ваш ответ'}
                   disabled={inputLock}
                   ref={inputRef}
                   style={getTextareaStyle()}
                />
                { showCorrectAnswer && !teamResult.correct &&
                    <span className="question-input__correct-answer">{correctAnswer}</span>
                }
            </div>
            <CountDown totalTime={timeToAnswer} timeLeft={currentTimeToAnswer ?? timeToAnswer}/>
            <button className="question-input__send-btn" onClick={() => sendAnswer()} style={{'color': accentColor}} disabled={inputLock}>Отправить</button>
        </section>
    )
}

export default QuestionInput;
