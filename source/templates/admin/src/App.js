import './App.css';
import {Button, QRCode} from 'antd';
import axios from 'axios';
import {useEffect, useState} from 'react';
import ReactJson from 'react-json-view'


const App = () => {

    const url = 'http://localhost:8844';

    const sendReload = async () => {
        await axios.post(url + '/admin/reload');
    }

    const sendRestart = async () => {
        await axios.post(url + '/admin/reset');
    }

    const updateData = async () => {
        let newJson = await axios.get(url + '/admin/data');
        setJson(newJson.data);
    }

    useEffect(() => {
        updateData();
        setInterval(updateData, 1000);
    }, []);

    const [json, setJson] = useState({});

    return (
        <div className="App">
            <div className="wrapper">
                <div className="left-container">
                    <div className="button-container">
                        <Button type="primary" onClick={sendReload}>Reload players</Button>
                        <Button type="primary" danger onClick={sendRestart}>Restart game (!)</Button>
                    </div>
                    <div className='json-container'>
                        <ReactJson src={json}/>
                    </div>
                </div>

                <div className="right-container">
                    <div className="qr-container">
                        <h3>Lead</h3>
                        <QRCode
                            value={window.location.origin + '/lead/ui/index.html'}
                            bgColor={'#ffffff'}
                            size={260}
                        />
                    </div>
                    <div className="qr-container">
                        <h3>Player</h3>
                        <QRCode
                            value={window.location.origin + '/player/ui/index.html'}
                            bgColor={'#ffffff'}
                            size={260}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
