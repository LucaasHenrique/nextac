import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam, AddTopicsBody, TopicIdParam, CreateTopicBody } from "@/types/index.js";
import * as topicsService from "@/services/topics.service.js";

export const createTopic = async (request: FastifyRequest, reply: FastifyReply) => {
    const { name } = request.body as CreateTopicBody;

    const topic = await topicsService.createTopic(name);

    return reply.status(201).send(topic);
};

export const getTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    const topics = await topicsService.getAllTopics();

    return reply.status(200).send(topics);
};

export const getTopicById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;

    const topic = await topicsService.getTopicById(id);

    return reply.status(200).send(topic);
};

export const addTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { topicIds } = request.body as AddTopicsBody;

    const result = await topicsService.addUserTopics(userId, topicIds);

    return reply.status(201).send({
        message: "Topics added successfully",
        ...result,
    });
};

export const listUserTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;

    const userTopicsList = await topicsService.listUserTopics(userId);

    return reply.status(200).send(userTopicsList);
};

export const deleteUserTopic = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { topicId } = request.params as TopicIdParam;

    await topicsService.deleteUserTopic(userId, topicId);

    return reply.status(200).send({ message: "Topic removed successfully" });
};
