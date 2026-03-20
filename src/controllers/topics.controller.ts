import { FastifyReply, FastifyRequest } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/index.js";
import { topics, users, userTopics } from "@/db/schema.js";

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

// usersTopics
export const addTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as { id: string };
        const { topicIds } = request.body as { topicIds: string[] };

        if (!topicIds || topicIds.length === 0) {
            return reply.status(400).send({ message: "topicIds array is required" });
        }

        const validTopicIds: string[] = [];
        for (const topicId of topicIds) {
            const topic = await db.select().from(topics).where(eq(topics.id, topicId));
            if (topic.length > 0) {
                validTopicIds.push(topicId);
            }
        }

        if (validTopicIds.length === 0) {
            return reply.status(404).send({ message: "No valid topics found" });
        }

        const insertedTopics = [];
        for (const topicId of validTopicIds) {
            try {
                const existing = await db
                    .select()
                    .from(userTopics)
                    .where(and(eq(userTopics.userId, userId), eq(userTopics.topicId, topicId)));

                if (existing.length === 0) {
                    const inserted = await db
                        .insert(userTopics)
                        .values({ userId, topicId })
                        .returning();
                    insertedTopics.push(inserted[0]);
                }
            } catch {
                // Ignora erro de duplicata
            }
        }

        return reply.status(201).send({
            message: "Topics added successfully",
            added: insertedTopics.length,
            topics: insertedTopics,
        });
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export const listUserTopics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as { id: string };

        const userTopicsList = await db
            .select({
                id: topics.id,
                name: topics.name,
            })
            .from(userTopics)
            .innerJoin(topics, eq(userTopics.topicId, topics.id))
            .where(eq(userTopics.userId, userId));

        if (userTopicsList.length === 0) {
            return reply.status(404).send({ message: "Topics of interest not found" });
        }

        return reply.status(200).send(userTopicsList);
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export const deleteUserTopic = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as { id: string };
        const { topicId } = request.params as { topicId: string };

        const existing = await db
            .select()
            .from(userTopics)
            .where(and(eq(userTopics.userId, userId), eq(userTopics.topicId, topicId)));

        if (existing.length === 0) {
            return reply.status(404).send({ message: "Topic not found for this user" });
        }

        await db
            .delete(userTopics)
            .where(and(eq(userTopics.userId, userId), eq(userTopics.topicId, topicId)));

        return reply.status(200).send({ message: "Topic removed successfully" });
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
