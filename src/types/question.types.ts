export type QuestionStatus = "to_review" | "reviewing" | "reviewed" | "accepted" | "wrong_answer";

export interface CreateQuestionBody {
    title: string;
    description: string;
    link: string;
    difficulty: string;
}

export interface CreateQuestionInput extends CreateQuestionBody {
    userId: string;
}

export interface UpdateQuestionBody {
    title?: string;
    description?: string;
    link?: string;
    difficulty?: string;
    status?: QuestionStatus;
    platform?: string;
    user_difficulty?: string;
    folderId?: string;
}

export interface AssociateTopicBody {
    topic_id: string;
}
