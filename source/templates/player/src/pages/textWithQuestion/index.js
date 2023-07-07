import React from 'react';
import {AppStore} from 'utils';

const TextWithQuestion = () => {

    const { questionName } = AppStore.useState(s => ({
        questionName: s.questionName
    }));

    return(
        <section>
            <h1>{questionName}</h1>
        </section>
    )
}

export default TextWithQuestion;