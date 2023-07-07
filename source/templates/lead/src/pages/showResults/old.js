// import React, {useEffect, useState} from 'react';
// import {AppStore, RequestHandler} from "../../utils";
// import {Table} from "components";
// import './style.css';
// import editIcon from "../../assets/edit.png";
//
// const ShowResults = ({getAppState, openModal}) => {
//     const request = new RequestHandler()
//
//     const {
//         teamsResult,
//         gameFinished,
//         navPage,
//         isTestRound,
//         questionNumber,
//         isLast,
//     } = AppStore.useState(s => ({
//         teamsResult: s.teamsResult,
//         gameFinished: s.gameFinished,
//         navPage: s.navPage,
//         isTestRound: s.isTestRound,
//         questionNumber: s.questionNumber,
//         isLast: s.isLast,
//     }));
//
//     const clearRoundData = () => {
//         AppStore.update(s => {
//             s.allTeamsChosenTactic = false;
//             s.allTeamsChosenAnswer = false;
//             s.teamsChosenTactic = [];
//             s.teamsChosenAnswer = [];
//             s.shownMediaAfter = false;
//             s.shownMediaBefore = false;
//         });
//     };
//
//     const getResult = () => {
//         const copyArr = [...teamsResult];
//         const sortedTeams = copyArr.sort((a,b) => {
//             const res = b.current_score - a.current_score;
//             if (res === 0) return a.table_num - b.table_num;
//             else return res;
//         });
//         return sortedTeams.map(team => [team.current_place, team.team_name, team.table_num, team.current_counted.earned_points, team.current_score]);
//     }
//
//     const openLastPage = async () => {
//         await request.nextQuestion();
//         AppStore.update(s => {
//             s.gamePage = 'gameFinished';
//         });
//     };
//
//     const openNextPage = async () => {
//         clearRoundData();
//         const res = await request.nextQuestion();
//         const {
//             settings: {is_test},
//             questions,
//             type: roundType,
//             state: {current_question},
//         } = res.data;
//         const currentQuestion = questions[questionNumber - 1];
//         localStorage.removeItem('usedRemoveAnswer');
//         if (roundType === 'blitz') await getAppState();
//         AppStore.update(s => {
//             if (isTestRound && !is_test) {
//                 s.gamePage = 'nowNormalGame';
//             }
//             else if (roundType === 'blitz') {
//                 s.gamePage = 'blitzTime';
//             }
//             else {
//                 s.gamePage = 'chooseTactics';
//             }
//             s.mediaInQuestion = currentQuestion.media_data.image.before !== '' || currentQuestion.media_data.video.before !== '';
//             s.questions = questions;
//             s.isBlitzRound = roundType === 'blitz'
//             s.isTestRound = is_test;
//             s.questionNumber = current_question;
//             s.navPage = 'game';
//         });
//     };
//
//     const [isEditing, setIsEditing] = useState(false);
//
//     const clickEdit = () => {
//         if (isEditing) setIsEditing(false);
//         else setIsEditing(true);
//     };
//
//     return(
//         <section className={`show-results ${gameFinished ? 'show-results_last' : ''}`}>
//             <div>
//                 <h1>{
//                     navPage === 'table'
//                         ? 'Турнирная таблица'
//                         : `Результаты ${gameFinished ? 'игры' : 'раунда'}`
//                 }</h1>
//                 <Table
//                     openModal={openModal}
//                     headers={['Место команды в игре ', 'Название команды', 'Номер стола', 'баллы за вопрос', 'всего баллов']}
//                     flex={[1, 3, 1, 1, 1]}
//                     data={getResult()}
//                     isEditing={isEditing}
//                 />
//                 <div className="show-results__edit" onClick={clickEdit}>
//                     <img className="show-results__edit_icon" src={editIcon} alt="edit"/>
//                     <p>{isEditing ? 'Сохранить изменения' : 'Редактировать список'}</p>
//                 </div>
//             </div>
//             { navPage === 'game' && (isLast
//                 ? <button onClick={openLastPage}>Конец игры</button>
//                 : <button onClick={openNextPage}>Следующий вопрос</button>)
//             }
//         </section>
//     )
// }
//
// export default ShowResults;