import { Space, Button, Modal, QRCode } from 'antd';
import axios from 'axios';
import {useState} from 'react';

export const ButtonsContainer = ({baseUrl}) => {
    const [isLeadQROpen, setIsLeadQROpen] = useState(false);
    const [isPlayerQROpen, setIsPlayerQROpen] = useState(false);

    const sendReload = async () => {
        await axios.post(baseUrl + '/admin/reload');
    }

    const sendRestart = async () => {
        await axios.post(baseUrl + '/admin/reset');
    }

    const sendBackStage = async () => {}
    const sendNextStage = async () => {}

    return (
        <div className="button-container">
            <Space>
                <Space.Compact block>
                    <Button type="primary" onClick={sendBackStage}>Prev stage</Button>
                    <Button type="primary" onClick={sendNextStage}>Next stage</Button>
                </Space.Compact>
                <Button type="primary" onClick={() => setIsLeadQROpen(true)}>Lead QR</Button>
                <Button type="primary" onClick={() => setIsPlayerQROpen(true)}>Players QR</Button>
            </Space>

            <Space>
                <Button type="primary" onClick={sendReload}>Reload players</Button>
                <Button type="primary" danger onClick={sendRestart}>Restart game (!)</Button>
            </Space>

            <Modal
                title="Lead QR" 
                footer={null}
                width={308}
                open={isLeadQROpen} 
                onOk={() => setIsLeadQROpen(false)} 
                onCancel={() => setIsLeadQROpen(false)}
            >
                <QRCode
                    value={window.location.origin + '/lead/ui/index.html'}
                    style={{margin: '0 auto'}}
                    bgColor={'#ffffff'}
                    size={260}
                />
            </Modal>

            <Modal
                title="Player QR"
                footer={null}
                width={308}
                open={isPlayerQROpen} 
                onOk={() => setIsPlayerQROpen(false)} 
                onCancel={() => setIsPlayerQROpen(false)}
            >
                <QRCode
                    value={window.location.origin + '/player/ui/index.html'}
                    style={{margin: '0 auto'}}
                    bgColor={'#ffffff'}
                    size={260}
                />
            </Modal>
        </div>
    );
};