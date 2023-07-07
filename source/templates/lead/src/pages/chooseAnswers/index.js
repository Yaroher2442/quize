import React, {useState, useEffect} from 'react';
import {AppStore, RequestHandler} from "utils";
import './style.css';
import {QuestionTypeLabel} from "components";
import answersIcon from '../../assets/answers.png';

const ChooseAnswers = ({getAppState, openModal}) => {
    const request = new RequestHandler()

    const {
        allTeamsChosenAnswer,
        teamsChosenAnswer,
        teamsRegistered,
        questionNumber,
        questions,
        mediaInQuestion,
        shownMediaAfter,
    } = AppStore.useState(s => ({
        allTeamsChosenAnswer: s.allTeamsChosenAnswer,
        teamsChosenAnswer: s.teamsChosenAnswer,
        teamsRegistered: s.teamsRegistered,
        questionNumber: s.questionNumber,
        questions: s.questions,
        mediaInQuestion: s.mediaInQuestion,
        shownMediaAfter: s.shownMediaAfter,
    }));

    const openAnswers = () => {
        const currentQuestion = questions[questionNumber-1];
        openModal(currentQuestion.answers, 'answers');
    };
    
    useEffect(() => {
        getAppState();
        if (!mediaInQuestion) {
            AppStore.update(s => {
                s.shownMediaAfter = true;
            });
        }
    }, []);

    const showMediaAfter = async () => {
        await request.showMediaAfter();
        AppStore.update(s => {
            s.shownMediaAfter = true;
        });
    };

    const openNextPage = async () => {
        await request.showCorrect()
        AppStore.update(s => {
            s.gamePage = 'showCorrect';
        });
    };

    return(
        <section className="choose-answers">
            <div>
                <QuestionTypeLabel type={questions[questionNumber - 1].type}/>
                <h1>{questions[questionNumber - 1].question}</h1>
                { questions[questionNumber-1].type === 'select' &&
                    <button onClick={openAnswers} className="choose-answers__open-modal">
                        <img src={answersIcon} alt="answers"/>
                        <span>Варианты ответов</span>
                    </button>
                }
            </div>
            <div>
                <h2>Ответившие команды</h2>

                <div className="choose-answers__teams">
                    {teamsRegistered.map(team => (
                        <div className={`choose-answers__team ${teamsChosenAnswer.includes(team.uid) ? 'choose-answers__team_answered' : ''}`} key={team.table_num}>
                            {team.table_num}
                        </div>
                    ))}
                </div>
            </div>
            <div className="choose-answers__btns_wrapper">
                { mediaInQuestion &&
                    <>
                        <button disabled={!allTeamsChosenAnswer} onClick={showMediaAfter}>Медиа</button>
                        <div className="choose-answers__btns_spacer" />
                    </>
                }
                <button disabled={!shownMediaAfter || !allTeamsChosenAnswer} onClick={openNextPage}>Ответ</button>
            </div>
        </section>
    )
}

export default ChooseAnswers;