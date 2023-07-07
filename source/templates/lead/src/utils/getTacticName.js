export function getTacticName (tactic) {
    switch (tactic) {
        case 'without':
            return 'Простая игра';
        case 'one_for_all':
            return 'Один за всех';
        case 'question_bet':
            return 'Баллы на бочку';
        case 'all_in':
            return 'Ва-банк';
        case 'team_bet':
            return 'Ставка на команду';
        default:
            return 'Не выбрана';
    }
}