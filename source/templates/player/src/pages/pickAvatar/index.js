import React, {useRef, useState} from 'react';
import {AvatarGallery, ImageCropper} from "components";
import {RequestHandler, AppStore } from "utils";
import './style.css';

const PickAvatar = () => {

    const {
        pickedAvatar,
        accentColor,
    } = AppStore.useState(s => ({
        pickedAvatar: s.pickedAvatar,
        accentColor: s.accentColor,
    }));

    const request = new RequestHandler();
    const [customAvatar, setCustomAvatar] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    const pickingAvatar = (e) => {
        setIsCropping(true);
        setCustomAvatar(e.target.files[0]);
    };
    
    const pickCustomAvatar = async (blob) => {
        const formData = new FormData();
        formData.append("image", blob);
        const res = await request.postCustomAvatar(formData);
        AppStore.update(s => {
            s.pickedAvatar = res.data.path;
            s.gamePage = 'textBeforeGame';
        });
    };

    const postAvatar = async () => {
        await request.postAvatar({
            "path": previewAvatar
        });
        AppStore.update(s => {
            s.pickedAvatar = previewAvatar;
            s.gamePage = 'textBeforeGame';
        });
    };

    const skipPage = async () => {
        await request.postAvatar({
            "path": pickedAvatar
        });
        AppStore.update(s => {
            s.gamePage = 'textBeforeGame'
        });
    };

    return(
        <section className="pick-avatar">
            <h2 className="pick-avatar__title">Аватар команды</h2>

            { isCropping
                ? <ImageCropper setIsCropping={setIsCropping} customAvatar={customAvatar} pickCustomAvatar={pickCustomAvatar}/>
                : <>
                    <AvatarGallery previewAvatar={previewAvatar} setPreviewAvatar={setPreviewAvatar}/>
                    <div className="pick-avatar__btns_wrapper">
                        <button onClick={() => skipPage()} style={{'color': accentColor}}>Без аватара</button>
                        <div className="pick-avatar__btns_spacer" />
                        <button
                            disabled={previewAvatar == null}
                            onClick={() => postAvatar()} style={{'color': accentColor}}>Выбрать</button>
                    </div>

                    <label htmlFor="pick-avatar__input_file" className="pick-avatar__input_file-label">
                        Выбрать из галереи
                    </label>
                    <input
                       id="pick-avatar__input_file"
                       onChange={pickingAvatar}
                       type="file" accept=".jpg, .jpeg, .png"
                       className="pick-avatar__input_file"/>
                </>
            }

        </section>
    )
}

export default PickAvatar;