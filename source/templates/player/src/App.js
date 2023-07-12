import React, {useState, useEffect} from 'react';
import {ToastContainer, Flip} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {RequestHandler, AppStore} from 'utils';
import {Header, NavMenu} from 'components';
import {
    TextHello,
    RegisterTeam,
    RegisterPlayers,
    PickAvatar,
    TextBeforeGame,
    TextBeforeTactics,
    ChooseTactics,
    TacticsAlone,
    TacticsBet,
    TacticsEasy,
    TacticsPoints,
    TacticsVabank,
    TextBeforeQuestion,
    TextWithQuestion,
    TextAfterGame,
    QuestionInput,
    QuestionSelect,
    RoundResult,
    BeforeBlitz,
    BlitzInput,
    BlitzResults,
    Rules,
    TournirTable, WaitingRound,
} from 'pages';
import './styles/app.css';
import './styles/global.css';


const App = () => {


    const [gameStarted, setGameStarted] = useState(false);
    const [blitzModalOpened, setBlitzModalOpened] = useState(false);
    const [blitzModalType, setBlitzModalType] = useState('none');
    const [unavailableOrientation, setUnavailableOrientation] = useState(false);

    const onConfirmRefresh = function (event) {
        event.preventDefault();
        return event.returnValue = "Вы уверены, что хотите покинуть страницу?";
    }

    const request = new RequestHandler();

    const onResize = debounce(() => {
        setUnavailableOrientation(window.outerWidth > window.outerHeight)
    }, 500);

    window.addEventListener("beforeunload", onConfirmRefresh, {capture: true});
    window.addEventListener('resize', onResize)

    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    const {
        backgroundGradient,
        accentColor,
        navPage,
        gamePage,
        currentScore,
        currentPlace,
        blitzQuestions,
        teamBlitzAnswers,
    } = AppStore.useState(s => ({
        backgroundGradient: s.backgroundGradient,
        accentColor: s.accentColor,
        navPage: s.navPage,
        gamePage: s.gamePage,
        currentScore: s.currentScore,
        currentPlace: s.currentPlace,
        blitzQuestions: s.blitzQuestions,
        teamBlitzAnswers: s.teamBlitzAnswers,
    }));


    const shuffleBackground = () => {
        const themes = [
            {
                color: '#DD4A38',
                gradient: 'linear-gradient(180deg, #FE6651 0%, #E6442E 100%)',
            },
            {
                color: '#D56117',
                gradient: 'linear-gradient(180deg, #FEA21E 0%, #E85D14 100%)',
            },
            {
                color: '#1E4A87',
                gradient: 'linear-gradient(180deg, #499FDF 0%, #134989 100%)',
            },
            {
                color: '#479A6E',
                gradient: 'linear-gradient(180deg, #5EB185 0%, #5EB185 100%)',
            },
            {
                color: '#6168B8',
                gradient: 'linear-gradient(180deg, #9399E3 0%, #9399E3 100%)',
            },
        ];
        let newColor = '';
        let newGradient = '';
        while (newColor === '' || newColor === accentColor) {
            const newTheme = themes[Math.floor(Math.random() * themes.length)]
            newColor = newTheme.color;
            newGradient = newTheme.gradient;
        }
        AppStore.update(s => {
            s.backgroundGradient = newGradient;
            s.accentColor = newColor;
        });
    };

    const onEvtMessage = (ename, e) => {
        const kicked = localStorage.getItem('kicked');
        if (kicked === 'true') {
            if (ename === 'start' || ename === 'game_end') {
                localStorage.setItem('kicked', 'false');
            } else {
                AppStore.update(s => {
                    s.gamePage = 'textAfterGame';
                });
                return;
            }
        }

        let {payload: edata, teams: eteam} = JSON.parse(e.data);

        if (ename !== 'start' && eteam !== undefined) {
            const currentTId = localStorage.getItem('team_id');
            const currentTeam = eteam.find(team => {
                return team.uid === currentTId;
            });
            if (ename === 'team_was_removed' && edata.team_uid === currentTId) {
                AppStore.update(s => {
                    s.gamePage = 'textAfterGame';
                });
                localStorage.setItem('kicked', 'true');
                return;
            }
            AppStore.update(s => {
                s.availableTactics = currentTeam.tactic_balance;
                s.currentScore = currentTeam.current_score;
                s.currentPlace = currentTeam.current_place;
                s.teamBlitzAnswers = currentTeam.current_blitz_answers;
                s.teamResult = currentTeam.current_counted;
            });
        }

        switch (ename) {
            case 'start':
                console.log('edata ===', edata);
                AppStore.update(s => {
                    s.gamePage = 'registerTeam';
                    s.skipEmails = edata.skip_emails;
                });
                break;
            case 'next_question':
                localStorage.removeItem('usedRemoveAnswer');
                const {
                    type: qType,
                    settings,
                    questions,
                    current_round,
                    current_question,
                    all_rounds,
                    all_questions
                } = edata;
                console.log('edata ===', edata);
                const tid = localStorage.getItem('team_id');
                AppStore.update(s => {
                    if (tid !== null) {
                        s.currentTactic = eteam.find(team => team.uid === tid).current_tactic ?? null;
                    }
                    s.currentAnswer = null;
                    s.currentBlitzQuestionId = 1;
                    s.usedRemoveAnswer = 0;
                    s.currentQuestion = current_question;
                    s.questionsCount = all_questions;
                    s.currentRound = current_round;
                    s.roundsCount = all_rounds;
                    s.blitzQuestions = questions;
                    s.roundType = qType;
                    s.timeToAnswer = settings.time_to_answer;
                    s.timeToAnswerLeft = settings.time_to_answer;
                    s.navPage = 'game';
                    if (qType === 'blitz') s.gamePage = 'beforeBlitz';
                    else s.gamePage = 'textBeforeTactics';
                });
                break;
            case 'show_question':
                const {question, answers, type, correct_answer, time_to_answer} = edata;
                AppStore.update(s => {
                    s.questionName = question;
                    s.answers = answers;
                    s.answersType = type;
                    s.correctAnswer = correct_answer;
                    s.timeToAnswer = time_to_answer;
                    s.timeToAnswerLeft = time_to_answer;
                    s.navPage = 'game';
                    s.gamePage = 'textWithQuestion';
                });
                break;
            case 'show_answers':
                AppStore.update(s => {
                    if (edata.type === 'blitz') s.gamePage = 'blitzInput';
                    else if (edata.type === 'select') s.gamePage = 'questionSelect';
                    else if (edata.type === 'text') s.gamePage = 'questionInput';
                    s.navPage = 'game';
                });
                break;
            case 'show_correct':
                const {type: roundType} = edata;
                AppStore.update(s => {
                    if (roundType === 'blitz') s.gamePage = 'blitzResults';
                    s.navPage = 'game';
                    s.showCorrectAnswer = true;
                });
                break;
            case 'show_results':
                localStorage.removeItem('usedRemoveAnswer');
                AppStore.update(s => {
                    s.usedRemoveAnswer = 0;
                    s.currentTactic = null;
                    s.navPage = 'game';
                    s.gamePage = 'roundResult';
                    s.showCorrectAnswer = false;
                });
                break;
            case 'next_round':
                AppStore.update(s => {
                    s.navPage = 'game';
                    s.gamePage = 'waitingRound';
                });
                break;
            case 'game_end':
                localStorage.setItem('kicked', 'false');
                AppStore.update(s => {
                    s.navPage = 'register';
                    s.gamePage = 'textAfterGame';
                });
                break;
        }
    };

    const initEventListener = () => {
        const {NODE_ENV, REACT_APP_SERVER_URL} = process.env;
        const server = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;
        let evtSource = new EventSource(server + '/event');
        evtSource.addEventListener('start', e => onEvtMessage('start', e));
        evtSource.addEventListener('next_question', e => onEvtMessage('next_question', e));
        evtSource.addEventListener('show_question', e => onEvtMessage('show_question', e));
        evtSource.addEventListener('show_answers', e => onEvtMessage('show_answers', e));
        evtSource.addEventListener('show_correct', e => onEvtMessage('show_correct', e));
        evtSource.addEventListener('show_results', e => onEvtMessage('show_results', e));
        evtSource.addEventListener('game_end', e => onEvtMessage('game_end', e));
        evtSource.addEventListener('team_was_updated', e => onEvtMessage('team_was_updated', e));
        evtSource.addEventListener('team_was_removed', e => onEvtMessage('team_was_removed', e));
        evtSource.addEventListener('next_round', e => onEvtMessage('next_round', e));
    };

    const getAppState = async () => {
        const kicked = localStorage.getItem('kicked');
        if (kicked === 'true') {
            AppStore.update(s => {
                s.gamePage = 'textAfterGame';
            });
            return;
        }
        const appState = await request.getAppState();
        const {
            teams,
            timer,
            stage,
            question,
            round,
            prv_stage,
            current_round,
            current_question,
            all_rounds,
            all_questions,
            skip_emails
        } = appState.data;
        const tid = localStorage.getItem('team_id');
        let currTeam;
        if (tid != null) {
            currTeam = teams.find(team => team.uid === tid);
            if (currTeam) {
                AppStore.update(s => {
                    s.currentTactic = currTeam.current_tactic;
                    s.teamID = currTeam.uid;
                    s.teamName = currTeam.team_name;
                    s.teamTable = currTeam.table_num;
                    s.pickedAvatar = currTeam.avatar !== '' ? currTeam.avatar : 'default.png';
                    s.teamResult = currTeam.current_counted;
                    s.currentScore = currTeam.current_score;
                    s.currentPlace = currTeam.current_place;
                    s.availableTactics = currTeam.tactic_balance;
                    s.teamBlitzAnswers = currTeam.current_blitz_answers;
                    s.currentAnswer = currTeam.current_answer;
                });
            }
        }

        console.log('appState ===', appState);

        AppStore.update(s => {
            s.skipEmails = skip_emails;
            s.currentQuestion = current_question;
            s.questionsCount = all_questions;
            s.currentRound = current_round;
            s.roundsCount = all_rounds;
            s.roundType = round.type;
            s.questionName = question.question;
            s.answers = question.answers;
            s.answersType = question.type;
            s.correctAnswer = question.correct_answer;
            s.timeToAnswer = question.time_to_answer ?? round.settings.time_to_answer;
            s.timeToAnswerLeft = timer ?? question.time_to_answer ?? round.settings.time_to_answer;
            s.blitzQuestions = round.questions;
            s.usedRemoveAnswer = parseInt(localStorage.getItem('usedRemoveAnswer') ?? 0);
        });

        if (parseInt(localStorage.getItem('usedRemoveAnswer') ?? 0) === 2) {
            let sliced = question.answers.slice();
            for (let i = 0; i < 2; i++) {
                if (sliced[sliced.length - 1] !== question.correct_answer) {
                    sliced.pop();
                } else {
                    sliced.shift();
                }
            }
            AppStore.update(s => {
                s.answers = sliced;
            });
        }

        switch (stage) {
            case 'WAITING_START':
                break;
            case 'WAITING_NEXT':
                AppStore.update(s => {
                    if (currTeam && prv_stage === 'WAITING_START') {
                        tid == null
                            ? s.gamePage = 'registerTeam'
                            : s.gamePage = 'textBeforeGame'
                    } else if (currTeam && prv_stage === 'SHOW_RESULTS') {
                        s.navPage = 'game';
                        s.gamePage = 'chooseTactics';
                    } else s.gamePage = 'registerTeam'
                });
                break;
            case 'CHOSE_TACTICS':
                localStorage.removeItem('usedRemoveAnswer');
                AppStore.update(s => {
                    s.usedRemoveAnswer = 0;
                    s.navPage = 'game';
                    if (round.type === 'blitz') {
                        s.gamePage = 'beforeBlitz';
                    } else if (currTeam.current_tactic === null) {
                        s.gamePage = 'textBeforeTactics';
                    } else {
                        s.gamePage = 'textBeforeQuestion';
                    }
                });
                break;
            case 'ALL_CHOSE':
            case 'SHOW_MEDIA_BEFORE':
                AppStore.update(s => {
                    s.navPage = 'game';
                    s.gamePage = 'textBeforeQuestion';
                });
                break;
            case 'SHOW_QUESTION':
                AppStore.update(s => {
                    if (round.type === 'blitz') s.gamePage = 'beforeBlitz';
                    else s.gamePage = 'textWithQuestion';
                    s.navPage = 'game';
                });
                break;
            case 'CHOSE_ANSWERS':
            case 'ALL_ANSWERED':
            case 'SHOW_MEDIA_AFTER':
                AppStore.update(s => {
                    s.navPage = 'game';
                    if (round.type === 'blitz') s.gamePage = 'blitzInput';
                    else if (question.type === 'select') s.gamePage = 'questionSelect';
                    else if (question.type === 'text') s.gamePage = 'questionInput';
                });
                break;
            case 'SHOW_CORRECT_ANSWER':
                AppStore.update(s => {
                    s.showCorrectAnswer = true;
                    s.navPage = 'game';
                    if (round.type === 'blitz') s.gamePage = 'blitzResults';
                    else if (question.type === 'select') s.gamePage = 'questionSelect';
                    else if (question.type === 'text') s.gamePage = 'questionInput';
                });
                break;
            case 'SHOW_RESULTS':
                localStorage.removeItem('usedRemoveAnswer');
                AppStore.update(s => {
                    s.usedRemoveAnswer = 0;
                    s.showCorrectAnswer = false;
                    s.navPage = 'game';
                    s.gamePage = 'roundResult';
                });
                break;
            case 'NEXT_ROUND':
                AppStore.update(s => {
                    s.navPage = 'game';
                    s.gamePage = 'waitingRound';
                });
                break;
        }
    };

    useEffect(() => {
        onResize();
        initEventListener();
        getAppState();
    }, []);

    useEffect(() => {
        if (navPage !== 'register') setGameStarted(true);
        if (gameStarted) shuffleBackground();
    }, [gamePage, gameStarted, navPage]);

    const openBlitzModal = (type) => {
        setBlitzModalOpened(true);
        setBlitzModalType(type);
    };

    const pages = {
        textHello: <TextHello/>,
        registerTeam: <RegisterTeam/>,
        registerPlayers: <RegisterPlayers/>,
        textBeforeGame: <TextBeforeGame/>,
        textBeforeTactics: <TextBeforeTactics/>,
        chooseTactics: <ChooseTactics/>,
        tacticsAlone: <TacticsAlone/>,
        tacticsBet: <TacticsBet/>,
        tacticsEasy: <TacticsEasy/>,
        tacticsPoints: <TacticsPoints/>,
        tacticsVaBank: <TacticsVabank/>,
        textBeforeQuestion: <TextBeforeQuestion/>,
        textWithQuestion: <TextWithQuestion/>,
        textAfterGame: <TextAfterGame/>,
        questionInput: <QuestionInput/>,
        questionSelect: <QuestionSelect/>,
        roundResult: <RoundResult openBlitzModal={openBlitzModal}/>,
        beforeBlitz: <BeforeBlitz/>,
        blitzInput: <BlitzInput getAppState={getAppState}/>,
        blitzResults: <BlitzResults/>,
        pickAvatar: <PickAvatar/>,
        waitingRound: <WaitingRound/>,
    }

    const getContent = () => {
        if (navPage === 'game' || navPage === 'register') return pages[gamePage];
        if (navPage === 'table') return <TournirTable/>;
        if (navPage === 'rules') return <Rules/>
    };

    const getBlitzAnswers = () => {
        const answers = [];
        for (let i = 0; i < blitzQuestions.length; i++) {
            if (i < Object.keys(teamBlitzAnswers).length) {
                answers.push({
                    "teamAnswer": teamBlitzAnswers[i].answr,
                    "correctAnswer": blitzQuestions[i].correct_answer,
                    "isCorrect": teamBlitzAnswers[i].correct,
                    "question": blitzQuestions[i].question
                });
            }
        }
        console.log('answers === ', answers);
        return answers;
    };

    const [defaultHeight, setDefaultHeight] = useState(window.innerHeight);
    useEffect(() => {
        setDefaultHeight(window.innerHeight);
        window.addEventListener('resize', (e) => {
            window.innerHeight = defaultHeight;
        });
    }, []);

    return (
        <div className={`app ${navPage === 'register' && !unavailableOrientation ? 'app__register' : ''}`}>
            <ToastContainer
                transition={Flip} // Slide, Zoom, Flip, Bounce
                position="top-right"
                autoClose={4000}
                closeButton={false}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
            />
            {unavailableOrientation
                ? <div className={'app__unavailable-orientation'}>
                    <p>Пожалуйста, поверните ваш девайс вертикально</p>
                </div>
                : <div className="app__wrapper"
                       style={{background: backgroundGradient}}>
                    <Header gameStarted={navPage !== 'register'} currentScore={currentScore}
                            currentPlace={currentPlace}/>
                    {getContent()}
                </div>
            }
            {(navPage !== 'register' && localStorage.getItem('kicked') !== 'true' && !unavailableOrientation)
                && <NavMenu getAppState={getAppState}/>
            }
            {blitzModalOpened &&
                <div className="modal__wrapper">
                    {blitzModalType === 'right' &&
                        <div className={'modal'}>
                            <h2 className={'modal__header'}>Правильные ответы</h2>
                            <div className={'modal__answers'}>
                                {getBlitzAnswers()
                                    .filter(a => a.isCorrect)
                                    .map(answer => (
                                        <div className={'modal__row'} key={answer.id}>
                                            <p className={'modal__question'}>{answer.question}</p>
                                            <div>
                                                <p className={'modal__correct'}>{answer.correctAnswer}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <button className={'modal__button'} onClick={() => setBlitzModalOpened(false)}>Закрыть
                            </button>
                        </div>
                    }
                    {blitzModalType === 'wrong' &&
                        <div className={'modal'}>
                            <h2 className={'modal__header'}>Неправильные ответы</h2>
                            <div className={'modal__answers'}>
                                {getBlitzAnswers()
                                    .filter(a => !a.isCorrect && a.teamAnswer)
                                    .map(answer => (
                                        <div className={'modal__row'} key={answer.id}>
                                            <p className={'modal__question'}>{answer.question}</p>
                                            <div>
                                                <p className={'modal__team-answer'}>{answer.teamAnswer}</p>
                                                <p className={'modal__correct'}>{answer.correctAnswer}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <button className={'modal__button'} onClick={() => setBlitzModalOpened(false)}>Закрыть
                            </button>
                        </div>
                    }
                    {blitzModalType === 'noTime' &&
                        <div className={'modal'}>
                            <h2 className={'modal__header'}>Не отвечено</h2>
                            <div className={'modal__answers'}>
                                {getBlitzAnswers()
                                    .filter(a => a.teamAnswer === "")
                                    .map(answer => (
                                        <div className={'modal__row'} key={answer.id}>
                                            <p className={'modal__question'}>{answer.question}</p>
                                            <div>
                                                <p className={'modal__no-time'}>{answer.correctAnswer}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <button className={'modal__button'} onClick={() => setBlitzModalOpened(false)}>Закрыть
                            </button>
                        </div>
                    }
                </div>
            }
        </div>
    );
}

export default App;
