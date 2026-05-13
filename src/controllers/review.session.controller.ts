import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam, CreateReviewSessionBody, AddQuestionsToSessionBody, SessionQuestionParams } from "@/types/index.js";
import * as reviewSessionService from "@/services/review.session.service.js";

export const createReviewSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { name, plannedDuration, questionIds } = request.body as CreateReviewSessionBody;

    const session = await reviewSessionService.createSession({ name, plannedDuration, questionIds, userId });

    return reply.status(201).send(session);
};

export const listReviewSessionsByUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;

    const sessions = await reviewSessionService.listSessionsByUser(userId);

    return reply.status(200).send(sessions);
};

export const getSessionById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { id: sessionId } = request.params as IdParam;

    const session = await reviewSessionService.getSessionById(sessionId, userId);

    return reply.status(200).send(session);
};

export const deleteSessionById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { id: sessionId } = request.params as IdParam;

    await reviewSessionService.deleteSession(sessionId, userId);

    return reply.status(200).send({ message: "Review session deleted successfully" });
};

export const addQuestionToSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { id: sessionId } = request.params as IdParam;
    const { questionIds } = request.body as AddQuestionsToSessionBody;

    await reviewSessionService.addQuestionsToSession(sessionId, userId, questionIds);

    return reply.status(200).send({ message: "Questions added to review session successfully" });
};

export const removeQuestionFromSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { id: sessionId, questionId } = request.params as SessionQuestionParams & { id: string };

    await reviewSessionService.removeQuestionFromSession(sessionId, userId, questionId);

    return reply.status(200).send({ message: "Question removed from review session successfully" });
};

export const listQuestionsFromSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { id: sessionId } = request.params as IdParam;

    const questions = await reviewSessionService.listQuestionsFromSession(sessionId, userId);

    return reply.status(200).send(questions);
};

export const startReviewSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { id: sessionId } = request.params as IdParam;

    const session = await reviewSessionService.startReviewSession(sessionId, userId);

    return reply.status(200).send(session);
};

export const endReviewSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { id: sessionId } = request.params as IdParam;

    const session = await reviewSessionService.endReviewSession(sessionId, userId);

    return reply.status(200).send(session);
};
