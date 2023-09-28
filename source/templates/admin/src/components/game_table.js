import { useState, useEffect } from 'react';
import { Table } from 'antd';

export const GameTable = ({ gameData }) => {

    const [dataSource, setDataSource] = useState([]);

    const columns = [
        {
            title: 'Параметр',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Значение',
            dataIndex: 'value',
            key: 'value',
        },
    ];

    const stages = {
        Stage: "Текущий этап",
        current_round: "Текущий раунд",
        current_question: "Текущий вопрос",
        all_questions: "Всего вопросов",
        all_rounds: "Всего раундов",
        current_time: "Таймер",
        is_finished: "Игра окончена",
        now_blitz: "Сейчас блиц",
    }

    const updateDataSource = () => {
        let isEmpty = Object.entries(gameData).length === 0

        if (!isEmpty) {
            let data = []
            for (const [key, value] of Object.entries(gameData.Game)) {
                data.push({
                    key: stages[key],
                    value: typeof value == 'boolean'
                        ? value ? 'Да' : 'Нет'
                        : value,
                });
            }
            setDataSource(data);
        }
    }

    useEffect(() => {
        updateDataSource();
    }, [gameData]);

    return (
        <div className="game-container">
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
            />
        </div>
    );
};