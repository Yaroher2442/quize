import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {AppStore, RequestHandler} from 'utils';
import './style.css';

const RegisterTeam = () => {

    const {
        skipEmails,
    } = AppStore.useState(s => ({
        skipEmails: s.skipEmails,
    }));

    const [teamName, setTeamName] = useState('');
    const [teamTable, setTeamTable] = useState('');

    const toastLoading = React.useRef(null);
    const request = new RequestHandler();

    const goToNextPage = () => {
        if (!skipEmails) {
            if (teamName !== '' && teamTable !== '') {
                AppStore.update(s => {
                    s.teamName = teamName;
                    s.teamTable = teamTable;
                    s.gamePage = 'registerPlayers';
                });
            }
            else toast('Пожалуйста, заполните все поля', {toastId: 'fieldsEmpty'});
        }
        else {
            toastLoading.current = toast.loading("Регистрация команды...");
            request.registerTeam({
                "team_name": teamName,
                "table_num": teamTable,
                "users": []
            })
                .then(res => {
                    toast.update(toastLoading.current, { render: "Команда успешно зарегистрирована!", type: "success", isLoading: false });
                    const { team_id } = res.data;
                    localStorage.setItem('team_id', team_id);
                    AppStore.update(s => {
                        s.teamID = team_id;
                        s.gamePage = 'pickAvatar';
                    });
                    setTimeout(() => toast.dismiss(toastLoading.current), 2000);
                })
                .catch(() => {
                    toast.update(toastLoading.current, { render: "Ошибка регистрации команды. Обратитесь к администратору", type: "error", isLoading: false });
                    AppStore.update(s => {s.gamePage = 'registerTeam'});
                    setTimeout(() => toast.dismiss(toastLoading.current), 4000);
                })
                .finally(() => {
                    setTimeout(() => toast.dismiss(toastLoading.current), 10000);
                })
        }
    };

    return(
        <section className="register-team">
            <div />
            <div className={'register-team__div'}>
                <h1 className="register-team__title">Регистрация</h1>
                <input type="text" className="register-team__input_text" onChange={ (name) => setTeamName(name.target.value) } placeholder="Введите название команды"/>
                <input type="number" className="register-team__input_text" onChange={ (table) => setTeamTable(table.target.value) } placeholder="Введите номер стола" />
            </div>
            <button className="button button_register" onClick={() => goToNextPage() }>Дальше</button>
        </section>
    )
}

export default RegisterTeam;
