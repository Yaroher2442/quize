import React, {useRef, useState} from 'react';
import { toast } from 'react-toastify';
import './style.css';
import {RequestHandler, AppStore } from 'utils';

const RegisterPlayers = () => {

    const request = new RequestHandler();

    const {
        teamName,
        teamTable,
    } = AppStore.useState(s => ({
        teamName: s.teamName,
        teamTable: s.teamTable,
    }));

    const [playersList, setPlayersList] = useState([{
        user_name: '',
        email: ''
    }]);

    const addPlayer = () => {
        const players = [...playersList];
        players.push({
            user_name: '',
            email: ''
        });
        setPlayersList(players);
    };

    const deletePlayer = (playerNum) => {
        const players = [...playersList];
        players.splice(playerNum, 1);
        setPlayersList(players);
    };

    const onChangePlayer = (playerNum, newValue, field) => {
        const players = [...playersList];
        players[playerNum][field] = newValue
        setPlayersList(players);
    };

    const emptyFieldsError = () => {
        playersList.forEach((player) => {
            if (player.user_name === "" || player.email === "") return true;
        })
        return false;
    };

    const toastLoading = React.useRef(null);

    const goToNextPage = () => {
        if (emptyFieldsError() === false) {
            toastLoading.current = toast.loading("Регистрация команды...");
            AppStore.update(s => {s.players = playersList});
            request.registerTeam({
                "team_name": teamName,
                "table_num": teamTable,
                "users": playersList
            })
            .then((res) => {
                toast.update(toastLoading.current, { render: "Команда успешно зарегистрирована!", type: "success", isLoading: false });
                const { team_id } = res.data;
                localStorage.setItem('team_id', team_id);
                AppStore.update(s => {s.teamID = team_id;});
                AppStore.update(s => {s.gamePage = 'pickAvatar'});
            })
            .catch(() => {
                toast.update(toastLoading.current, { render: "Ошибка регистрации команды. Обратитесь к администратору", type: "error", isLoading: false });
                AppStore.update(s => {s.gamePage = 'registerTeam'});
            })
            .finally(() => {
                setTimeout(() => toast.dismiss(toastLoading.current), 2000);
            })
        }
        else toast('Пожалуйста, заполните все поля', {toastId: 'fieldsEmpty2'})
    };

    return(
        <section className="register-players">
            <div />
            <div>
                <h1>Регистрация</h1>
                <h3>Введите данные игроков</h3>
                <h3 className="register-players__agree-rules">
                    Участие в квизе означает согласие с правилами квиза, а также политикой обработки персональных данных
                </h3>
                <div className="register-players__players">
                    { playersList.map((player, playerNum) => (
                             <div className="register-players__player" key={ playerNum }>
                                { playersList.length > 1 && // отображение "Игрок NUM", когда больше одного игрока
                                    <div className="register-players__player-info">
                                        <p className="register-players__player-info_num">Игрок { playerNum + 1 }</p>
                                        <button className="register-players__player-info_delete" onClick={ () => deletePlayer(playerNum) }>X</button>
                                    </div>
                                }
                                <input type="text" value={ player.user_name } onChange={(val) => onChangePlayer(playerNum, val.target.value, 'user_name') } className="register-players__player_name" placeholder="Имя игрока"/>
                                <input type="email" value={ player.email } onChange={(val) => onChangePlayer(playerNum, val.target.value, 'email')} className="register-players__player_mail" placeholder="E-mail игрока"/>
                            </div>
                        ))
                    }
                </div>
                <button className="button button_register register-players__add-player" onClick={() => addPlayer()}><span>+</span></button>
            </div>
            <button className="button button_register" onClick={() => goToNextPage()}>
                Зарегистрировать
            </button>
        </section>
    )
}

export default RegisterPlayers;
