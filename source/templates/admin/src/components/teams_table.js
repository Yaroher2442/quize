import { Table, Tag, Button, QRCode, Modal, Space, Popover, ConfigProvider } from 'antd';
import axios from 'axios';
import { useState, useEffect } from 'react';

export const TeamsTable = ({ gameData }) => {

    const [showCopied, setShowCopied] = useState('');
    const [qrOpened, setQrOpened] = useState('');
    const [dataSource, setDataSource] = useState([]);
    const columns = [
        {
            title: 'Команда',
            dataIndex: 'team_name',
            key: 'team_name',
        },
        {
            title: 'Ответ',
            dataIndex: 'current_answer',
            key: 'current_answer',
        },
        {
            title: 'Тактика',
            dataIndex: 'current_tactic',
            key: 'current_tactic',
        },
        {
            title: 'Ссылка',
            dataIndex: 'team_qr',
            key: 'team_qr',
        },
        // {
        //     title: 'Connection',
        //     dataIndex: 'connection',
        //     key: 'connection',
        // },
        // {
        //     title: 'IP',
        //     dataIndex: 'ip',
        //     key: 'ip',
        // },
        // {
        //     title: 'State',
        //     dataIndex: 'state',
        //     key: 'state',
        // },
    ];

    const updateTeams = async () => {
        function isEmpty(obj) {
            for (const prop in obj) {
                if (Object.hasOwn(obj, prop)) {
                    return false;
                }
            }
            return true;
        }

        let teamsData = [];

        if (!isEmpty(gameData)) {

            const copy = (url) => {
                if (showCopied) return;
                navigator.clipboard.writeText(url);
                setShowCopied(url);
                setTimeout(() => {
                    setShowCopied('');
                }, 2000);
            }

            gameData.Teams.forEach((team) => {
                teamsData.push({
                    team_name: team.team_name,
                    current_answer: team.current_answer,
                    current_tactic: team.current_tactic,
                    team_qr: <Space>
                        <Button type="primary" onClick={() => setQrOpened(team.url)}>QR</Button>
                        <div style={{width:'100px'}}><Button block={true} type="primary" onClick={() => copy(team.url)}>{showCopied == team.url ? 'Copied' : 'Copy link'}</Button></div>
                    </Space>
                },);
            });
        }

        setDataSource(teamsData);
    }

    useEffect(() => {
        updateTeams();
    }, [gameData]);

    return (
        <div className="teams-container">
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
            />
            <Modal
                title="Team QR"
                footer={null}
                width={308}
                open={qrOpened != ''}
                onOk={() => setQrOpened('')}
                onCancel={() => setQrOpened('')}
            >
                <QRCode
                    value={qrOpened}
                    style={{ margin: '0 auto' }}
                    bgColor={'#ffffff'}
                    size={260}
                />
            </Modal>
        </div>
    );
};