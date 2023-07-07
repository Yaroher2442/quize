import axios from "axios";

export class RequestHandler {
    _server = process.env.NODE_ENV == 'development' ? process.env.REACT_APP_SERVER_URL : window.location.origin;

    _sendRequest(url, method, data = null) {
        return axios({
            url: url,
            method: method,
            data: data
        });
    };


    getAppState () {
        const url = this._server + '/game/state';
        return this._sendRequest(url, 'get');
    };

    getMedia(url) {
        return this._sendRequest(url, 'get');
    }

}
