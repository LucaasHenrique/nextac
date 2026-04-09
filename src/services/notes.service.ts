import { db } from "@/db/index.js";
import { notes, questions } from "@/db/schema.js";
import { eq, and, isNull } from "drizzle-orm";
import { NotFoundError } from "@/errors/http.errors.js";
import type { CreateNoteBody, UpdateNoteBody } from "@/types/index.js";

export const createNote = async (userId: string, data: CreateNoteBody) => {
    if (data.questionId) {
        const question = await db
            .select()
            .from(questions)
            .where(and(eq(questions.id, data.questionId), eq(questions.userId, userId)));

        if (question.length === 0) {
            throw new NotFoundError("Question not found or doesn't belong to user");
        }
    }

    const note = await db
        .insert(notes)
        .values({
            title: data.title,
            content: data.content,
            userId,
            questionId: data.questionId || null,
        })
        .returning();

    return note;
};

export const getNotesByQuestionId = async (questionId: string, userId: string) => {
    const questionNotes = await db
        .select()
        .from(notes)
        .where(and(eq(notes.questionId, questionId), eq(notes.userId, userId)));

    return questionNotes;
};

export const getStandaloneNotes = async (userId: string) => {
    const standaloneNotes = await db
        .select()
        .from(notes)
        .where(and(isNull(notes.questionId), eq(notes.userId, userId)));

    return standaloneNotes;
};

export const getNoteById = async (noteId: string, userId: string) => {
    const note = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    if (note.length === 0) {
        throw new NotFoundError("Note not found");
    }

    return note[0];
};

export const updateNote = async (noteId: string, userId: string, data: UpdateNoteBody) => {
    const existingNote = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    if (existingNote.length === 0) {
        throw new NotFoundError("Note not found");
    }

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;

    updateData.updatedAt = new Date();

    const updated = await db
        .update(notes)
        .set(updateData)
        .where(eq(notes.id, noteId))
        .returning();

    return updated;
};

export const deleteNote = async (noteId: string, userId: string) => {
    const existingNote = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    if (existingNote.length === 0) {
        throw new NotFoundError("Note not found");
    }

    await db.delete(notes).where(eq(notes.id, noteId));
};
