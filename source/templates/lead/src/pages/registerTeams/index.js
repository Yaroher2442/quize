import React, {useEffect, useState} from 'react';
import {Table} from "components";
import {AppStore} from "../../utils";
import editIcon from '../../assets/edit.png'
import './style.css';

const RegisterTeams = ({openModal}) => {

    const {
        nextBlitz,
    } = AppStore.useState(s => ({
        nextBlitz: s.nextBlitz,
    }));

    const { teamsRegistered } = AppStore.useState(s => ({
        teamsRegistered: s.teamsRegistered,
    }));

    const [teams, setTeams] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const buildTeams = async () => {
        const copyArr = [...teamsRegistered];
        const sortedTeams = copyArr.sort((a,b) => a.table_num - b.table_num);
        const resTeams = sortedTeams.map(team => [team.table_num, team.team_name])
        setTeams(resTeams);
    };

    useEffect(() => {
        buildTeams();
    }, [teamsRegistered]);

    const clickEdit = () => {
        if (isEditing) setIsEditing(false);
        else setIsEditing(true);
    };

    const clickNext = async () => {
        AppStore.update(s => {
            nextBlitz
                ? s.gamePage = 'nowNormalGame'
                : s.gamePage = 'startGame';
        });
    };

    return(
        <section className="register-teams">
            <div style={{height: '100%', width: '100%'}}>
                <Table
                    openModal={openModal}
                    headers={['НОМЕР СТОЛА', 'НАЗВАНИЕ КОМАНДЫ']}
                    flex={[2,4]}
                    data={teams}
                    isEditing={isEditing}
                />
                <div className="register-teams__edit" onClick={clickEdit}>
                    <img className="register-teams__edit_icon" src={editIcon} alt="edit"/>
                    <p>{isEditing ? 'Сохранить изменения' : 'Редактировать список'}</p>
                </div>
            </div>
            <button onClick={() => clickNext()} disabled={isEditing}>Далее</button>
        </section>
    )
}

export default RegisterTeams;
