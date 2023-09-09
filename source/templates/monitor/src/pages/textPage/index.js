import React, {useEffect} from 'react';
import {AppStore} from "utils";
import './style.css'

const TextPage = ({isAnswersPage, getAppState=function(){}}) => {

    const {
        pageTitle,
        question
    } = AppStore.useState(s => ({
        pageTitle: s.pageTitle,
        question: s.question,
    }));

    useEffect(() => {
        getAppState();
    }, []);

    const showAnswers = (isAnswersPage && question.type === 'select');

    return(
        <section className="text-page">
            {
                !showAnswers
                    ? <h1 style={showAnswers ? {color: '#FFEA7D', marginBottom: '30px'} : {}}>{pageTitle}</h1>
                    : <div className={'text-page__wrapper'} style={{height: '100%'}}>
                        <h5 style={showAnswers ? {color: '#FFEA7D', marginBottom: '30px'} : {}}>{pageTitle}</h5>
                            {showAnswers && <div className="showAnswers">
                                <ul>
                                    { question.answers.map((answer, idx) => (
                                        <li key={idx}>
                                            {idx+1 + '. ' + answer}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            }
                    </div>
            }
        </section>
    )
}

export default TextPage;
