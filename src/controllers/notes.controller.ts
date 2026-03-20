import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "@/db/index.js";
import { notes, questions } from "@/db/schema.js";
import { eq, and } from "drizzle-orm";

export const createNote = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const { id: questionId } = request.params as { id: string };
        const { title, content } = request.body as {
            title: string;
            content: string;
        };

        const question = await db
            .select()
            .from(questions)
            .where(eq(questions.id, questionId));

        if (question.length === 0) {
            return reply.status(404).send({ message: "Question not found" });
        }

        const note = await db
            .insert(notes)
            .values({
                title,
                content,
                questionId,
            })
            .returning();

        return reply.status(201).send(note);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export const getNotesByQuestionId = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string };
        const { id: userId } = request.user as { id: string };

        const question = await db
            .select()
            .from(questions)
            .where(and(eq(questions.id, id), eq(questions.userId, userId)));

        if (question.length === 0) {
            return reply.status(404).send({ message: "Question not found" });
        }

        const questionNotes = await db.select().from(notes).where(eq(notes.questionId, id));

        return reply.status(200).send(questionNotes);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export const getNoteById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string };
        const { id: userId } = request.user as { id: string };

        const note = await db
            .select()
            .from(notes)
            .innerJoin(questions, eq(notes.questionId, questions.id))
            .where(and(eq(notes.id, id), eq(questions.userId, userId)));

        if (note.length === 0) {
            return reply.status(404).send({ message: "Note not found" });
        }

        return reply.status(200).send(note[0].notes);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export const updateNote = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string };
        const { id: userId } = request.user as { id: string };

        const body = request.body as {
            title?: string;
            content?: string;
        };

        const existingNote = await db
            .select()
            .from(notes)
            .innerJoin(questions, eq(notes.questionId, questions.id))
            .where(and(eq(notes.id, id), eq(questions.userId, userId)));

        if (existingNote.length === 0) {
            return reply.status(404).send({ message: "Note not found" });
        }

        const updateData: Record<string, unknown> = {};

        if (body.title !== undefined) updateData.title = body.title;
        if (body.content !== undefined) updateData.content = body.content;

        updateData.updatedAt = new Date();

        const updated = await db
            .update(notes)
            .set(updateData)
            .where(eq(notes.id, id))
            .returning();

        return reply.status(200).send(updated);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export const deleteNote = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string };
        const { id: userId } = request.user as { id: string };

        const existingNote = await db
            .select()
            .from(notes)
            .innerJoin(questions, eq(notes.questionId, questions.id))
            .where(and(eq(notes.id, id), eq(questions.userId, userId)));

        if (existingNote.length === 0) {
            return reply.status(404).send({ message: "Note not found" });
        }

        await db.delete(notes).where(eq(notes.id, id));

        return reply.status(200).send({ message: "Note deleted successfully" });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
