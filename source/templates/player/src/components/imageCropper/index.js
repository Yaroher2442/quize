import React, {useEffect, useState} from 'react';
import getCroppedImg from "./getCropped";
import Cropper from "react-easy-crop";
import './style.css';
import {AppStore} from "../../utils";

const ImageCropper = ({setIsCropping, customAvatar, pickCustomAvatar}) => {

    const {
        accentColor,
    } = AppStore.useState(s => ({
        accentColor: s.accentColor,
    }));

    const [crop, setCrop] = useState({x: 0, y: 0})
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [croppedImage, setCroppedImage] = useState(null)
    const [showResult, setShowResult] = useState(false);
    const [stringedImage, setStringedImage] = useState(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    useEffect(() => {
        const fr = new FileReader();
        fr.onload = (res) => setStringedImage(res.srcElement.result);
        fr.readAsDataURL(customAvatar);
    }, []);

    const showCroppedImage = async () => {
        try {
            const croppedImage = await getCroppedImg(
                stringedImage,
                croppedAreaPixels,
            )
            setCroppedImage(croppedImage);
            setShowResult(true);
        } catch (e) {
            console.error(e)
        }
    }

    // const blobToBase64 = (url) => {
    //     return new Promise(async (resolve, _) => {
    //         // do a request to the blob uri
    //         const response = await fetch(url);
    //         console.log('response ===', response);
    //
    //         // response has a method called .blob() to get the blob file
    //         const blob = await response.blob();
    //         console.log('blob ===', blob);
    //
    //         // instantiate a file reader
    //         const fileReader = new FileReader();
    //         console.log('fileReader ===', fileReader);
    //
    //         // read the file
    //         fileReader.readAsDataURL(blob);
    //
    //         fileReader.onloadend = function () {
    //             resolve(fileReader.result); // Here is the base64 string
    //         }
    //     });
    // };

    const finishCropping = async () => {
        const blob = await fetch(croppedImage).then(res => res.blob())
        console.log('blob ===', blob);
        pickCustomAvatar(blob);
    };

    return(
        <div className="image-cropper">
            <div />
            <div className="croparea">
                { showResult
                    ? <img src={croppedImage} alt="cropped" className={'cropped'} />
                    : <Cropper
                        image={stringedImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        classes={{
                            containerClassName: 'croparea__containerClassName',
                            mediaClassName: 'croparea__mediaClassName',
                            cropAreaClassName: 'croparea__cropAreaClassName'
                        }}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        cropShape={'round'}
                    />
                }
            </div>
            { showResult
                ? <div className="croparea__buttons">
                    <button onClick={() => setShowResult(false)} style={{'color': accentColor}}>
                        Назад
                    </button>
                    <div className="croparea__btns_spacer" />
                    <button onClick={finishCropping} style={{'color': accentColor}}>
                        Подтвердить
                    </button>
                </div>
                : <div className="croparea__buttons">
                    <button onClick={() => setIsCropping(false)} style={{'color': accentColor}}>
                        Назад
                    </button>
                    <div className="croparea__btns_spacer" />
                    <button onClick={showCroppedImage} style={{'color': accentColor}}>
                        Далее
                    </button>
                </div>
            }
        </div>
    )
}

export default ImageCropper;
