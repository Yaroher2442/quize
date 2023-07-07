import { Store } from "pullstate";

export const AppStore = new Store({
    gamePage: 'textPage',
    pageTitle: 'Добро пожаловать!',
    mediaFileName: '',
    mediaType: '',
    teamsRegistered: [],
    blitzTime: null,
    allTeams: [],
    allAnswered: false,
    questionText: '',
    question: {},
    showQuestion: false
});
