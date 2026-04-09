import { db } from "@/db/index.js";
import { topics, userTopics } from "@/db/schema.js";
import { eq, and } from "drizzle-orm";
import { BadRequestError, ConflictError, NotFoundError } from "@/errors/http.errors.js";

export const getAllTopics = async () => {
    return await db.select().from(topics);
};

export const createTopic = async (name: string) => {
    const existing = await db.select().from(topics).where(eq(topics.name, name));

    if (existing.length > 0) {
        throw new ConflictError("Topic already exists");
    }

    const [topic] = await db.insert(topics).values({ name }).returning();

    return topic;
};

export const getTopicById = async (id: string) => {
    return await db.select().from(topics).where(eq(topics.id, id));
};

export const addUserTopics = async (userId: string, topicIds: string[]) => {
    if (!topicIds || topicIds.length === 0) {
        throw new BadRequestError("topicIds array is required");
    }

    const validTopicIds: string[] = [];
    for (const topicId of topicIds) {
        const topic = await db.select().from(topics).where(eq(topics.id, topicId));
        if (topic.length > 0) {
            validTopicIds.push(topicId);
        }
    }

    if (validTopicIds.length === 0) {
        throw new NotFoundError("No valid topics found");
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

    return {
        added: insertedTopics.length,
        topics: insertedTopics,
    };
};

export const listUserTopics = async (userId: string) => {
    const userTopicsList = await db
        .select({
            id: topics.id,
            name: topics.name,
        })
        .from(userTopics)
        .innerJoin(topics, eq(userTopics.topicId, topics.id))
        .where(eq(userTopics.userId, userId));

    if (userTopicsList.length === 0) {
        throw new NotFoundError("Topics of interest not found");
    }

    return userTopicsList;
};

export const deleteUserTopic = async (userId: string, topicId: string) => {
    const existing = await db
        .select()
        .from(userTopics)
        .where(and(eq(userTopics.userId, userId), eq(userTopics.topicId, topicId)));

    if (existing.length === 0) {
        throw new NotFoundError("Topic not found for this user");
    }

    await db
        .delete(userTopics)
        .where(and(eq(userTopics.userId, userId), eq(userTopics.topicId, topicId)));
};
