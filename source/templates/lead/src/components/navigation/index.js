import React from 'react';
import './style.css'
import {AppStore} from "utils";

const Navigation = ({getAppState}) => {

    const {
        navPage,
    } = AppStore.useState(s => ({
        navPage: s.navPage,
    }));

    const changeNavPage = async (page) => {
        if (page === 'game') await getAppState();
        else {
            AppStore.update(s => {
                s.navPage = page;
            });
        }
    };

    return(
        <nav>
            <button
                className={`nav-btn  ${navPage === "game" ? 'nav-btn_selected' : ''}`}
                onClick={() => changeNavPage('game')}
            >
                Игра
            </button>
            <button
                className={`nav-btn  ${navPage === "table" ? 'nav-btn_selected' : ''}`}
                onClick={() => changeNavPage('table')}
            >
                Турнирная таблица
            </button>
            <button
                className={`nav-btn  ${navPage === "rules" ? 'nav-btn_selected' : ''}`}
                onClick={() => changeNavPage('rules')}
            >
                Правила
            </button>
        </nav>
    )
}

export default Navigation;