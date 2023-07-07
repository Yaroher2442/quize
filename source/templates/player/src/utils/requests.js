import axios from "axios";

const { NODE_ENV, REACT_APP_SERVER_URL } = process.env;

export class RequestHandler {
    _server = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;
    _teamId = localStorage.getItem('team_id');

    _sendRequest(url, method, data = null, headers = null) {
        return axios({
            url: url,
            method: method,
            data: data,
            headers: headers
        });
    };

    getAppState () {
        const url = this._server + '/game/state';
        return this._sendRequest(url, 'get');
    };

    getAvatars () {
        const url = this._server + '/game/avatars';
        return this._sendRequest(url, 'get');
    };

    postAvatar (body) {
        const url = this._server + '/team/'+ this._teamId + '/avatar';
        return this._sendRequest(url, 'post', body);
    };

    postCustomAvatar (body) {
        const url = this._server + '/game/avatars/'+ this._teamId +'/upload';
        return this._sendRequest(url, 'post', body, {
            'Content-Type': 'multipart/form-data'
        });
    };

    registerTeam (body) {
        const url = this._server + '/team';
        return this._sendRequest(url, 'post', body);
    };

    getTacticsRemained () {
        const url = this._server + '/team/' + this._teamId;
        return this._sendRequest(url, 'get');
    };

    getTeams () {
        const url = this._server + '/team/all';
        return this._sendRequest(url, 'get');
    }

    chooseTactic = (body) => {
        const url = this._server + '/team/' + this._teamId + '/tactic';
        return this._sendRequest(url, 'post', body)
    };

    sendAnswer = async (body) => {
        const url = this._server + '/team/' + this._teamId + '/answer';
        return this._sendRequest(url, 'post', body)
    };

    sendAnswerBlitz = async (body) => {
        const url = this._server + '/team/' + this._teamId + '/answer/blitz';
        return this._sendRequest(url, 'post', body)
    };

}
