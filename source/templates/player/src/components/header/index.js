import React, {useEffect, useState} from 'react';
import headerLogoGameUrl from 'assets/header/logo_game.png';
import headerRound from 'assets/header/round.png';
import headerQuestion from 'assets/header/question.png';
import headerScore from 'assets/header/score.png';
import './style.css';
import headerLogoRegister from "../../assets/header/logo_register.png";
import {AppStore, RequestHandler} from "../../utils";

const Header = ({gameStarted, currentScore, currentPlace}) => {

    const {
        currentQuestion,
        questionsCount,
        currentRound,
        roundsCount,
        accentColor,
        pickedAvatar,
        headerBlitzQuestionNum,
        roundType,
    } = AppStore.useState(s => ({
        currentQuestion: s.currentQuestion,
        questionsCount: s.questionsCount,
        currentRound: s.currentRound,
        roundsCount: s.roundsCount,
        accentColor: s.accentColor,
        pickedAvatar: s.pickedAvatar,
        headerBlitzQuestionNum: s.headerBlitzQuestionNum,
        roundType: s.roundType,
    }));

    const { NODE_ENV, REACT_APP_SERVER_URL } = process.env;
    const _server = NODE_ENV == 'development' ? REACT_APP_SERVER_URL : window.location.origin;
    const request = new RequestHandler();

    const [isCustomAvatar, setIsCustomAvatar] = useState(false);

    const checkIsCustomAvatar = async () => {
        const avatarsPaths = await request.getAvatars();
        if (!avatarsPaths.data.includes(pickedAvatar)) {
            setIsCustomAvatar(true);
        }
    };

    useEffect(() => {
        checkIsCustomAvatar();
    }, [])

    return (
        !gameStarted
            ? <div className="header__register">
                <img className="header__register_logo" src={headerLogoRegister} alt={'headerLogoRegister'}/>
              </div>
            : <div className="header__game">
                <div className="header__game_round">
                    <div className="header__game_text">
                        <p>Раунд</p>
                        <p>{currentRound +'/'+ roundsCount}</p>
                    </div>
                    <img src={headerRound} alt={'headerRound'}/>
                </div>
                <div className="header__game_logo">
                    <img src={headerLogoGameUrl} alt={'headerLogoGameUrl'}/>
                </div>
                <div className="header__game_question">
                    <div className="header__game_text">
                        <p>Вопрос</p>
                        {roundType === 'blitz'
                            ? <p>{headerBlitzQuestionNum + '/' + questionsCount}</p>
                            : <p>{currentQuestion + '/' + questionsCount}</p>
                        }
                    </div>
                    <img src={headerQuestion} alt={'headerQuestion'}/>
                </div>
                <div className="header__game_team-avatar">
                    <img src={_server + '/game/media/image/avatar/' + pickedAvatar} style={{...(isCustomAvatar && {'borderRadius': '50%'})}} alt="customAvatar"/>
                </div>
                <div className="header__game_score">
                    <div className="header__game_text">
                        <p style={{'color': accentColor}}><b>{currentPlace}</b> место</p>
                        <p style={{'color': accentColor}}><b>{currentScore}</b> баллов</p>
                    </div>
                    <hr style={{'backgroundColor': accentColor}}/>
                    <img src={headerScore} alt={'headerScore'}/>
                </div>
              </div>
    )
}

export default Header;
