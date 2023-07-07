import React, {useState} from 'react';
import {AppStore} from "../../utils";
import {Table} from "components";
import './style.css';
import editIcon from "../../assets/edit.png";

const TournirTable = ({openModal}) => {
    const {
        teamsResult,
        navPage,
    } = AppStore.useState(s => ({
        teamsResult: s.teamsResult,
        navPage: s.navPage,
    }));
    const [isEditing, setIsEditing] = useState(false);

    const getResult = () => {
        const copyArr = [...teamsResult];
        const sortedTeams = copyArr.sort((a,b) => {
            const res = b.current_score - a.current_score;
            if (res === 0) return a.table_num - b.table_num;
            else return res;
        });

        return sortedTeams.map(team => [team.current_place, team.team_name, team.table_num, team.current_score]);
    }

    const clickEdit = () => {
        if (isEditing) setIsEditing(false);
        else setIsEditing(true);
    };

    return(
        <section className={'tournir-table'}>
            <div style={{width: '100%'}}>
                <Table
                    openModal={openModal}
                    headers={
                        ['Место команды в игре ', 'Название команды', 'Номер стола', 'Всего баллов']
                    }
                    flex={
                        navPage === 'table'
                            ? [1, 4, 1, 1]
                            : [1, 4, 1]
                    }
                    data={getResult()}
                    isEditing={isEditing}
                    interactiveResults={true}
                />
                <div className="show-results__edit" onClick={clickEdit}>
                    <img className="show-results__edit_icon" src={editIcon} alt="edit"/>
                    <p>{isEditing ? 'Сохранить изменения' : 'Редактировать список'}</p>
                </div>
            </div>
        </section>
    )
}

export default TournirTable;
