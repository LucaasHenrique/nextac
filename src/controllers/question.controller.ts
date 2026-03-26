import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam, CreateQuestionBody, UpdateQuestionBody, AssociateTopicBody, QuestionTopicParams } from "@/types/index.js";
import { ServiceError } from "@/services/auth.service.js";
import * as questionService from "@/services/question.service.js";

export const createQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { title, description, link, difficulty } = request.body as CreateQuestionBody;
        const { id: userId } = request.user as AuthUser;

        const question = await questionService.createQuestion({ title, description, link, difficulty, userId });

        return reply.status(201).send(question);
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

export const associateTopicQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { topic_id } = request.body as AssociateTopicBody;

        await questionService.associateTopicToQuestion(id, topic_id);

        return reply.status(201).send({ message: "Topic associated successfully" });
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

export const getQuestionsAuthUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.user as AuthUser;

        const questions = await questionService.getQuestionsByUserId(id);

        return reply.status(200).send(questions);
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const getQuestionById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;

        const question = await questionService.getQuestionById(id);

        return reply.status(200).send(question);
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const deleteQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;

        await questionService.deleteQuestion(id);

        return reply.status(200).send({ message: "Question deleted successfully" });
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const updateQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;
        const body = request.body as UpdateQuestionBody;

        const updated = await questionService.updateQuestion(id, userId, body);

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

export const deleteQuestionTopic = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id, topic_id } = request.params as QuestionTopicParams;

        await questionService.deleteQuestionTopic(id, topic_id);

        return reply.status(200).send({ message: "Topic deleted successfully" });
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

export const addSpacedRepetitionQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    try { 
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;
        const { grade } = request.body as { grade: number };

        const updated_question = await questionService.addSpacedRepetition(grade, id, userId); 

        return reply.status(200).send(updated_question);
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
