import React from 'react';
import './style.css';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from 'date-fns/locale';
registerLocale('ru', ru)

const LeadInput = ({title, placeholder, onChange, type = 'text'}) => {

    return(
        <div className={type === 'date' ? "lead-input lead-input-date" : "lead-input"}>
            <span className="lead-input__title">{title}</span>
            { type === 'text' &&
                <input
                    className="lead-input__value"
                    type="text"
                    placeholder={placeholder}
                    onInput={(text) => onChange(text.target.value)}
                /> }
            { type === 'date' &&
                <DatePicker
                    className="lead-input__value"
                    selected={placeholder}
                    onChange={date => onChange(date)}
                    locale="ru"
                    dateFormat="dd.MM.yyyy"
                />}
        </div>
    )
}

export default LeadInput;