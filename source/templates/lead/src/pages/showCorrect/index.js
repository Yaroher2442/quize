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
                <QuestionTypeLabel type={questions[questionNumber - 1].type}/>
                <h1>{questions[questionNumber - 1].question}</h1>
            </div>
            <div>
                <h2>Правильный ответ</h2>
                <h1>{questions[questionNumber-1].correct_answer}</h1>
            </div>
            {
                questions[questionNumber - 1].description !== "" && 
                <div>
                    <h2>Комментарий</h2>
                    <h1>{questions[questionNumber - 1].description}</h1>
                </div>
            }
            <button onClick={openNextPage}>Результат ответа</button>
        </section>
    )
}

export default ShowCorrect;