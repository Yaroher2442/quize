import React, {useEffect, useState} from 'react';
import {AppStore, RequestHandler, getTacticName} from "utils";
import {Table} from "components";
import './style.css';

const ChooseTactics = ({getAppState}) => {
    const request = new RequestHandler()

    const {
        allTeamsChosenTactic,
        shownMediaBefore,
        mediaInQuestion,
        teamsRegistered,
    } = AppStore.useState(s => ({
        allTeamsChosenTactic: s.allTeamsChosenTactic,
        shownMediaBefore: s.shownMediaBefore,
        mediaInQuestion: s.mediaInQuestion,
        teamsRegistered: s.teamsRegistered,
    }));

    useEffect(() => {
        getAppState();
    }, []);

    useEffect(() => {
        if (!mediaInQuestion) {
            AppStore.update(s => {
                s.shownMediaBefore = true;
            });
        }
        else {
            AppStore.update(s => {
                s.shownMediaBefore = false;
            });
        }
    }, [mediaInQuestion]);

    const getTableData = () => {
        const tableData = teamsRegistered.map(teamRegistered => {
            return [teamRegistered.team_name, getTacticName(teamRegistered.current_tactic)]
        });
        return tableData.sort((a,b) => {
            if (a[1] === 'Не выбрана') return -1;
            else if (b[1] === 'Не выбрана') return 1;
            else return 0;
        })
    };

    const showMediaBefore = async () => {
        await request.showMediaBefore();
        AppStore.update(s => {
            s.shownMediaBefore = true;
        });
    };

    const openNextPage = async () => {
        await request.showQuestion()
        AppStore.update(s => {
            s.gamePage = 'showQuestion';
        });
    };

    return(
        <section className="choose-tactics">
            <div style={{height: '100%', width: '100%'}}>
                <h1>Выбранные тактики</h1>
                <Table
                    headers={['НАЗВАНИЕ КОМАНД', 'выбранная тактика']}
                    flex={[1,1]}
                    data={getTableData()}
                />
            </div>
            <div className="choose-tactics__btns_wrapper">
                { mediaInQuestion &&
                    <>
                        <button disabled={!allTeamsChosenTactic} onClick={showMediaBefore}>Медиа</button>
                        <div className="choose-tactics__btns_spacer" />
                    </>
                }
                <button disabled={!shownMediaBefore || !allTeamsChosenTactic} onClick={openNextPage}>Вопрос</button>
            </div>
        </section>
    )
}

export default ChooseTactics;
