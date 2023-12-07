import { Store } from "pullstate";

export const AppStore = new Store({
    navPage: 'register',
    gamePage: 'gameInfo',
    teamsCount: 0,
    teamsRegistered: [],
    isTestRound: false,
    isNextRoundTest: false,
    isBlitzRound: false,
    blitzCorrectScore: 0,
    nextBlitz: false,
    isNextRound: false,
    questionNumber: 1,
    questions: [],
    allTeamsChosenTactic: false,
    allTeamsChosenAnswer: false,
    teamsChosenTactic: [],
    teamsChosenAnswer: [],
    teamsResult: [],
    timerToAnswer: 100,
    timerToAnswerLeft: 100,
    gameFinished: false,
    shownMediaBefore: false,
    shownMediaAfter: false,
    mediaInQuestion: true,
    isLast: false
});
