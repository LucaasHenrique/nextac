export interface CreateNoteBody {
    title: string;
    content: string;
    questionId?: string;
}

export interface UpdateNoteBody {
    title?: string;
    content?: string;
}
