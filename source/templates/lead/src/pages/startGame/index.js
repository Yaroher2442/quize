import React from 'react';
import {AppStore, RequestHandler} from "utils";
import './style.css';

const StartGame = ({getAppState}) => {
    const request = new RequestHandler()

    const {
        isTestRound,
        isBlitzRound,
    } = AppStore.useState(s => ({
        isTestRound: s.isTestRound,
        isBlitzRound: s.isBlitzRound,
    }));

    const openNextPage = async () => {
        const res = await request.nextQuestion();
        const {
            settings: {is_test},
            questions,
            type: roundType,
            state: {current_question: questionNumber},
        } = res.data;
        if (roundType === 'blitz') await getAppState();
        AppStore.update(s => {
            if (roundType === 'blitz') {
                s.isBlitzRound = true;
                s.gamePage = 'blitzTime';
            }
            else {
                s.isBlitzRound = false;
                s.gamePage = 'chooseTactics';
                s.mediaInQuestion = questions[questionNumber - 1].media_data.image.before !== '' || questions[questionNumber - 1].media_data.video.before !== '';
            }
            s.questions = questions;
            s.isTestRound = is_test;
            s.questionNumber = questionNumber;
            s.navPage = 'game';
        });
    };

    return(
        <section className="start-game">
            <div>
                <h1>
                    { isTestRound
                        ? 'Тестовый раунд'
                        : isBlitzRound
                            ? 'Раунд блиц'
                            : 'Игровой раунд'
                    }
                </h1>
                <h2>
                    { isTestRound
                        ? 'Сейчас мы протестируем стратегии на примере трёх вопросов.\n'+
                          'Баллы тестового раунда не будут засчитываться в игре, поэтому иногда я буду просить вас отвечать неправильно.\n'+
                          'Пожалуйста, четко следуйте моим указаниям.\n'+
                          'Начинаем!'
                        : isBlitzRound
                            ? 'Сейчас будет раунд Блиц. Ваша задача - правильно ответить на максимальное количество вопросов. Время ограничено.\n'+
                              'Подсказка: если не знаете ответ, не тратьте время, переходите к следующему вопросу.\n'+
                              'Максимально быстро отвечайте на вопросы, которые знаете.\n'+
                              'Вернетесь к пропущенным вопросам в конце, если останется время.\n'+
                              'Такая возможность предусмотрена.'
                            : 'Теперь переходим к основной игре.\n'+
                              'Баллы начинаем зарабатывать заново, и они определят место вашей команды в турнире.'
                    }
                </h2>
            </div>
            <button onClick={openNextPage}>Начать игру</button>
        </section>
    )
}

export default StartGame;
