import React, {useEffect, useState} from 'react';
import './style.css';
import {AppStore, RequestHandler} from "../../utils";

const GameInfo = () => {

    const request = new RequestHandler();

    const [fields, setFields] = useState({});

    const getFields = async () => {
        const res = await request.getGameInfo();
        setFields(res.data);
    };

    useEffect(() => {
        getFields();
    }, []);

    const clickStart = async () => {
        const res = await request.startGame();
        const isTest = res.data.round.settings.is_test;
        AppStore.update(s => {
            s.gamePage = 'registerTeams';
            s.isTestRound = isTest;
        });
    };

    return (
        <section className="game-info">
            <div>
                <div className="game-info__field">
                    <p>Название игры</p>
                    <span>{fields.name}</span>
                </div>
                <hr/>
                <div className="game-info__field">
                    <p>Тема</p>
                    <span>{fields.theme}</span>
                </div>
                <hr/>
                <div className="game-info__field">
                    <p>Клиент</p>
                    <span>{fields.client}</span>
                </div>
                <hr/>
                <div className="game-info__field">
                    <p>Дата</p>
                    <span>{fields.date}</span>
                </div>
            </div>
            <button onClick={() => clickStart()}>Начать</button>
        </section>
    )
}

export default GameInfo;