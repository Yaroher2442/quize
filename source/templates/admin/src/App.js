import './App.css';
import {Header, ButtonsContainer, TeamsTable, GameTable} from './components/_exports.js';
import axios from 'axios';
import {useEffect, useState} from 'react';


const App = () => {

    const { REACT_APP_SERVER_URL: baseUrl } = process.env
    const [json, setJson] = useState({});

    const updateJson = async () => {
        let response = await axios.get(baseUrl + '/admin/data');
        setJson(response.data);
    }

    useEffect(() => {
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
                    <GameTable gameData={json}/>
                </div>
            </div>
        </div>
    );
}

export default App;
