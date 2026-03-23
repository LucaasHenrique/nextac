export interface CreateReviewSessionBody {
    name: string;
    plannedDuration: number;
    questionIds?: string[];
}

export interface CreateSessionInput extends CreateReviewSessionBody {
    userId: string;
}

export interface AddQuestionsToSessionBody {
    questionIds: string[];
}

export interface SessionQuestionParams {
    id: string;
    questionId: string;
}
