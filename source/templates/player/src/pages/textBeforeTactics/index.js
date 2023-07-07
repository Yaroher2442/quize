import React, { useEffect } from 'react';
import { AppStore } from 'utils';

const TextBeforeTactics = () => {

    useEffect(() => {
        setTimeout(() => {
            AppStore.update(s => {
                s.gamePage = 'chooseTactics';
            });
        }, process.env.NODE_ENV === 'development' ? 200 : 3000);
    }, []);

    return(
        <section className="text-before-tactics">
            <h1>Выбор тактики</h1>
        </section>
    )
}

export default TextBeforeTactics;
