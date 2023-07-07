import axios from "axios";

const { NODE_ENV, REACT_APP_SERVER_URL } = process.env;

export class RequestHandler {

    _server = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;

    _sendRequest(url, method, data = null) {
        return axios({
            url: url,
            method: method,
            data: data
        });
    };

    deleteTeam (uid) {
        const url = this._server + '/team/' + uid;
        return this._sendRequest(url, 'delete');
    };

    renameTeam (uid, newName) {
        const url = this._server + '/team/' + uid;
        return this._sendRequest(url, 'patch', {
            "new_name": newName
        });
    };

    getGameInfo () {
        const url = this._server + '/game/info';
        return this._sendRequest(url, 'get');
    };

    getAppState () {
        const url = this._server + '/game/state';
        return this._sendRequest(url, 'get');
    };

    startGame () {
        const url = this._server + '/game/start';
        return this._sendRequest(url, 'post');
    };

    endGame () {
        const url = this._server + '/game/end_game';
        return this._sendRequest(url, 'post');
    };

    nextQuestion () {
        const url = this._server + '/game/next_question';
        return this._sendRequest(url, 'post');
    };

    nextRound () {
        const url = this._server + '/game/next_round';
        return this._sendRequest(url, 'post');
    };

    showQuestion () {
        const url = this._server + '/game/show_question';
        return this._sendRequest(url, 'post');
    };

    showAnswers () {
        const url = this._server + '/game/show_answers';
        return this._sendRequest(url, 'post');
    };

    showCorrect () {
        const url = this._server + '/game/show_correct';
        return this._sendRequest(url, 'post');
    };

    showResult () {
        const url = this._server + '/game/show_results';
        return this._sendRequest(url, 'post');
    };

    showMediaBefore () {
        const url = this._server + '/game/media/before';
        return this._sendRequest(url, 'post');
    }

    showMediaAfter () {
        const url = this._server + '/game/media/after';
        return this._sendRequest(url, 'post');
    }
}
