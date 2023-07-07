import { Store } from "pullstate";

export const AppStore = new Store({
  players: [],

  // регистрация
  teamID: '',
  teamName: '',
  teamTable: '',
  roundType: '',
  pickedAvatar: 'default.png',

  // игра
  currentQuestion: 1,
  questionsCount: 10,
  currentRound: 1,
  roundsCount: 10,
  teamResult: [],
  currentScore: 0,
  currentPlace: 0,
  availableTactics: {},
  usedRemoveAnswer: 0,
  questionName: '',
  answers: [],
  answersType: '',
  currentTactic: null,
  correctAnswer: '',
  currentAnswer: null,
  showCorrectAnswer: false,
  timeToAnswer: 999,
  timeToAnswerLeft: null,
  blitzQuestions: [],
  teamBlitzAnswers: [],
  currentBlitzQuestionNum: 1,
  headerBlitzQuestionNum: 1,
  skip_emails: false,

  // UI
  navPage: 'register',
  gamePage: 'textHello',
  accentColor: '#566BAC',
  backgroundGradient: 'linear-gradient(180deg, #00CEA0 0%, #007A9F 100%)'
});
