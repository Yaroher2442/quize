import React from 'react';
import {AppStore} from "utils";
import ReactFitText from "react-fittext";
import './style.css';

const ImagePage = () => {

    const {
        mediaFileName,
        mediaType,
        questionText,
        showQuestion
    } = AppStore.useState(s => ({
        mediaFileName: s.mediaFileName,
        mediaType: s.mediaType,
        questionText: s.questionText,
        showQuestion: s.showQuestion,
    }));

    const { NODE_ENV, REACT_APP_SERVER_URL } = process.env;
    const _server = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;


    const getLoaderUrl = () => {
        return _server + '/game/media/gif/loader.gif';
    };

    const buildUrl = () => {
        switch (mediaType) {
            case 'imageBefore':
                return _server + '/game/media/image/before/' + mediaFileName;
            case 'imageAfter':
                return _server + '/game/media/image/after/'  + mediaFileName;
        }
    };

    return(
        <section className="image-page">
            <img src={buildUrl()} alt={getLoaderUrl()}/>
            {showQuestion && mediaType === 'imageBefore' &&
                <ReactFitText maxFontSize={36}>
                    <h1>{questionText}</h1>
                </ReactFitText>
            }
        </section>
    )
}

export default ImagePage;
