import React, {useEffect, useState} from 'react';
import {RequestHandler, AppStore } from "utils";
import {toast} from "react-toastify";
import './style.css';

const TacticsBet = () => {
    const request = new RequestHandler();

    const {
        teamID,
        accentColor,
        backgroundGradient,
    } = AppStore.useState(s => ({
        teamID: s.teamID,
        accentColor: s.accentColor,
        backgroundGradient: s.backgroundGradient,
    }));

    const [teams, setTeams] = useState([]);
    const [chosenTeamId, setChosenTeamId] = useState('');

    const goToPrevPage = () => {
        AppStore.update(s => {s.gamePage = 'chooseTactics'});
    };

    const goToNextPage = async () => {
        if (chosenTeamId !== '') {
            await request.chooseTactic({
                "tactic": 'team_bet',
                "amount": chosenTeamId
            });
            AppStore.update(s => {
                s.currentTactic = 'team_bet';
                s.gamePage = 'textBeforeQuestion';
            });
        }
        else toast('Выберите команду', {toastId: 'choose'})
    };

    const getTeams = async () => {
        const res = await request.getTeams();
        const {teams} = res.data;
        teams.filter((a,b) => a.current_place - b.current_place);
        setTeams(teams);
    };

    useEffect(() => {
        getTeams();
    }, []);

    return(
        <section className="tactics-bet">
            <h2>Выбрана тактика<br/>”Ставлю на...”</h2>
            <h3>Выберите команду:</h3>
            <div className="table">
                <div className="tbody">
                    <div className="scroller">
                        { teams.map(team => {
                            const { current_score, team_name, current_place, uid: teamUid } = team;
                            if (teamUid === teamID) return null;
                            return <div
                                className="trow"
                                onClick={() => setChosenTeamId(teamUid)}
                                style={{'background': chosenTeamId === teamUid ? backgroundGradient : ''}}
                                key={teamUid}
                            >
                                <p className="tdata_body" style={{'color': chosenTeamId === teamUid ? 'white' : accentColor}}>{ current_place }</p>
                                <p className="tdata_body" style={{'color': chosenTeamId === teamUid ? 'white' : accentColor}}>{ team_name }</p>
                                <p className="tdata_body" style={{'color': chosenTeamId === teamUid ? 'white' : accentColor}}>{ current_score }</p>
                            </div>
                        }) }
                    </div>
                </div>
            </div>
            <div className="small-buttons-container">
                <button className="button-small" onClick={() => goToPrevPage()} style={{'color': accentColor}}>Назад</button>
                <button className="button-small" onClick={() => goToNextPage()} style={{'color': accentColor}}>Подтвердить</button>
            </div>
        </section>
    )
}

export default TacticsBet;