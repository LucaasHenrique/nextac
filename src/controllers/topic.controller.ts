import { FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db/index.js";
import { topics } from "@/db/schema.js";

export const getTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const topcs = await db.select().from(topics);

        return reply.status(200).send(topcs);
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
}

export const getTopicById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string };

        const topic = await db.select().from(topics).where(eq(topics.id, id));

        return reply.status(200).send(topic);
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
}