import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "@/db/index.js";
import { reviewSessions, reviewSessionQuestions, questions } from "@/db/schema.js";
import { eq, and, inArray } from "drizzle-orm";

export const createReviewSession = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const { id: userId } = request.user as { id: string };
        const { name, plannedDuration, questionIds } = request.body as {
            name: string;
            plannedDuration: number;
            questionIds: string[];
        };

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
                return reply.status(400).send({
                    message: "One or more questions not found or do not belong to the user",
                });
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

        return reply.status(201).send({
            ...session,
            questionIds: questionIds || [],
        });
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

