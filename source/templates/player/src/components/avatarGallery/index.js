import React, {useEffect, useState} from 'react';
import {RequestHandler} from "utils";
import './style.css';

const AvatarGallery = ({previewAvatar, setPreviewAvatar}) => {

    const request = new RequestHandler();
    const { NODE_ENV, REACT_APP_SERVER_URL } = process.env;
    const _server = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;

    const [avatars, setAvatars] = useState([]);

    const loadAvatars = async () => {
        const avatarsPaths = await request.getAvatars();
        setAvatars(avatarsPaths.data);
    };

    useEffect(() => {
        loadAvatars();
    }, []);

    return(
        <div className="avatar-gallery__wrapper">
            <div className="avatar-gallery">
                { avatars.map(avatar => (
                    <button onClick={() => setPreviewAvatar(avatar)} key={avatar}
                            disabled={previewAvatar !== null}>
                        <img src={_server + '/game/media/image/avatar/' + avatar} alt="avatar"/>
                    </button>
                ))}
            </div>
            { previewAvatar != null &&
                <button className="avatar-gallery__preview-avatar" onClick={() => setPreviewAvatar(null)}>
                    <img src={_server + '/game/media/image/avatar/' + previewAvatar} alt="avatar"/>
                </button>
            }
        </div>
    )
}

export default AvatarGallery;
