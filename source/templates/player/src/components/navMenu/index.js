import React, {useEffect, useState} from 'react';
import {AppStore} from "utils";
import {ReactComponent as Game} from 'assets/nav/game.svg';
import {ReactComponent as Rules} from 'assets/nav/rules.svg';
import {ReactComponent as Table} from 'assets/nav/table.svg';
import {ReactComponent as Trash} from 'assets/nav/trash.svg';
import './style.css';
import {toast} from "react-toastify";
import {asyncLocalStorage} from '../../utils/acync_storage.js'

const NavMenu = ({getAppState, isAllIn}) => {

    const {
        teamResult,
        navPage,
        gamePage,
        accentColor,
        availableTactics,
        usedRemoveAnswer,
        timeToAnswerLeft,
        answers,
        currentAnswer,
        currentTactic,
    } = AppStore.useState(s => ({
        teamResult: s.teamResult,
        navPage: s.navPage,
        gamePage: s.gamePage,
        accentColor: s.accentColor,
        availableTactics: s.availableTactics,
        usedRemoveAnswer: s.usedRemoveAnswer,
        timeToAnswerLeft: s.timeToAnswerLeft,
        answers: s.answers,
        currentAnswer: s.currentAnswer,
        currentTactic: s.currentTactic,
    }));

    const changeNavPage = async (page) => {
        if (page === 'game') await getAppState();
        else {
            AppStore.update(s => {
                s.navPage = page;
            });
        }
    };

    const buttons = [
        {
            'name': 'Игра',
            'value': 'game',
            'image': <Game style={{'fill': navPage === 'game' ? accentColor : 'grey'}}/>,
        },
        {
            'name': 'Турнирная таблица',
            'value': 'table',
            'image': <Table style={{'fill': navPage === 'table' ? accentColor : 'grey'}}/>,
        },
        {
            'name': 'Правила',
            'value': 'rules',
            'image': <Rules style={{'fill': navPage === 'rules' ? accentColor : 'grey'}}/>,
        },
    ];

    const [removedCount, setRemovedCount] = useState(0);

    const removeAnswer = async () => {
        if (currentAnswer !== null) {
            toast('Вы уже ответили', {toastId: 'answered'});
        } else if (usedRemoveAnswer < availableTactics.remove_answer && usedRemoveAnswer <= answers.length - 2) {
            await asyncLocalStorage.setItem('usedRemoveAnswer', (usedRemoveAnswer + 1).toString())
            AppStore.update(s => {
                s.usedRemoveAnswer++;
            });
        } else {
            toast('Максимум вопросов убрано', {toastId: 'maxremoved'});
        }
        await getRemovedCount();
    };

    useEffect(() => {
        getRemovedCount();
    }, []);

    const getRemovedCount = async () => {
        let storaged = await asyncLocalStorage.getItem('usedRemoveAnswer') ?? 0;
        if (teamResult.removeAnswer > 0) {
            setRemovedCount(availableTactics.remove_answer);
        }
        setRemovedCount(availableTactics.remove_answer - storaged);
    };

    return (
        <nav className="nav-menu">
            {gamePage === 'questionSelect' && currentTactic !== 'all_in' && currentTactic !== 'question_bet'
                ? <button className="nav-delete-answer" onClick={removeAnswer} disabled={timeToAnswerLeft === 0}>
                    <Trash/>
                    <span>Убрать неверный ответ</span>
                    <div className="nav-delete-answer_count">
                        <span>{removedCount}</span>
                    </div>
                </button>
                : buttons.map(button => (
                    <button
                        key={button.name}
                        className={`nav-btn${navPage === button.value ? ' nav-btn_selected' : ''}`}
                        onClick={() => changeNavPage(button.value)}
                    >
                        {button.image}
                        <p style={{'color': navPage === button.value ? accentColor : 'rgba(0, 0, 0, 0.25)'}}>
                            {button.name}
                        </p>
                    </button>
                ))}
        </nav>
    )
}

export default NavMenu;
