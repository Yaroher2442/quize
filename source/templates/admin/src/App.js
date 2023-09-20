import './App.css';
import { Button, Space } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
    var intervalId = setInterval(updateData, 1000);
  }, []);

  const [json, setJson] = useState('');

  return (
    <div className="App">
      <header className="App-header">
          <Button type="primary" onClick={sendReload}>Reload players</Button>
          <div class="spacer1"></div>
          <Button type="primary" onClick={sendRestart}>Restart game (!)</Button>

          <div class="spacer1"></div>
          <div className='json-container'>
            <ReactJson src={json} />
          </div>
      </header>
    </div>
  );
}

export default App;
