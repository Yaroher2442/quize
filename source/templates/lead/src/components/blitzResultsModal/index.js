import React, {useEffect, useState} from 'react';
import './index.css';
import {AppStore} from "../../utils";
import {cropNumber, parseResults} from "./parseResults";

const BlitzResultsModal = (props) => {
    const {teamInModal, setBlitzResultsModalOpened} = props;
    const {current_blitz_answers: teamAnswers, current_counted: teamResults} = teamInModal;

    const {
        questions,
        isBlitzRound,
    } = AppStore.useState(s => ({
        questions: s.questions,
        isBlitzRound: s.isBlitzRound
    }));

    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!isBlitzRound) {
            parseResults(teamResults, setResults);
            return;
        }
        let corrects = 0;
        let incorrects = 0;
        Object.values(teamAnswers).forEach((val, idx) => {
            const {answr, correct: itIsCorrect} = val;

            if (answr !== '' && itIsCorrect) {
                corrects++;
            }
            else if (answr !== '') {
                incorrects++
            }
        });
        setResults([
            {
                name: 'Верных ответов:',
                value: corrects
            },
            {
                name: 'Неерных ответов:',
                value: incorrects
            }
        ])
    }, [teamAnswers]);


    return (
        <div className="modal__wrapper">
            <div className="modal modal__team-results">
                <div className="modal__header">Результаты ответа</div>
                <div className="modal__body">
                    { results.map(result => (
                        <div className="modal__team-results_row">
                            <p>{result.name}</p>
                            <span>{result.value}</span>
                        </div>
                    ))}
                    { !isBlitzRound && <div className="modal__team-results_footer">
                            <hr/>
                            <p>Итого: {cropNumber(teamResults.earned_points)}</p>
                        </div>
                    }
                </div>
                <button className="modal__button" onClick={() => setBlitzResultsModalOpened(false)}>Закрыть</button>
            </div>
        </div>
    );

    // return(
    //     <div className="modal__wrapper">
    //         <div className={'modal'}>
    //             <h2 className={'modal__header'}>Правильные ответы</h2>
    //             <button className={'modal__button'} onClick={() => setBlitzResultsModalOpened(false)}>Ок</button>
    //         </div>
    //     </div>
    // )
}

export default BlitzResultsModal;
