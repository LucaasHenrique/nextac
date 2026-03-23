import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam, CreateNoteBody, UpdateNoteBody } from "@/types/index.js";
import { ServiceError } from "@/services/auth.service.js";
import * as notesService from "@/services/notes.service.js";

export const createNote = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const body = request.body as CreateNoteBody;

        const note = await notesService.createNote(userId, body);

        return reply.status(201).send(note);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const createNoteForQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { id: questionId } = request.params as IdParam;
        const { title, content } = request.body as CreateNoteBody;

        const note = await notesService.createNote(userId, { title, content, questionId });

        return reply.status(201).send(note);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getStandaloneNotes = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;

        const standaloneNotes = await notesService.getStandaloneNotes(userId);

        return reply.status(200).send(standaloneNotes);
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getNotesByQuestionId = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;

        const questionNotes = await notesService.getNotesByQuestionId(id, userId);

        return reply.status(200).send(questionNotes);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getNoteById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;

        const note = await notesService.getNoteById(id, userId);

        return reply.status(200).send(note);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const updateNote = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;
        const body = request.body as UpdateNoteBody;

        const updated = await notesService.updateNote(id, userId, body);

        return reply.status(200).send(updated);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const deleteNote = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;

        await notesService.deleteNote(id, userId);

        return reply.status(200).send({ message: "Note deleted successfully" });
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
