import React, {useEffect, useState} from 'react';
import {Table} from 'components';
import {AppStore} from "utils";

const BlitzResults = () => {

    const {
        teamBlitzAnswers,
        blitzQuestions,
    } = AppStore.useState(s => ({
        teamBlitzAnswers: s.teamBlitzAnswers,
        blitzQuestions: s.blitzQuestions,
    }));

    const [tableData, setTableData] = useState([]);
    
    const getData = () => {
        let data = [];
        blitzQuestions.forEach(question => {
            const {id, question: qname, correct_answer} = question;
            data.push([qname, teamBlitzAnswers[id], correct_answer]);
        });
        console.log('data ===', data);
        return data;
    };
    
    useEffect(() => {
        setTableData(getData());
    }, []);

    return(
        <section>
            <h1>Результаты блиц-раунда</h1>
        </section>
    )
}

export default BlitzResults;
