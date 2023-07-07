import React from 'react';
import {AppStore, RequestHandler} from "utils";
import './style.css';

const NowNormalGame = ({getAppState}) => {

    const request = new RequestHandler();

    const {
        nextBlitz,
        isNextRoundTest,
        questionNumber,
    } = AppStore.useState(s => ({
        isBlitzRound: s.isBlitzRound,
        nextBlitz: s.nextBlitz,
        isNextRoundTest: s.isNextRoundTest,
        questionNumber: s.questionNumber,
    }));

    const openNextPage = async () => {
        const res = await request.nextQuestion();
        const {
            settings: {is_test},
            questions,
            type: roundType,
            state: {current_question},
        } = res.data;
        if (isNextRoundTest) {
            const currentQuestion = questions[questionNumber - 1];
            if (roundType === 'blitz') await getAppState();
            AppStore.update(s => {
                s.questions = questions;
                s.isBlitzRound = roundType === 'blitz'
                s.isTestRound = is_test;
                s.questionNumber = current_question;
                s.navPage = 'game';
                if (nextBlitz) {
                    s.gamePage = 'blitzTime';
                }
                else {
                    s.gamePage = 'chooseTactics';
                    s.mediaInQuestion = currentQuestion.media_data.image.before !== '' || currentQuestion.media_data.video.before !== '';
                }
            })
        } else {
            if (roundType === 'blitz') await getAppState();
            const currentQuestion = questions[questionNumber - 1];
            AppStore.update(s => {
                if (nextBlitz) {
                    s.gamePage = 'blitzTime';
                }
                else {
                    s.gamePage = 'chooseTactics';
                    s.mediaInQuestion = currentQuestion.media_data.image.before !== '' || currentQuestion.media_data.video.before !== '';
                }
            });
        }
    };

    return(
        <section className={`start-game`}>
            <div className={nextBlitz ? '' : 'now-normal-game'}>
                <h1>
                    { nextBlitz
                        ? 'Раунд блиц'
                        : ''
                    }
                </h1>
                { nextBlitz
                    ? <h2>
                        {
                            'Сейчас будет раунд Блиц. Ваша задача - правильно ответить на максимальное количество вопросов. Время ограничено.\n' +
                            'Подсказка: если не знаете ответ, не тратьте время, переходите к следующему вопросу.\n' +
                            'Максимально быстро отвечайте на вопросы, которые знаете.\n' +
                            'Вернетесь к пропущенным вопросам в конце, если останется время.\n' +
                            'Такая возможность предусмотрена.'
                        }
                    </h2>
                    : <span className={'now-normal-game__gameround_big'}>ИГРОВОЙ РАУНД</span>
                    // : 'Теперь переходим к основной игре.\n'+
                    // 'Баллы начинаем зарабатывать заново, и они определят место вашей команды в турнире.'

                }
            </div>
            <button onClick={openNextPage}>Начать игру</button>
        </section>
    )
}

export default NowNormalGame;
