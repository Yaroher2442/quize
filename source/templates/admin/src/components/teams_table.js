import { Table, Tag, } from 'antd';
import axios from 'axios';
import { useState, useEffect } from 'react';

export const TeamsTable = ({ baseUrl }) => {

    const [dataSource, setDataSource] = useState([
        {
            key: '1',
            name: 'Бобры',
            connection: <Tag color="green">+</Tag>,
            ip: '192.168.1.1',
            state: 'WAITING_START',
            tactic: 'ONE_FOR_ALL',
            answer: '123',
        },
        {
            key: '2',
            name: 'Хуебры',
            connection: <Tag color="red">-</Tag>,
            ip: '192.168.1.1',
            state: 'WAITING_START',
            tactic: 'ONE_FOR_ALL',
            answer: '123',
        },
        {
            key: '2',
            name: 'Пиздабры',
            connection: <Tag color="green">+</Tag>,
            ip: '192.168.1.1',
            state: 'WAITING_START',
            tactic: 'ONE_FOR_ALL',
            answer: '12312312312312312312312312312312312312312312',
        },
    ]);

    const [columns, setColumns] = useState([
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Connection',
            dataIndex: 'connection',
            key: 'connection',
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
        },
        {
            title: 'Tactic',
            dataIndex: 'tactic',
            key: 'tactic',
        },
        {
            title: 'Answer',
            dataIndex: 'answer',
            key: 'answer',
        },
    ]);

    const updateTeams = async () => {
        let newJson = await axios.get(baseUrl + '/admin/teams');
        setDataSource(newJson.data);
    }

    useEffect(() => {
        // updateTeams();
        // setInterval(updateTeams, 1000);
    }, []);

    return (
        <div className="teams-container">
            <Table
                dataSource={dataSource} 
                columns={columns}
                pagination={false}
            />
        </div>
    );
};