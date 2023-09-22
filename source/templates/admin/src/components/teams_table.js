import { Table } from 'antd';
import axios from 'axios';
import { useState, useEffect } from 'react';

export const TeamsTable = ({ baseUrl }) => {

    const [dataSource, setDataSource] = useState([
        {
            key: '1',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street',
        },
        {
            key: '2',
            name: 'John',
            age: 42,
            address: '10 Downing Street',
        },
    ]);

    const [columns, setColumns] = useState([
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
    ]);

    const updateTeams = async () => {
        let newJson = await axios.get(baseUrl + '/admin/teams');
        setDataSource(newJson.data);
    }

    useEffect(() => {
        updateTeams();
        setInterval(updateTeams, 1000);
    }, []);

    return (
        <div className="teams-container">
            <Table dataSource={dataSource} columns={columns} />;
        </div>
    );
};