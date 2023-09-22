import axios from 'axios';
import {useState, useEffect} from 'react';
import ReactJson from 'react-json-view'

export const GameJson = ({baseUrl}) => {
    
    const [json, setJson] = useState({});

    const updateJson = async () => {
        let newJson = await axios.get(baseUrl + '/admin/data');
        setJson(newJson.data);
    }

    useEffect(() => {
        // updateJson();
        // setInterval(updateJson, 1000);
    }, []);

    return (
        <div className="json-container">
            <ReactJson src={json}/>
        </div>
    );
};