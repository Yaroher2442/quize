import React from 'react';
import {AppStore} from "../../utils";
import {Table} from "components";
import './style.css';

const RegisteredTeams = () => {

    const {
        teamsRegistered,
    } = AppStore.useState(s => ({
        teamsRegistered: s.teamsRegistered,
    }));

    const getData = () => {
        const sortedTeams = [...teamsRegistered].sort((a,b) => a.table_num - b.table_num);
        return sortedTeams.map(team => [team.table_num, team.team_name]);
    }

    return(
        <section className="registered-teams">
            <h1>Регистрация команд</h1>
            <Table
                headers={['Номер стола', 'Название команды']}
                flex={[2, 3]}
                data={getData()}
            />
        </section>
    )
}

export default RegisteredTeams;
