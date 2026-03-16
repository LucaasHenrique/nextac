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
        console.error(error);
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