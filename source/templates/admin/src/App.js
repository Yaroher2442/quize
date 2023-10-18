import './App.css';
import {Header, ButtonsContainer, TeamsTable, GameTable} from './components/_exports.js';
import axios from 'axios';
import {useEffect, useState} from 'react';


const App = () => {
    const { NODE_ENV, REACT_APP_SERVER_URL } = process.env;
    const baseUrl = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;

    const [json, setJson] = useState({});
    const [gameName, setGameName] = useState('');

    const getGameName = async () => {
        async function getGameInfo () {
            return await axios.get(baseUrl + '/game/info');
        }
        const gameInfo = await getGameInfo();
        setGameName(gameInfo.data.name);
    }

    const updateJson = async () => {
        let response = await axios.get(baseUrl + '/admin/data');
        setJson(response.data);
    }

    useEffect(() => {
        getGameName();
        updateJson();
        setInterval(updateJson, 1000);
    }, []);


    return (
        <div className="App">
            <div className="wrapper">
                <Header stage={(json.Game ?? {}).Stage ?? ''}/>
                <ButtonsContainer baseUrl={baseUrl} />

                <div className='content-container'>
                    <TeamsTable gameData={json}/>
                    <GameTable gameName={gameName} gameData={json}/>
                </div>
            </div>
        </div>
    );
}

export default App;
