import React from 'react';
import './style.css'
import {AppStore} from "utils";

const Header = () => {

    const {
        navPage,
        gamePage,
        isTestRound,
        isBlitzRound,
        questionNumber,
        questions
    } = AppStore.useState(s => ({
        gamePage: s.gamePage,
        navPage: s.navPage,
        isTestRound: s.isTestRound,
        isBlitzRound: s.isBlitzRound,
        questionNumber: s.questionNumber,
        questions: s.questions,
    }));

    const showSides = navPage !== 'register' || gamePage === 'startGame';

    return(
        <header>
            { showSides &&
                <div className="header__side">
                    { gamePage !== 'nowNormalGame' && gamePage !== 'startGame' && <>
                        <h1>
                            { isTestRound
                                ? 'Тестовый раунд'
                                : isBlitzRound
                                    ? 'Раунд блиц'
                                    : `Игровой раунд`
                            }
                        </h1>
                        { !isBlitzRound && <h1>Вопрос {questionNumber + '/' + questions.length}</h1> }
                    </>
                    }
                </div>
            }

            <img src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt="logo"/>
            { showSides && <div className="header__side"></div> }
        </header>
    )
}

export default Header;
