import React, {useEffect, useState} from "react";
import {ReactComponent as Clock} from 'assets/countdown.svg';
import './style.css';
import {AppStore} from "utils";

const CountDown = ({totalTime, timeLeft}) => {

    const {
        accentColor,
    } = AppStore.useState(s => ({
        accentColor: s.accentColor,
    }));

    const [fillerWidth, setFillerWidth] = useState(100);
    const [formattedTime, setFormattedTime] = useState('99:99');

    const updateTimeLeft = () => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = Math.floor(timeLeft % 60);

        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;

        if (minutes > 0 || seconds > 0) setFormattedTime(`${minutes}:${seconds}`);
        else setFormattedTime('00:00');
    };

    const updateFillerWidth = () => {
        const newFillerWidth = timeLeft / (totalTime / 100);
        if (newFillerWidth > 0) setFillerWidth(newFillerWidth);
        else setFillerWidth(0);
    };

    useEffect(() => {
        updateTimeLeft();
        updateFillerWidth();
    }, [timeLeft]);

    return (
        <div className="countdown">
            <Clock/>
            <div className="countdown__line" style={{backgroundColor: accentColor}}>
                <div className="countdown__filler" style={{width: `${fillerWidth}%`}}/>
                {/*<div className="countdown__filler" style={{width: `100%`}}/>*/}
            </div>
            <div className="countdown__time">
                <span>{ formattedTime }</span>
            </div>
        </div>
    );
};

export default CountDown;