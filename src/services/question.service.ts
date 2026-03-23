import { db } from "@/db/index.js";
import { questions, topics, questionTopics } from "@/db/schema.js";
import { eq, and } from "drizzle-orm";
import { ServiceError } from "./auth.service.js";
import type { CreateQuestionInput, UpdateQuestionBody } from "@/types/index.js";

export const createQuestion = async ({ title, description, link, difficulty, userId }: CreateQuestionInput) => {
    const questionExists = await db.select().from(questions).where(eq(questions.link, link));

    if (questionExists.length > 0) {
        throw new ServiceError(400, "Question already exists!!");
    }

    const question = await db
        .insert(questions)
        .values({
            name: title,
            description,
            link,
            difficulty_rating: difficulty,
            userId,
        })
        .returning();

    return question;
};

export const getQuestionsByUserId = async (userId: string) => {
    const result = await db
        .select()
        .from(questions)
        .where(eq(questions.userId, userId));

    return result;
};

export const getQuestionById = async (id: string) => {
    const question = await db
        .select()
        .from(questions)
        .where(eq(questions.id, id));

    return question;
};

export const updateQuestion = async (id: string, userId: string, data: UpdateQuestionBody) => {
    const existing = await db
        .select()
        .from(questions)
        .where(and(eq(questions.id, id), eq(questions.userId, userId)));

    if (existing.length === 0) {
        throw new ServiceError(404, "Question not found");
    }

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.name = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.difficulty !== undefined) updateData.difficulty_rating = data.difficulty;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.user_difficulty !== undefined) updateData.user_dificulty = data.user_difficulty;
    if (data.folderId !== undefined) updateData.folderId = data.folderId;

    updateData.updatedAt = new Date();

    const updated = await db
        .update(questions)
        .set(updateData)
        .where(eq(questions.id, id))
        .returning();

    return updated;
};

export const deleteQuestion = async (id: string) => {
    await db.delete(questions).where(eq(questions.id, id));
};

export const associateTopicToQuestion = async (questionId: string, topicId: string) => {
    const question = await db.select().from(questions).where(eq(questions.id, questionId));

    if (question.length === 0) {
        throw new ServiceError(404, "Question not found");
    }

    const topic = await db.select().from(topics).where(eq(topics.id, topicId));

    if (topic.length === 0) {
        throw new ServiceError(404, "Topic not found");
    }

    await db.insert(questionTopics).values({
        questionId,
        topicId,
    });
};

export const deleteQuestionTopic = async (questionId: string, topicId: string) => {
    const question = await db.select().from(questions).where(eq(questions.id, questionId));

    if (question.length === 0) {
        throw new ServiceError(404, "Question not found");
    }

    const topic = await db.select().from(topics).where(eq(topics.id, topicId));

    if (topic.length === 0) {
        throw new ServiceError(404, "Topic not found");
    }

    await db.delete(questionTopics).where(and(eq(questionTopics.questionId, questionId), eq(questionTopics.topicId, topicId)));
};
