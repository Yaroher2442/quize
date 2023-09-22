import { Steps, ConfigProvider } from 'antd';

export const Header = ({baseUrl}) => {
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
                    current={1}
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
                            title: 'ALL',
                            description: 'ANSWERED'
                        },
                        {
                            title: 'MEDIA',
                            description: 'AFTER'
                        },
                        {
                            title: 'CHOSE',
                            description: 'ANSWERS'
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