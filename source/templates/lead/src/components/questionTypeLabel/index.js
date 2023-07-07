import React from 'react';
import './style.css';

const QuestionTypeLabel = ({type}) => (
    <button className="question-type-label">
        { type === 'select'
            ? 'Закрытый вопрос'
            : 'Открытый вопрос'
        }
    </button>
)

export default QuestionTypeLabel;