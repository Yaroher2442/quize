import './App.css';
import {Header, ButtonsContainer, TeamsTable, GameJson} from './components/_exports.js';
import axios from 'axios';
import {useEffect, useState} from 'react';


const App = () => {

    const baseUrl = 'http://localhost:8844';

    return (
        <div className="App">
            <div className="wrapper">
                <Header baseUrl={baseUrl}/>
                <ButtonsContainer baseUrl={baseUrl} />

                <div className='content-container'>
                    <TeamsTable baseUrl={baseUrl}/>
                    <GameJson baseUrl={baseUrl}/>
                </div>
            </div>
        </div>
    );
}

export default App;
