import React, {useEffect, useState} from 'react';
import {AppStore, RequestHandler} from "utils";
import './style.css';
import {Table} from "../../components";

const TournirTable = () => {

    const request = new RequestHandler();

    const [tableTeams, setTableTeams] = useState(null);

    const getTeams = async () => {
        const res = await request.getTeams();
        const {teams} = res.data;
        const sortedTeams = [...teams].sort((a,b) => {
            const res = b.current_score - a.current_score;
            if (res === 0) return a.table_num - b.table_num;
            else return res;
        });
        const result = sortedTeams.map(team => [team.current_place, team.team_name, team.current_score]);
        setTableTeams(result);
    };

    useEffect(() => {
        getTeams();
    }, []);

    return(
        <section className='tournir-table'>
            <h1>Турнирная таблица</h1>
            <Table
                headers={['Номер в таблице', 'Название команды', 'Количество баллов']}
                flex={[1,3,1]}
                data={tableTeams ?? []}
            />
        </section>
    )
}

export default TournirTable;