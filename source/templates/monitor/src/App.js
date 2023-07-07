import {TextPage, ResultsPage, RegisteredTeams, BlitzTimer, ImagePage, VideoPage} from 'pages';
import {Header} from "components";
import {AppStore, RequestHandler} from 'utils';
import {useEffect} from "react";
import './styles/app.css'

const App = () => {

    const request = new RequestHandler();

    const {
        gamePage,
    } = AppStore.useState(s => ({
        gamePage: s.gamePage,
    }));

    const onEvtMessage = (ename, e) => {
        let edata, eteams;

        if (ename !== 'game_end') {
            let { payload, teams } = JSON.parse(e.data);
            edata = payload;
            eteams = teams;
            AppStore.update(s => {s.allTeams = eteams;});
        }

        switch (ename) {
            case 'start':
                AppStore.update(s => {s.gamePage = 'registeredTeams';});
                break;
            case 'new_team':
                AppStore.update(s => {s.teamsRegistered = eteams;});
                break;
            case 'next_question':
                const {type: qType, settings, questions, current_question } = edata;
                const qText = questions[current_question-1].question;
                AppStore.update(s => {
                    s.questionText = qText;
                    if (qType === 'blitz') {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Раунд блиц';
                    }
                    if (qType === 'classical') {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Выберите тактику';
                    }
                    s.blitzTime = settings.time_to_answer
                });
                break;
            case 'media_before':
                getAppState();
                if (edata.image.before !== '' || edata.video.before !== '') {
                    AppStore.update(s => {
                        if (edata.show_image) {
                            s.showQuestion = false;
                            s.gamePage = 'imagePage';
                            s.mediaType = 'imageBefore';
                            s.mediaFileName = edata.image.before;
                        }
                        else {
                            s.gamePage = 'videoPage';
                            s.mediaType = 'videoBefore';
                            s.mediaFileName = edata.video.before
                        }
                    });
                }
                else {
                    AppStore.update(s => {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Выберите тактику';
                    });
                }
                break;
            case 'media_after':
                getAppState();
                if (edata.image.after !== '' || edata.video.after !== '') {
                    AppStore.update(s => {
                        if (edata.show_image) {
                            s.gamePage = 'imagePage';
                            s.mediaType = 'imageAfter';
                            s.mediaFileName = edata.image.after;
                        }
                        else {
                            s.gamePage = 'videoPage';
                            s.mediaType = 'videoAfter';
                            s.mediaFileName = edata.video.after
                        }
                    });
                }
                else if (edata.image.before !== '' && edata.show_image) {
                    AppStore.update(s => {
                        s.gamePage = 'imagePage';
                        s.mediaType = 'imageBefore';
                        s.mediaFileName = edata.image.before;
                    });
                }
                else if (gamePage !== 'answersPage') {
                    AppStore.update(s => {
                        s.gamePage = 'answersPage';
                    });
                }
                break;
            case 'show_question':
                AppStore.update(s => {
                    s.showQuestion = true;
                });
                if (edata.media_data.image.before !== '' && edata.media_data.show_image) {
                    AppStore.update(s => {
                        s.gamePage = 'imagePage';
                        s.mediaType = 'imageBefore';
                        s.mediaFileName = edata.media_data.image.before;
                    });
                }
                else {
                    AppStore.update(s => {
                        s.gamePage = 'textPage';
                        s.pageTitle = edata.question;
                    });
                }
                break;
            case 'show_answers':
                if (edata.media_data.image.before !== '' && edata.media_data.show_image) {
                    AppStore.update(s => {
                        s.allAnswered = false;
                    });
                    break;
                }
                AppStore.update(s => {
                    s.allAnswered = false;
                    if (edata.type === 'blitz') s.gamePage = 'blitzTimer';
                    else {
                        s.gamePage = 'answersPage';
                        s.pageTitle = edata.question;
                    }
                });
                break;
            case 'all_teams_chosen_answer':
                AppStore.update(s => {
                    s.allAnswered = true;
                })
                break;
            case 'show_correct':
                AppStore.update(s => {
                    s.allAnswered = false;
                    s.gamePage = 'textPage';
                    s.pageTitle = <>Правильный ответ: <br/> {edata.correct_answer}</>;
                });
                break;
            case 'show_results':
                AppStore.update(s => {s.gamePage = 'resultsPage';});
                break;
            case 'next_round':
                getAppState().then(r => {
                    AppStore.update(s => {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Раунд завершён.\nИгра скоро начнётся'
                    });
                });
                break;
            case 'game_end':
                AppStore.update(s => {
                    s.gamePage = 'textPage';
                    s.pageTitle = 'Спасибо за игру!';
                });
                break;
            case 'team_was_updated':
                AppStore.update(s => {
                    s.allTeams = eteams;
                    s.teamsRegistered = eteams;
                });
                break;
            case 'team_was_removed':
                getAppState();
                break;
        }
    };

    const initEventListener = () => {
        const { NODE_ENV, REACT_APP_SERVER_URL } = process.env;
        const server = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;
        let evtSource = new EventSource(server + '/event');
        evtSource.addEventListener('start',         e => onEvtMessage('start', e));
        evtSource.addEventListener('new_team',      e => onEvtMessage('new_team', e));
        evtSource.addEventListener('next_question', e => onEvtMessage('next_question', e));
        evtSource.addEventListener('show_question', e => onEvtMessage('show_question', e));
        evtSource.addEventListener('media_before',  e => onEvtMessage('media_before', e));
        evtSource.addEventListener('media_after',   e => onEvtMessage('media_after', e));
        evtSource.addEventListener('show_answers',  e => onEvtMessage('show_answers', e));
        evtSource.addEventListener('all_teams_chosen_answer',  e => onEvtMessage('all_teams_chosen_answer', e));
        evtSource.addEventListener('show_correct',  e => onEvtMessage('show_correct', e));
        evtSource.addEventListener('show_results',  e => onEvtMessage('show_results', e));
        evtSource.addEventListener('game_end',      e => onEvtMessage('game_end', e));
        evtSource.addEventListener('team_was_updated', e => onEvtMessage('team_was_updated', e));
        evtSource.addEventListener('team_was_removed', e => onEvtMessage('team_was_removed', e));
        evtSource.addEventListener('next_round', e => onEvtMessage('next_round', e));
    };

    const getAppState = async () => {
        const appState = await request.getAppState();
        const {teams, stage, question, round} = appState.data;

        AppStore.update(s => {
            s.teamsRegistered = teams;
            s.blitzTime = round.settings.time_to_answer;
            s.allTeams = teams;
            s.questionText = question.question;
            s.question = question
        });

        switch (stage) {
            case 'WAITING_START':
                break;
            case 'WAITING_NEXT':
                AppStore.update(s => {
                    s.gamePage = 'registeredTeams';
                });
                break;
            case 'CHOSE_TACTICS':
                AppStore.update(s => {
                    if (round.type === 'blitz') {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Раунд блиц';
                    }
                    if (round.type === 'classical') {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Выберите тактику';
                    }
                });
                break;
            case 'ALL_CHOSE':
                AppStore.update(s => {
                    if (round.type === 'blitz') {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Раунд блиц';
                    }
                    if (round.type === 'classical') {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Выберите тактику';
                    }
                });
                break;
            case 'SHOW_MEDIA_BEFORE':
                AppStore.update(s => {
                    s.showQuestion = false;
                })
                if (question.media_data.image.before !== '' || question.media_data.video.before !== '') {
                    AppStore.update(s => {
                        if (question.media_data.show_image && question.media_data.image.before !== '') {
                            s.gamePage = 'imagePage';
                            s.mediaType = 'imageBefore';
                            s.mediaFileName = question.media_data.image.before;
                        }
                        else {
                            s.gamePage = 'videoPage';
                            s.mediaType = 'videoBefore';
                            s.mediaFileName = question.media_data.video.before
                        }
                    });
                }
                else {
                    AppStore.update(s => {
                        s.gamePage = 'textPage';
                        s.pageTitle = 'Выберите тактику';
                    });
                }
                break;
            case 'SHOW_QUESTION':
            case 'CHOSE_ANSWERS':
            case 'ALL_ANSWERED':
                AppStore.update(s => {
                    s.showQuestion = true;
                })
                if (question.media_data.image.before !== '' && question.media_data.show_image) {
                    AppStore.update(s => {
                        s.gamePage = 'imagePage';
                        s.mediaType = 'imageBefore';
                        s.mediaFileName = question.media_data.image.before;
                        s.questionText = question.question;
                    });
                }
                else {
                    AppStore.update(s => {
                        if (round.type === 'blitz') s.gamePage = 'blitzTimer';
                        else {
                            s.gamePage = stage !== 'SHOW_QUESTION' ? 'answersPage' : 'textPage';
                            s.pageTitle = question.question;
                        }
                    });
                }
                break;
            case 'SHOW_MEDIA_AFTER':
                if (question.media_data.image.after !== '' || question.media_data.video.after !== '') {
                    AppStore.update(s => {
                        if (question.media_data.show_image) {
                            s.gamePage = 'imagePage';
                            s.mediaType = 'imageAfter';
                            s.mediaFileName = question.media_data.image.after;
                        } else {
                            s.gamePage = 'videoPage';
                            s.mediaType = 'videoAfter';
                            s.mediaFileName = question.media_data.video.after
                        }
                    });
                } else {
                    AppStore.update(s => {
                        s.gamePage = 'answersPage';
                        s.pageTitle = question.question;
                    });
                }
                break;
            case 'SHOW_CORRECT_ANSWER':
                AppStore.update(s => {
                    s.gamePage = 'textPage';
                    s.pageTitle = <>Правильный ответ: <br/> {question.correct_answer}</>;
                });
                break;
            case 'NEXT_ROUND':
                AppStore.update(s => {
                    s.gamePage = 'textPage';
                    s.pageTitle = 'Раунд завершён.\nИгра скоро начнётся';
                });
                break;
            case 'SHOW_RESULTS':
                AppStore.update(s => {s.gamePage = 'resultsPage';});
                break;
        }
    };

    const pages = {
        textPage:        <TextPage isAnswersPage={false}/>,
        resultsPage:     <ResultsPage/>,
        registeredTeams: <RegisteredTeams/>,
        imagePage:       <ImagePage/>,
        videoPage:       <VideoPage/>,
        blitzTimer:      <BlitzTimer/>,
        answersPage:     <TextPage isAnswersPage={true} getAppState={getAppState}/>
    }

    useEffect(() => {
        initEventListener();
        getAppState();
    }, [])


    return (
        <div className="app">
            {gamePage !== 'videoPage' && <Header/>}
            { pages[gamePage]}
        </div>
    )

}

export default App;
