import React from 'react';
import {AppStore} from "utils";
import './style.css';

const VideoPage = () => {

    const {
        mediaFileName,
        mediaType,
    } = AppStore.useState(s => ({
        mediaFileName: s.mediaFileName,
        mediaType: s.mediaType,
    }));

    const buildUrl = (gif=false) => {
        const _server = window.location.origin;
        if (gif) return _server + '/game/media/gif/loader.gif';
        switch (mediaType) {
            case 'videoBefore':
                return _server + '/game/media/video/before/' + mediaFileName + "?t=" + new Date();
            case 'videoAfter':
                return _server + '/game/media/video/after/'  + mediaFileName + "?t=" + new Date();
        }
    };

    return(
        <section className="video-page">
            <video src={buildUrl()} controls={false} autoPlay={true} poster={buildUrl(true)}></video>
        </section>
    )
}

export default VideoPage;
