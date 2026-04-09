import { db } from "@/db/index.js";
import { questions, topics, questionTopics } from "@/db/schema.js";
import { eq, and } from "drizzle-orm";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/errors/http.errors.js";
import type { CreateQuestionInput, UpdateQuestionBody } from "@/types/index.js";
import { calculateSM2 } from "../utils/SM2Algorithm.js";
import { warn } from "node:console";

export const createQuestion = async ({ title, description, link, difficulty, userId }: CreateQuestionInput) => {
    const questionExists = await db.select().from(questions).where(eq(questions.link, link));

    if (questionExists.length > 0) {
        throw new ConflictError("Question already exists!!");
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
        throw new NotFoundError("Question not found");
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
        throw new NotFoundError("Question not found");
    }

    const topic = await db.select().from(topics).where(eq(topics.id, topicId));

    if (topic.length === 0) {
        throw new NotFoundError("Topic not found");
    }

    await db.insert(questionTopics).values({
        questionId,
        topicId,
    });
};

export const deleteQuestionTopic = async (questionId: string, topicId: string) => {
    const question = await db.select().from(questions).where(eq(questions.id, questionId));

    if (question.length === 0) {
        throw new NotFoundError("Question not found");
    }

    const topic = await db.select().from(topics).where(eq(topics.id, topicId));

    if (topic.length === 0) {
        throw new NotFoundError("Topic not found");
    }

    await db.delete(questionTopics).where(and(eq(questionTopics.questionId, questionId), eq(questionTopics.topicId, topicId)));
};


export const addSpacedRepetition = async (grade: number, questionId: string, userId: string) => {
    if (grade < 0 || grade > 5) {
        throw new BadRequestError("Grade must be between 0 and 5");
    }

    const question = await db
        .select({
            userId: questions.userId,
            easeFactor: questions.ease_factor, 
            interval_days: questions.interval_days, 
            times_reviewed: questions.times_reviewed
        })
        .from(questions)
        .where(eq(questions.id, questionId));
    
    if (question.length === 0) {
        throw new NotFoundError("Question not found");
    }

    if (question[0].userId !== userId) {
        throw new ForbiddenError("You don't have permission to update this question");
    }

    const easeFactor = question[0].easeFactor ?? 2.5;
    const interval_days = question[0].interval_days ?? 0;
    const times_reviewed = question[0].times_reviewed ?? 0;

    const result = calculateSM2(grade, easeFactor, interval_days, times_reviewed);

    const updated = await db
        .update(questions)
        .set({
            ease_factor: result.easeFactor,
            interval_days: result.intervalDays,
            times_reviewed: result.timesReviewed,
            next_review: result.nextReview.toISOString().split("T")[0],
            last_reviewed_at: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(questions.id, questionId))
        .returning();

    return {
        question: updated[0],
        nextReview: result.nextReview,
        interval_days: result.intervalDays,
    }
}
