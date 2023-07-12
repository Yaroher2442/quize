import React, {useEffect, useState} from 'react';
import {AppStore } from "utils";
import './style.css'

const RoundResult = ({openBlitzModal}) => {

    const {
        currentScore,
        currentPlace,
        teamResult,
        accentColor,
        roundType,
        blitzQuestions,
        teamBlitzAnswers,
    } = AppStore.useState(s => ({
        currentScore: s.currentScore,
        currentPlace: s.currentPlace,
        teamResult: s.teamResult,
        accentColor: s.accentColor,
        roundType: s.roundType,
        blitzQuestions: s.blitzQuestions,
        teamBlitzAnswers: s.teamBlitzAnswers,
    }));

    const openTable = () => {
        AppStore.update(s => {
            s.navPage = 'table';
        });
    };

    const [results, setResults] = useState([]);

    const cropNumber = (num) => {
        const number = num.toString();
        const splitted = number.split('.');
        if (splitted.length === 1) return num;
        const sliceLength = splitted[0].length + 2;
        return number.slice(0, sliceLength);
    };

    const parseResults = () => {
        let parsedResults = [];

        if (!teamResult.correct && roundType !== 'blitz') {
            parsedResults.push({
                'name': 'Неправильный ответ',
                'value': '0'
            });
            if (teamResult.question_bet !== 0.0) {
                parsedResults.push({
                    'name': 'Баллы на бочку',
                    'value': cropNumber(teamResult.earned_points)
                });
            }
            if (teamResult.all_in) {
                const val = teamResult.earned_points >= 0 ? `+${teamResult.earned_points}` : teamResult.earned_points
                parsedResults.push({
                    'name': 'Ва-банк',
                    'value': cropNumber(val)
                });
            }
            if (teamResult.team_bet !== '' && teamResult.team_bet !== null) {
                parsedResults.push({
                    'name': 'Ставка на команду',
                    'value': cropNumber(teamResult.team_bet_score)
                });
            }
        }
        else for (let [key, val] of Object.entries(teamResult)) {
            switch (key) {
                case 'base_score':
                    if (!teamResult.all_in && teamResult.question_bet === 0.0) {
                        parsedResults.push({
                            'name': 'БАЗОВЫЕ БАЛЛЫ',
                            'value': cropNumber(val)
                        });
                    }
                    break;
                case 'remove_answer':
                    if (val !== 0) {
                        let mul = 1;
                        for (let i = 0; i < val; i += 1) {
                            mul -= 0.25;
                        }
                        if (mul !== 0 && !teamResult.all_in) {
                            parsedResults.push({
                                'name': 'Убрать неверные ответы',
                                'value': 'x'+ mul
                            });
                        }
                    }
                    break;
                case 'correct_in_row_reached':
                    if (val && teamResult.question_bet === 0.0 && !teamResult.all_in) {
                        parsedResults.push({
                            'name': 'Правильные ответы подряд',
                            'value': 'x3'
                        });
                    }
                    break;
                case 'one_for_all':
                    if (val) {
                        parsedResults.push({
                            'name': 'Один за всех',
                            'value': 'x3'
                        });
                    }
                    break;
                case 'question_bet':
                    if (val !== 0.0) {
                        parsedResults.push({
                            'name': 'Баллы на бочку',
                            'value': cropNumber(teamResult.earned_points)
                        });
                    }
                    break;
                case 'all_in':
                    if (val) {
                        parsedResults.push({
                            'name': 'Ва-банк',
                            'value': cropNumber('+'+teamResult.earned_points)
                        });
                    }
                    break;
                case 'team_bet':
                    if (val !== '' && val !== null) {
                        parsedResults.push({
                            'name': 'Ставка на команду',
                            'value': cropNumber(teamResult.team_bet_score)
                        });
                    }
                    break;
                case 'once_correct':
                    if (val && teamResult.question_bet === 0.0 && !teamResult.all_in) {
                        parsedResults.push({
                            'name': 'Единственная команда, ответившая правильно',
                            'value': 'x2'
                        });
                    }
                    break;
            }
        }
        setResults(parsedResults);
    };

    const getBlitzAnswers = () => {
        const answers = [];
        let team_answers = typeof teamBlitzAnswers === 'Object' || typeof teamBlitzAnswers === 'object'
            ? Object.values(teamBlitzAnswers)
            : teamBlitzAnswers;
        for (let i = 0; i < blitzQuestions.length && i < team_answers.length; i++) {
            answers.push({
                "teamAnswer": team_answers[i].answr,
                "correctAnswer": blitzQuestions[i].correct_answer,
                "isCorrect": team_answers[i].correct,
                "question": blitzQuestions[i].question
            });
        }
        return answers;
    };

    const countAnswers = () => {
      const answers = getBlitzAnswers();
      return {
          "correct": answers.filter(a => a.isCorrect).length,
          "wrong": answers.filter(a => !a.isCorrect && a.teamAnswer).length
          // "noTime": answers.filter(a => a.teamAnswer === "").length
      }
    };

    useEffect(() => {
        parseResults();
    }, []);

    return(
        <section className="round-result">
            <div className="round-result__head">
                <h2>Результат ответа</h2>
                <div className="round-result__box">
                    {roundType === 'blitz'
                        ? <div className="round-result__blitz">
                            <div className="round-result__blitz_row">
                                <p>Правильных ответов:</p>
                                <span className="yellow-title">{countAnswers().correct}</span>
                                <button onClick={() => openBlitzModal('right')} disabled={countAnswers().correct == 0}
                                        style={{'color': accentColor}}>Смотреть
                                </button>
                            </div>
                            <div className="round-result__blitz_row">
                                <p>Неправильных ответов:</p>
                                <span className="yellow-title">{countAnswers().wrong}</span>
                                <button onClick={() => openBlitzModal('wrong')} disabled={countAnswers().wrong == 0}
                                        style={{'color': accentColor}}>Смотреть
                                </button>
                            </div>
                            {/*<div className="round-result__blitz_row">*/}
                            {/*    <p>Не отвечено:</p>*/}
                            {/*    <span className="yellow-title">{countAnswers().noTime}</span>*/}
                            {/*    <button onClick={() => openBlitzModal('noTime')} disabled={countAnswers().noTime == 0}*/}
                            {/*            style={{'color': accentColor}}>Смотреть*/}
                            {/*    </button>*/}
                            {/*</div>*/}
                        </div>
                        : results.map((result) => (
                            <div className="round-result__row" key={result.name}>
                                <span>{result.name}</span>
                                <span>{result.value}</span>
                            </div>
                        ))}
                    <hr style={{height: '1px', background: '#ffffff'}}/>
                    <h3 className="yellow-title">Итого: {cropNumber(teamResult.earned_points)}</h3>
                </div>
            </div>
            <button onClick={() => openTable()} style={{'color': accentColor}}>Турнирная таблица</button>
        </section>
    )
}

export default RoundResult;
