import {SM2Result } from "../types/sm2.result.js"; 

/*- 0: Esquecimento total
- 1: Resposta incorreta, mas lembrou ao ver a resposta
- 2: Resposta incorreta, mas parecia fácil de lembrar
- 3: Resposta correta com dificuldade significativa
- 4: Resposta correta após hesitação
- 5: Resposta correta e fácil*/

export function calculateSM2 (
    grade: number,
    easeFactor: number,
    intervalDays: number,
    timesReviewed: number
): SM2Result {
    
    const newEaseFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    );

    if (grade < 3) {
        return {
            easeFactor: newEaseFactor,
            intervalDays: 1,
            nextReview: addDays(new Date(), 1),
            timesReviewed: 0
        };
    }

    let newInterval: number;
    if (timesReviewed === 0) newInterval = 1;
    else if (timesReviewed === 1) newInterval = 6;
    else newInterval = Math.round(intervalDays * newEaseFactor);

    return {
        easeFactor: newEaseFactor,
        intervalDays: newInterval,
        nextReview: addDays(new Date(), newInterval),
        timesReviewed: timesReviewed + 1
    }
} 

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
