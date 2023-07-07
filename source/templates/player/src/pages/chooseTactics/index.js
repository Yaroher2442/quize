import React, { useEffect, useState } from 'react';
import {RequestHandler, AppStore} from 'utils';
import './style.css';

const ChooseTactics = () => {

    const request = new RequestHandler();

    const {
        accentColor,
        currentScore,
    } = AppStore.useState(s => ({
        accentColor: s.accentColor,
        currentScore: s.currentScore,
    }));

    const [tacticsRemained, setTacticsRemained] = useState({
        one_for_all: 0,
        question_bet: 0,
        team_bet: 0,
        all_in: 0,
    });

    const openNextPage = (page) => {
        AppStore.update(s => {s.gamePage = page});
    };

    const getTacticsRemained = async () => {
        const res = await request.getTacticsRemained()
        setTacticsRemained(res.data.tactic_balance);
    };

    useEffect(() => {
        getTacticsRemained();
    }, []);

    return(
        <section className="choose-tactics">
            <h2>Выбор тактики</h2>
            <h3 className="yellow-title">Доступно в текущем раунде:</h3>
            <div className="choose-tactics__buttons-container">
                <button className="choose-tactics__button" onClick={() => openNextPage('tacticsEasy')} style={{'color': accentColor}}>
                    Простая игра<span></span>
                </button>
                { tacticsRemained.one_for_all !== 0 &&
                    <button className="choose-tactics__button" onClick={() => openNextPage('tacticsAlone')} style={{'color': accentColor}}>
                        Один за всех <span style={{'backgroundColor': accentColor}}>{tacticsRemained.one_for_all}</span>
                    </button>
                }
                { tacticsRemained.team_bet !== 0 &&
                    <button className="choose-tactics__button" onClick={() => openNextPage('tacticsBet')} style={{'color': accentColor}}>
                        Ставлю на... <span style={{'backgroundColor': accentColor}}>{tacticsRemained.team_bet}</span>
                    </button>
                }
                { tacticsRemained.question_bet !== 0 && currentScore > 0 &&
                    <button className="choose-tactics__button" onClick={() => openNextPage('tacticsPoints')} style={{'color': accentColor}}>
                        Баллы на бочку! <span style={{'backgroundColor': accentColor}}>{tacticsRemained.question_bet}</span>
                    </button>
                }
                { tacticsRemained.all_in !== 0 && currentScore > 0 &&
                    <button className="choose-tactics__button" onClick={() => openNextPage('tacticsVaBank')} style={{'color': accentColor}}>
                        Ва-банк <span style={{'backgroundColor': accentColor}}>{tacticsRemained.all_in}</span>
                    </button>
                }
            </div>
        </section>
    )
}

export default ChooseTactics;
