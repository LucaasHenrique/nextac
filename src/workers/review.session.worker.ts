import { Worker } from "bullmq";
import { redis } from "@/lib/redis.js";
import { db } from "@/db/index.js";
import { reviewSessions } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { ReviewSessionStatus } from "@/types/review-session.types.js";


export const reviewSessionWorker = new Worker("review-session", 
    async (job) => {
        const { sessionId } = job.data;

        await db.update(reviewSessions)
            .set({ status: ReviewSessionStatus.FINISHED })
            .where(eq(reviewSessions.id, sessionId));

        console.log(`[Worker] Session ${sessionId} finalizada automaticamente`);
    },
    { connection: redis }
);

reviewSessionWorker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completado`);
});

reviewSessionWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} falhou:`, err.message);
});

reviewSessionWorker.on("ready", () => {
    console.log("[Worker] Review session worker pronto");
});
