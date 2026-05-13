import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam, CreateQuestionBody, UpdateQuestionBody, AssociateTopicBody, QuestionTopicParams } from "@/types/index.js";
import * as questionService from "@/services/question.service.js";

export const createQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    const { title, description, link, difficulty } = request.body as CreateQuestionBody;
    const { id: userId } = request.user as AuthUser;

    const question = await questionService.createQuestion({ title, description, link, difficulty, userId });

    return reply.status(201).send(question);
};

export const associateTopicQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;
    const { topic_id } = request.body as AssociateTopicBody;

    await questionService.associateTopicToQuestion(id, topic_id, userId);

    return reply.status(201).send({ message: "Topic associated successfully" });
};

export const getQuestionsAuthUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.user as AuthUser;

    const questions = await questionService.getQuestionsByUserId(id);

    return reply.status(200).send(questions);
};

export const getQuestionToReviewToday = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;

    const questions = await questionService.getQuestionToReviewToday(userId);

    return reply.status(200).send(questions);
};

export const getQuestionById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;

    const question = await questionService.getQuestionById(id, userId);

    return reply.status(200).send(question);
};

export const deleteQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;

    await questionService.deleteQuestion(id, userId);

    return reply.status(200).send({ message: "Question deleted successfully" });
};

export const updateQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;
    const body = request.body as UpdateQuestionBody;

    const updated = await questionService.updateQuestion(id, userId, body);

    return reply.status(200).send(updated);
};

export const deleteQuestionTopic = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, topic_id } = request.params as QuestionTopicParams;
    const { id: userId } = request.user as AuthUser;

    await questionService.deleteQuestionTopic(id, topic_id, userId);

    return reply.status(200).send({ message: "Topic deleted successfully" });
};

export const addSpacedRepetitionQuestion = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;
    const { grade } = request.body as { grade: number };

    const updatedQuestion = await questionService.addSpacedRepetition(grade, id, userId);

    return reply.status(200).send(updatedQuestion);
};
