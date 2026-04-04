import { db } from "@/db/index.js";
import { reviewSessions, reviewSessionQuestions, questions } from "@/db/schema.js";
import { eq, and, inArray } from "drizzle-orm";
import { ServiceError } from "./auth.service.js";
import type { CreateSessionInput } from "@/types/index.js";
import { ReviewSessionStatus } from "@/types/index.js";
import { scheduleSessionEnd, cancelScheduledSessionEnd } from "@/queues/review.session.queue.js";

export const createSession = async ({ name, plannedDuration, questionIds, userId }: CreateSessionInput) => {
    if (questionIds && questionIds.length > 0) {
        const existingQuestions = await db
            .select({ id: questions.id })
            .from(questions)
            .where(
                and(
                    inArray(questions.id, questionIds),
                    eq(questions.userId, userId)
                )
            );

        if (existingQuestions.length !== questionIds.length) {
            throw new ServiceError(400, "One or more questions not found or do not belong to the user");
        }
    }

    const [session] = await db
        .insert(reviewSessions)
        .values({
            name,
            plannedDuration,
            userId,
        })
        .returning();

    if (questionIds && questionIds.length > 0) {
        await db.insert(reviewSessionQuestions).values(
            questionIds.map((questionId) => ({
                reviewSessionId: session.id,
                questionId,
            }))
        );
    }

    return {
      ...session,
        questionIds: questionIds || [],
    };
};

export const listSessionsByUser = async (userId: string) => {
    const sessions = await db
        .select()
        .from(reviewSessions)
        .where(eq(reviewSessions.userId, userId));

    if (sessions.length === 0) {
        throw new ServiceError(404, "No review sessions found");
    }

    return sessions;
};

export const getSessionById = async (sessionId: string, userId: string) => {
    const session = await db
        .select()
        .from(reviewSessions)
        .where(and(eq(reviewSessions.id, sessionId), eq(reviewSessions.userId, userId)));

    if (session.length === 0) {
        throw new ServiceError(404, "No review sessions found");
    }

    return session;
};

export const deleteSession = async (sessionId: string, userId: string) => {
    const session = await db
        .select()
        .from(reviewSessions)
        .where(and(eq(reviewSessions.id, sessionId), eq(reviewSessions.userId, userId)));

    if (session.length === 0) {
        throw new ServiceError(404, "No review sessions found");
    }

    await db
        .delete(reviewSessions)
        .where(eq(reviewSessions.id, sessionId));
};

export const addQuestionsToSession = async (sessionId: string, userId: string, questionIds: string[]) => {
    const session = await db
        .select()
        .from(reviewSessions)
        .where(and(eq(reviewSessions.id, sessionId), eq(reviewSessions.userId, userId)));

    if (session.length === 0) {
        throw new ServiceError(404, "No review sessions found");
    }

    if (questionIds && questionIds.length > 0) {
        const existingQuestions = await db
            .select({ id: questions.id })
            .from(questions)
            .where(and(inArray(questions.id, questionIds), eq(questions.userId, userId)));

        if (existingQuestions.length !== questionIds.length) {
            throw new ServiceError(400, "One or more questions not found or do not belong to the user");
        }

        await db.insert(reviewSessionQuestions).values(
            questionIds.map((questionId) => ({
                reviewSessionId: sessionId,
                questionId,
            }))
        );
    }
};

export const removeQuestionFromSession = async (sessionId: string, userId: string, questionId: string) => {
    const session = await db
        .select()
        .from(reviewSessions)
        .where(and(eq(reviewSessions.id, sessionId), eq(reviewSessions.userId, userId)));

    if (session.length === 0) {
        throw new ServiceError(404, "No review sessions found");
    }

    await db
        .delete(reviewSessionQuestions)
        .where(and(eq(reviewSessionQuestions.reviewSessionId, sessionId), eq(reviewSessionQuestions.questionId, questionId)));
};

export const listQuestionsFromSession = async (sessionId: string, userId: string) => {
    const session = await db
        .select()
        .from(reviewSessions)
        .where(and(eq(reviewSessions.id, sessionId), eq(reviewSessions.userId, userId)));

    if (session.length === 0) {
        throw new ServiceError(404, "No review sessions found");
    }

    const sessionQuestions = await db
        .select()
        .from(reviewSessionQuestions)
        .where(eq(reviewSessionQuestions.reviewSessionId, sessionId));

    return sessionQuestions;
};

export const startReviewSession = async (sessionId: string, userId: string) => {
    const session = await db
        .select()
        .from(reviewSessions)
        .where(and(eq(reviewSessions.id, sessionId), eq(reviewSessions.userId, userId)));

    if (session.length === 0) {
        throw new ServiceError(404, "Review session not found");
    }

    const startedAt = new Date();
    const endedAt = new Date(startedAt.getTime() + session[0].plannedDuration * 60 * 1000);

    const [updatedSession] = await db
        .update(reviewSessions)
        .set({ startedAt, endedAt, status: ReviewSessionStatus.IN_PROGRESS })
        .where(eq(reviewSessions.id, sessionId))
        .returning();

    await scheduleSessionEnd(sessionId, endedAt); 

    return updatedSession;
};

export const endReviewSession = async (sessionId: string, userId: string) => {
    const session = await db
        .select()
        .from(reviewSessions)
        .where(and(eq(reviewSessions.id, sessionId), eq(reviewSessions.userId, userId)));

    if (session.length === 0) {
        throw new ServiceError(404, "Review session not found");
    }

    await cancelScheduledSessionEnd(sessionId);

    const endedAt = new Date();

    const [updatedSession] = await db
        .update(reviewSessions)
        .set({ endedAt, status: ReviewSessionStatus.FINISHED })
        .where(eq(reviewSessions.id, sessionId))
        .returning();

    return updatedSession;
};
