import React from 'react';
import {AppStore, RequestHandler} from "utils";
import './style.css';
import {QuestionTypeLabel} from "components";

const ShowCorrect = () => {
    const request = new RequestHandler()

    const {
        questionNumber,
        questions,
    } = AppStore.useState(s => ({
        questionNumber: s.questionNumber,
        questions: s.questions,
    }));

    const openNextPage = async () => {
        await request.showResult();
        AppStore.update(s => {
            s.gamePage = 'showResults';
        });
    };

    return(
        <section className="show-correct">
            <div>
                <QuestionTypeLabel type={questions[questionNumber].type}/>
                <h1>{questions[questionNumber].question}</h1>
            </div>
            <div>
                <h2>Правильный ответ</h2>
                <h1>{questions[questionNumber].correct_answer}</h1>
            </div>
            <button onClick={openNextPage}>Результат ответа</button>
        </section>
    )
}

export default ShowCorrect;