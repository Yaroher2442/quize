import React, {useEffect} from 'react';
import {AppStore, RequestHandler} from "utils";
import './style.css';
import {QuestionTypeLabel} from "components";

const ShowQuestion = () => {
    const request = new RequestHandler()

    const {
        questionNumber,
        questions,
    } = AppStore.useState(s => ({
        questionNumber: s.questionNumber,
        questions: s.questions,
    }));

    const openNextPage = async () => {
        await request.showAnswers();
        AppStore.update(s => {
            s.mediaInQuestion = questions[questionNumber - 1].media_data.image.after !== '' || questions[questionNumber - 1].media_data.video.after !== '';
            s.gamePage = 'chooseAnswers';
        });
    };

    return(
        <section className="show-question">
            <div>
                <QuestionTypeLabel type={questions[questionNumber - 1].type}/>
                <h1>{questions[questionNumber - 1].question}</h1>
            </div>
            <button onClick={openNextPage}>Вопрос</button>
        </section>
    )
}

export default ShowQuestion;