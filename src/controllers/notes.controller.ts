import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam, CreateNoteBody, UpdateNoteBody } from "@/types/index.js";
import * as notesService from "@/services/notes.service.js";

export const createNote = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const body = request.body as CreateNoteBody;

    const note = await notesService.createNote(userId, body);

    return reply.status(201).send(note);
};

export const createNoteForQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { id: questionId } = request.params as IdParam;
    const { title, content } = request.body as CreateNoteBody;

    const note = await notesService.createNote(userId, { title, content, questionId });

    return reply.status(201).send(note);
};

export const getStandaloneNotes = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;

    const standaloneNotes = await notesService.getStandaloneNotes(userId);

    return reply.status(200).send(standaloneNotes);
};

export const getNotesByQuestionId = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;

    const questionNotes = await notesService.getNotesByQuestionId(id, userId);

    return reply.status(200).send(questionNotes);
};

export const getNoteById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;

    const note = await notesService.getNoteById(id, userId);

    return reply.status(200).send(note);
};

export const updateNote = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;
    const body = request.body as UpdateNoteBody;

    const updated = await notesService.updateNote(id, userId, body);

    return reply.status(200).send(updated);
};

export const deleteNote = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;

    await notesService.deleteNote(id, userId);

    return reply.status(200).send({ message: "Note deleted successfully" });
};
