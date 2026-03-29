export const ReviewSessionStatus = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    FINISHED: "finished",
    CANCELLED: "cancelled",
} as const;

export type ReviewSessionStatus = typeof ReviewSessionStatus[keyof typeof ReviewSessionStatus];

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
