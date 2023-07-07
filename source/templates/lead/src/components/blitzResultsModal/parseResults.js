export const cropNumber = (num) => {
    const number = num.toString();
    const splitted = number.split('.');
    if (splitted.length === 1) return num;
    const sliceLength = splitted[0].length + 2;
    return number.slice(0, sliceLength);
};

export const parseResults = (teamResult, setResults) => {
    let parsedResults = [];

    if (!teamResult.correct) {
        parsedResults.push({
            'name': 'Неправильный ответ',
            'value': '0'
        });
        if (teamResult.question_bet !== 0.0) {
            parsedResults.push({
                'name': 'Баллы на бочку',
                'value': cropNumber(teamResult.earned_points)
            });
        }
        if (teamResult.all_in) {
            const val = teamResult.earned_points >= 0 ? `+${teamResult.earned_points}` : teamResult.earned_points
            parsedResults.push({
                'name': 'Ва-банк',
                'value': cropNumber(val)
            });
        }
        if (teamResult.team_bet !== '' && teamResult.team_bet !== null) {
            parsedResults.push({
                'name': 'Ставка на команду',
                'value': cropNumber(teamResult.team_bet_score)
            });
        }
    }
    else for (let [key, val] of Object.entries(teamResult)) {
        switch (key) {
            case 'base_score':
                if (!teamResult.all_in && teamResult.question_bet === 0.0) {
                    parsedResults.push({
                        'name': 'БАЗОВЫЕ БАЛЛЫ',
                        'value': cropNumber(val)
                    });
                }
                break;
            case 'remove_answer':
                if (val !== 0) {
                    let mul = 1;
                    for (let i = 0; i < val; i += 1) {
                        mul -= 0.25;
                    }
                    if (mul !== 0 && !teamResult.all_in) {
                        parsedResults.push({
                            'name': 'Убрать неверные ответы',
                            'value': 'x'+ mul
                        });
                    }
                }
                break;
            case 'correct_in_row_reached':
                if (val && teamResult.question_bet === 0.0 && !teamResult.all_in) {
                    parsedResults.push({
                        'name': 'Правильные ответы подряд',
                        'value': 'x3'
                    });
                }
                break;
            case 'one_for_all':
                if (val) {
                    parsedResults.push({
                        'name': 'Один за всех',
                        'value': 'x3'
                    });
                }
                break;
            case 'question_bet':
                if (val !== 0.0) {
                    parsedResults.push({
                        'name': 'Баллы на бочку',
                        'value': cropNumber(teamResult.earned_points)
                    });
                }
                break;
            case 'all_in':
                if (val) {
                    parsedResults.push({
                        'name': 'Ва-банк',
                        'value': cropNumber('+'+teamResult.earned_points)
                    });
                }
                break;
            case 'team_bet':
                if (val !== '' && val !== null) {
                    parsedResults.push({
                        'name': 'Ставка на команду',
                        'value': cropNumber(teamResult.team_bet_score)
                    });
                }
                break;
            case 'once_correct':
                if (val && teamResult.question_bet === 0.0 && !teamResult.all_in) {
                    parsedResults.push({
                        'name': 'Единственная команда, ответившая правильно',
                        'value': 'x2'
                    });
                }
                break;
        }
    }
    setResults(parsedResults);
};