import React, {useEffect, useRef, useState} from 'react';
import {BlitzResultsModal, Header, Navigation} from 'components';
import {
    BlitzTime,
    ChooseAnswers,
    ChooseTactics,
    GameFinished,
    GameInfo,
    NowNormalGame,
    RegisterTeams,
    Rules,
    ShowCorrect,
    ShowQuestion,
    ShowResults,
    StartGame,
    TournirTable
} from 'pages';
import {AppStore, RequestHandler} from 'utils';
import './styles/app.css'
import editIcon from "./assets/edit.png";

const App = () => {
    const request = new RequestHandler();
    const {
        navPage,
        gamePage,
        teamsRegistered,
        teamsResult,
        teamsChosenAnswer,
    } = AppStore.useState(s => ({
        navPage: s.navPage,
        gamePage: s.gamePage,
        teamsRegistered: s.teamsRegistered,
        teamsResult: s.teamsResult,
        teamsChosenAnswer: s.teamsChosenAnswer,
    }));

    const [renamingTeam, setRenamingTeam] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);
    const [modalAnswers, setModalAnswers] = useState([]);
    const [teamInModal, setTeamInModal] = useState({});
    const [deletingTeam, setDeletingTeam] = useState(false);
    const [blitzResultsModalOpened, setBlitzResultsModalOpened] = useState(false);
    const renamingTeamInput = useRef(null);

    const handleEvent = async (ename, e) => {
        let { payload: edata, teams: eteams } = JSON.parse(e.data);
        switch (ename) {
            case 'next_question':
                const {all_questions, all_rounds, current_question, current_round} = edata;
                const isLastQuestion = (all_rounds === current_round) && (all_questions === current_question);
                AppStore.update(s => {s.isLast = isLastQuestion;});
                break;
            case 'new_team':
                AppStore.update(s => {
                    s.teamsRegistered = eteams;
                    s.teamsCount++;
                });
                break;
            case 'all_teams_chosen_tactic':
                AppStore.update(s => {s.allTeamsChosenTactic = true;});
                break;
            case 'all_teams_chosen_answer':
                AppStore.update(s => {s.allTeamsChosenAnswer = true;});
                break;
            case 'team_chose_tactic':
                const {uid} = edata;
                AppStore.update(s => {
                    s.teamsChosenTactic.push(uid);
                });
                getAppState();
                break;
            case 'team_chose_answer':
                // console.log('edata ===', edata);
                console.log('teamsChosenAnswer ===', teamsChosenAnswer);
                AppStore.update(s => {
                    s.teamsChosenAnswer.push(edata.uid);
                });
                console.log('teamsChosenAnswer ===', teamsChosenAnswer);
                break;
            case 'show_results':
                AppStore.update(s => {
                    s.teamsResult = eteams;
                    s.isNextRound = edata.next_round;
                    s.allTeamsChosenAnswer = false;
                    s.allTeamsChosenTactic = false;
                });
                break;
            case 'next_round':
                getAppState().then(r => {
                    AppStore.update(s => {
                        s.navPage = 'game';
                        s.gamePage = 'nowNormalGame'
                    });
                });
                break;
            case 'game_end':
                AppStore.update(s => {
                    s.gameFinished = true;
                    s.gamePage = 'gameFinished';
                    s.navPage = 'register';
                });
                break;
            case 'timer_tick':
                AppStore.update(s => {s.timerToAnswerLeft = edata.time;});
                break;
            case 'admin_reload':
                await getAppState();
                break;
        }
    };

    const initEventListener = () => {
        const { NODE_ENV, REACT_APP_SERVER_URL } = process.env;
        const server = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;
        let evtSource = (new EventSource( server + '/event'));

        evtSource.addEventListener('new_team',      e => handleEvent('new_team', e));
        evtSource.addEventListener('all_teams_chosen_tactic', e => handleEvent('all_teams_chosen_tactic', e));
        evtSource.addEventListener('all_teams_chosen_answer', e => handleEvent('all_teams_chosen_answer', e));
        evtSource.addEventListener('team_chose_tactic', e => handleEvent('team_chose_tactic', e));
        evtSource.addEventListener('team_chose_answer', e => handleEvent('team_chose_answer', e));
        evtSource.addEventListener('show_results', e => handleEvent('show_results', e));
        evtSource.addEventListener('next_question', e => handleEvent('next_question', e));
        evtSource.addEventListener('game_end', e => handleEvent('game_end', e));
        evtSource.addEventListener('next_round', e => handleEvent('next_round', e));
        evtSource.addEventListener('timer_tick', e => handleEvent('timer_tick', e));
        evtSource.addEventListener('admin_reload', e => handleEvent('admin_reload', e));
    };

    const getAppState = async () => {
        const appState = await request.getAppState();
        const {all_rounds, next_test, next_blitz, current_round, teams, timer, stage, question, round, current_question, prv_stage} = appState.data;

        AppStore.update(s => {
            if (round.type === 'blitz') {
                s.isLast = all_rounds === current_round;
            }
            s.isNextRoundTest = next_test;
            s.teamsRegistered = teams;
            s.teamsResult = teams;
            s.teamsCount = teams.length;
            s.isTestRound = round.settings.is_test;
            s.isBlitzRound = round.type === 'blitz';
            s.nextBlitz = next_blitz && current_round != 1;
            s.questions = round.questions;
            s.questionNumber = current_question;
            s.timerToAnswer = round.settings.time_to_answer;
            s.timerToAnswerLeft = timer;
            s.teamsChosenTactic = teams.filter(team => team.current_tactic !== null);
            s.teamsChosenAnswer = teams.filter(team => team.current_answer !== null).map(t => t.uid);
            s.allTeamsChosenTactic = teams.every(team => team.current_tactic !== null);
            s.allTeamsChosenAnswer = teams.every(team => team.current_answer !== null);
        });

        switch (stage) {
            case 'WAITING_START':
                break;
            case 'WAITING_NEXT':
                AppStore.update(s => {
                    if (prv_stage === 'WAITING_START') {
                        s.gamePage = 'registerTeams';
                    }
                    else if (prv_stage === 'SHOW_RESULTS') {
                        s.navPage = 'game';
                        s.gamePage = 'chooseTactics';
                    }
                });
                break;
            case 'SHOW_MEDIA_BEFORE':
                AppStore.update(s => {
                    s.mediaInQuestion = question.media_data.image.before !== '' || question.media_data.video.before !== '';
                    s.shownMediaBefore = true;
                })
            case 'CHOSE_TACTICS':
            case 'ALL_CHOSE':
                AppStore.update(s => {
                    if (round.type === 'blitz') {
                        s.gamePage = 'blitzTime';
                    }
                    else if (round.type === 'classical') {
                        s.gamePage = 'chooseTactics';
                        s.mediaInQuestion = question.media_data.image.before !== '' || question.media_data.video.before !== '';
                    }
                    s.navPage = 'game';
                });
                break;
            case 'SHOW_QUESTION':
                AppStore.update(s => {
                    if (round.type === 'blitz') {
                        s.gamePage = 'blitzTime';
                    }
                    else if (round.type === 'classical') {
                        s.gamePage = 'showQuestion';
                    }
                    s.navPage = 'game';
                });
                break;
            case 'SHOW_MEDIA_AFTER':
                AppStore.update(s => {
                    s.mediaInQuestion = question.media_data.image.after !== '' || question.media_data.video.after !== '';
                    s.shownMediaAfter = true;
                })
            case 'CHOSE_ANSWERS':
            case 'ALL_ANSWERED':
                AppStore.update(s => {
                    if (round.type === 'blitz') {
                        s.gamePage = 'blitzTime';
                    }
                    else if (round.type === 'classical') {
                        s.gamePage = 'chooseAnswers';
                        s.mediaInQuestion = question.media_data.image.after !== '' || question.media_data.video.after !== '';
                    }
                    s.navPage = 'game';
                });
                break;
            case 'SHOW_CORRECT_ANSWER':
                AppStore.update(s => {
                    if (round.type === 'blitz') {
                        s.navPage = 'game';
                        s.gamePage = 'showResults';
                    }
                    else if (round.type === 'classical') {
                        s.navPage = 'game';
                        s.gamePage = 'showCorrect';
                    }
                });
                break;
            case 'SHOW_RESULTS':
                AppStore.update(s => {
                    s.shownMediaBefore = false;
                    s.shownMediaAfter = false;
                    s.navPage = 'game';
                    s.gamePage = 'showResults';
                });
                break;
            case 'NEXT_ROUND':
                AppStore.update(s => {
                    s.shownMediaBefore = false;
                    s.shownMediaAfter = false;
                    s.navPage = 'game';
                    s.gamePage = 'nowNormalGame'
                })
                break;
        }
    };

    useEffect(() => {
        initEventListener();
        getAppState();
    }, []);

    const openModal = async (data, modalType) => {
        if (teamsResult.length > 0) {
            const modalTeam = teamsResult.find(team => team.team_name === data);
            setTeamInModal(modalTeam);
        } else {
            const modalTeam = teamsRegistered.find(team => team.team_name === data);
            setTeamInModal(modalTeam);
        }

        if (modalType === 'results') {
            setBlitzResultsModalOpened(true);
        } else if (modalType === 'answers') {
            setShowAnswers(true);
            setModalAnswers(data);
        } else if (modalType === 'delete') {
            setDeletingTeam(true);
        } else if (modalType === 'rename') {
            setRenamingTeam(true);
        }
    };

    const clickModalOk = async () => {
        if (deletingTeam) await request.deleteTeam(teamInModal.uid);
        else if (renamingTeam) await request.renameTeam(teamInModal.uid, renamingTeamInput.current.value);

        const appState = await request.getAppState();
        const {teams} = appState.data;

        AppStore.update(s => {
            s.teamsRegistered = teams;
            s.teamsResult = teams;
            s.teamsCount = teams.length;
        });
        clickModalBack();
    };

    const clickModalBack = () => {
        setDeletingTeam(false);
        setRenamingTeam(false);
        setTeamInModal({});
    };

    const pages = {
        'gameInfo':      <GameInfo/>,
        'registerTeams': <RegisterTeams openModal={openModal}/>,
        'startGame':     <StartGame getAppState={getAppState}/>,
        'nowNormalGame': <NowNormalGame getAppState={getAppState}/>,
        'chooseTactics': <ChooseTactics getAppState={getAppState}/>,
        'showQuestion':  <ShowQuestion/>,
        'chooseAnswers': <ChooseAnswers getAppState={getAppState} openModal={openModal}/>,
        'showCorrect':   <ShowCorrect/>,
        'showResults':   <ShowResults getAppState={getAppState} openModal={openModal}/>,
        'blitzTime':     <BlitzTime getAppState={getAppState}/>,
        'gameFinished':  <GameFinished/>,
    };

    const getContent = () => {
        if (navPage === 'game' || navPage === 'register') return pages[gamePage];
        if (navPage === 'table') return <TournirTable openModal={openModal}/>;
        if (navPage === 'rules') return <Rules/>;
    };

    return (
        <div className="app">
            {navPage !== 'register'
                ? <Navigation getAppState={getAppState}/>
                : <div style={{'paddingTop': '38.8px'}}/>
            }
            <Header/>
            { getContent() }
            { renamingTeam &&
                <div className="modal__wrapper">
                    <div className="modal">
                        <p className={'modal__p'}>Переименовать команду</p>
                        <div>
                            <img className="register-teams__edit_icon" src={editIcon} alt="edit"/>
                            <input type="text" ref={renamingTeamInput} className={'modal__input'}/>
                        </div>
                        <button className={'modal__button'} onClick={clickModalOk}>Ок</button>
                    </div>
                </div>
            }
            { deletingTeam &&
                <div className="modal__wrapper">
                    <div className="modal">
                        <p className={'modal__p'}>Удалить команду</p>
                        <p className={'modal__p modal__p_margin'}>{teamInModal.team_name}?</p>
                        <div className={'modal__buttons'}>
                            <button className={'modal__button'} onClick={clickModalBack}>Отмена</button>
                            <button className={'modal__button'} onClick={clickModalOk}>Ок</button>
                        </div>
                    </div>
                </div>
            }
            { showAnswers &&
                <div className="modal__wrapper">
                    <div className="modal answers-modal">
                        <div className="modal__answers-header">
                            <h2 className={'modal__p'}>Варианты ответов</h2>
                            <hr/>
                        </div>
                        <ol>
                            { modalAnswers.map(answer => (
                                <li>{answer}</li>
                            ))}
                        </ol>
                        <button className={'modal__close-button'} onClick={() => setShowAnswers(false)}>Закрыть</button>
                    </div>
                </div>
            }
            { blitzResultsModalOpened && <BlitzResultsModal
                teamInModal={teamInModal}
                setBlitzResultsModalOpened={setBlitzResultsModalOpened}
            /> }
        </div>
    )
}

export default App;
