import { Steps, ConfigProvider } from 'antd';
import {useEffect, useState} from 'react';

export const Header = ({stage}) => {
    const stageNumbers = {
        'GameStage.WAITING_START': 0,
        'GameStage.WAITING_NEXT': 1,
        'GameStage.CHOSE_TACTICS': 2,
        'GameStage.ALL_CHOSE': 3,
        'GameStage.SHOW_MEDIA_BEFORE': 4,
        'GameStage.SHOW_QUESTION': 5,
        'GameStage.CHOSE_ANSWERS': 6,
        'GameStage.ALL_ANSWERED': 7,
        'GameStage.SHOW_MEDIA_AFTER': 8,
        'GameStage.SHOW_CORRECT_ANSWER': 9,
        'GameStage.SHOW_RESULTS': 10,
        'GameStage.NEXT_ROUND': 11,
    }

    return (
        <header>
            <ConfigProvider
                theme={{
                    components: {
                    Steps: {
                        colorText: '#ffffff',
                        colorTextDescription: '#ffffff',
                        navArrowColor: '#1677ff',
                        colorFillContent: '#e6f4ff'
                    },
                    },
                }}
                >
                <Steps
                className='steps-container'
                type="navigation"
                size="small"
                    current={stageNumbers[stage]}
                    items={[
                        {
                            title: 'WAITING',
                            description: 'START'
                        },
                        {
                            title: 'WAITING',
                            description: 'NEXT'
                        },
                        {
                            title: 'CHOSE',
                            description: 'TACTICS'
                        },
                        {
                            title: 'ALL',
                            description: 'CHOSE'
                        },
                        {
                            title: 'MEDIA',
                            description: 'BEFORE'
                        },
                        {
                            title: 'SHOW',
                            description: 'QUESTION'
                        },
                        {
                            title: 'CHOSE',
                            description: 'ANSWERS'
                        },
                        {
                            title: 'ALL',
                            description: 'ANSWERED'
                        },
                        {
                            title: 'MEDIA',
                            description: 'AFTER'
                        },
                        {
                            title: 'CORRECT',
                            description: 'ANSWER'
                        },
                        {
                            title: 'SHOW',
                            description: 'RESULTS'
                        },
                        {
                            title: 'NEXT',
                            description: 'ROUND'
                        },
                    ]}
                />
            </ConfigProvider>
        </header>
    );
};