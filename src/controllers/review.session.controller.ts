import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam, CreateReviewSessionBody, AddQuestionsToSessionBody, SessionQuestionParams } from "@/types/index.js";
import { ServiceError } from "@/services/auth.service.js";
import * as reviewSessionService from "@/services/review.session.service.js";

export const createReviewSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { name, plannedDuration, questionIds } = request.body as CreateReviewSessionBody;

        const session = await reviewSessionService.createSession({ name, plannedDuration, questionIds, userId });

        return reply.status(201).send(session);
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

export const listReviewSessionsByUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;

        const sessions = await reviewSessionService.listSessionsByUser(userId);

        return reply.status(200).send(sessions);
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

export const getSessionById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { id: sessionId } = request.params as IdParam;

        const session = await reviewSessionService.getSessionById(sessionId, userId);

        return reply.status(200).send(session);
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

export const deleteSessionById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { id: sessionId } = request.params as IdParam;

        await reviewSessionService.deleteSession(sessionId, userId);

        return reply.status(200).send({ message: "Review session deleted successfully" });
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

export const addQuestionToSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { id: sessionId } = request.params as IdParam;
        const { questionIds } = request.body as AddQuestionsToSessionBody;

        await reviewSessionService.addQuestionsToSession(sessionId, userId, questionIds);

        return reply.status(200).send({ message: "Questions added to review session successfully" });
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

export const removeQuestionFromSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { id: sessionId, questionId } = request.params as SessionQuestionParams & { id: string };

        await reviewSessionService.removeQuestionFromSession(sessionId, userId, questionId);

        return reply.status(200).send({ message: "Question removed from review session successfully" });
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

export const listQuestionsFromSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { id: sessionId } = request.params as IdParam;

        const questions = await reviewSessionService.listQuestionsFromSession(sessionId, userId);

        return reply.status(200).send(questions);
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

export const startReviewSession = async (request: FastifyRequest, reply: FastifyReply) => {
   try {
        const { id: userId } = request.user as AuthUser;
        const { id: sessionId } = request.params as IdParam;
        
        const session = await reviewSessionService.startReviewSession(sessionId, userId);
        
        return reply.status(200).send(session);
    
   } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }

        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    } 
}

export const endReviewSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { id: sessionId } = request.params as IdParam;
        
        const session = await reviewSessionService.endReviewSession(sessionId, userId);

        return reply.status(200).send(session);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
