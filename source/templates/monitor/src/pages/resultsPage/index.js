import React from 'react';
import {AppStore} from "utils";
import {Table} from "components";
import './style.css';

const ResultsPage = () => {

    const {
        allTeams,
    } = AppStore.useState(s => ({
        allTeams: s.allTeams,
    }));

    const getResult = () => {
        const sortedTeams = [...allTeams].sort((a,b) => {
            const res = b.current_score - a.current_score;
            if (res === 0) return a.table_num - b.table_num;
            else return res;
        });
        return sortedTeams.map(team => [team.current_place, team.team_name, team.table_num, team.current_counted.earned_points, team.current_score]);
    }

    return(
        <section className="results-page">
            <Table
                headers={['Место', 'Название команды', 'Номер стола', 'баллы за вопрос', 'всего баллов']}
                flex={[1, 3, 1, 1, 1]}
                data={getResult()}
            />
        </section>
    )
}

export default ResultsPage;