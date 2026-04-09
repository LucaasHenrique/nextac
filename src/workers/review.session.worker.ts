import { Worker } from "bullmq";
import { redis } from "@/lib/redis.js";
import { db } from "@/db/index.js";
import { reviewSessions } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { ReviewSessionStatus } from "@/types/review-session.types.js";
import { logger } from "@/lib/logger.js";

export const reviewSessionWorker = new Worker("review-session", 
    async (job) => {
        const { sessionId } = job.data;

        await db.update(reviewSessions)
            .set({ status: ReviewSessionStatus.FINISHED })
            .where(eq(reviewSessions.id, sessionId));

        logger.info(`[Worker] Session ${sessionId} finalizada automaticamente`);
    },
    { connection: redis }
);

reviewSessionWorker.on("completed", (job) => {
    logger.info(`[Worker] Job ${job.id} completado`);
});

reviewSessionWorker.on("failed", (job, err) => {
    logger.error({ err }, `[Worker] Job ${job?.id} falhou`);
});

reviewSessionWorker.on("ready", () => {
    logger.info("[Worker] Review session worker pronto");
});
