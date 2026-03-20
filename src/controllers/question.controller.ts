import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "@/db/index.js";
import { questions, topics, questionTopics } from "@/db/schema.js";
import { eq, and } from "drizzle-orm";

export const createQuestion = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const { title, description, link, difficulty } = request.body as {
            title: string;
            description: string;
            link: string;
            difficulty: string;
        };
        const { id } = request.user as { id: string };
            
        const question_exists = await db.select().from(questions).where(eq(questions.link, link));

        if (question_exists.length > 0) {
            return reply.status(400).send({message: "Question already exists!!"})
        }

        const question = await db
            .insert(questions)
            .values({
                name: title,
                description,
                link,
                difficulty_rating: difficulty,
                userId: id,
            })
            .returning();

        return reply.status(201).send(question);
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

export const associateTopicQuestion = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {

    const { id } = request.params as { id: string };
    const { topic_id } = request.body as { topic_id: string };

    const question = await db.select().from(questions).where(eq(questions.id, id));

    if (question.length === 0) {
        return reply.status(404).send({ message: "Question not found" });
    }

    const topic = await db.select().from(topics).where(eq(topics.id, topic_id));

    if (topic.length === 0) return reply.status(404).send({ message: "Topic not found" });

    await db.insert(questionTopics).values({
        questionId: id,
        topicId: topic_id,
    });

    return reply.status(201).send({ message: "Topic associated successfully" });
}

export const getQuestionsAuthUser = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const { id } = request.user as { id: string };

        const question = await db
            .select()
            .from(questions)
            .where(eq(questions.userId, id));

        return reply.status(200).send(question);
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const getQuestionById = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const { id } = request.params as { id: string };

        const question = await db
            .select()
            .from(questions)
            .where(eq(questions.id, id));

        return reply.status(200).send(question);
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const deleteQuestion = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const { id } = request.params as { id: string };

        const question = await db.delete(questions).where(eq(questions.id, id));

        return reply
            .status(200)
            .send({ message: "Question deleted successfully" });
    } catch (error) {
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const updateQuestion = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const { id } = request.params as { id: string };
        const { id: userId } = request.user as { id: string };

        const body = request.body as {
            title?: string;
            description?: string;
            link?: string;
            difficulty?: string;
            status?: "to_review" | "reviewing" | "reviewed" | "accepted" | "wrong_answer";
            platform?: string;
            user_difficulty?: string;
            folderId?: string;
        };

        const existing = await db
            .select()
            .from(questions)
            .where(and(eq(questions.id, id), eq(questions.userId, userId)));

        if (existing.length === 0) {
            return reply.status(404).send({ message: "Question not found" });
        }

        const updateData: Record<string, unknown> = {};

        if (body.title !== undefined) updateData.name = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.link !== undefined) updateData.link = body.link;
        if (body.difficulty !== undefined) updateData.difficulty_rating = body.difficulty;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.platform !== undefined) updateData.platform = body.platform;
        if (body.user_difficulty !== undefined) updateData.user_dificulty = body.user_difficulty;
        if (body.folderId !== undefined) updateData.folderId = body.folderId;

        updateData.updatedAt = new Date();

        const updated = await db
            .update(questions)
            .set(updateData)
            .where(eq(questions.id, id))
            .returning();

        return reply.status(200).send(updated);
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const deleteQuestionTopic = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {

    const { id } = request.params as { id: string };
    const { topic_id } = request.params as { topic_id: string };

    const question = await db.select().from(questions).where(eq(questions.id, id));

    if (question.length === 0) {
        return reply.status(404).send({ message: "Question not found" });
    }

    const topic = await db.select().from(topics).where(eq(topics.id, topic_id));

    if (topic.length === 0) return reply.status(404).send({ message: "Topic not found" });

    await db.delete(questionTopics).where(and(eq(questionTopics.questionId, id), eq(questionTopics.topicId, topic_id)));

    return reply.status(200).send({ message: "Topic deleted successfully" });

}
