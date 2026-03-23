import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam, AddTopicsBody, TopicIdParam, CreateTopicBody } from "@/types/index.js";
import { ServiceError } from "@/services/auth.service.js";
import * as topicsService from "@/services/topics.service.js";

export const createTopic = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { name } = request.body as CreateTopicBody;

        const topic = await topicsService.createTopic(name);

        return reply.status(201).send(topic);
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

export const getTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const topics = await topicsService.getAllTopics();

        return reply.status(200).send(topics);
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const getTopicById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;

        const topic = await topicsService.getTopicById(id);

        return reply.status(200).send(topic);
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const addTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { topicIds } = request.body as AddTopicsBody;

        const result = await topicsService.addUserTopics(userId, topicIds);

        return reply.status(201).send({
            message: "Topics added successfully",
            ...result,
        });
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

export const listUserTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;

        const userTopicsList = await topicsService.listUserTopics(userId);

        return reply.status(200).send(userTopicsList);
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

export const deleteUserTopic = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { topicId } = request.params as TopicIdParam;

        await topicsService.deleteUserTopic(userId, topicId);

        return reply.status(200).send({ message: "Topic removed successfully" });
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
