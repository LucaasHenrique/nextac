import { Queue } from "bullmq";
import { redis } from "@/lib/redis.js";
import { logger } from "@/lib/logger.js";

export const reviewSessionQueue = new Queue("review-session", {
    connection: redis
});

export const scheduleSessionEnd = async (sessionId: string, endedAt: Date) => {
    const delay = endedAt.getTime() - Date.now();

    if (delay <= 0) {
        logger.warn(`[Queue] Session ${sessionId} já expirou, não agendando job`);
        return;
    }

    await reviewSessionQueue.add(
        "end-session",
        { sessionId },
        {
            delay,
            jobId: sessionId,
            removeOnComplete: true,
            removeOnFail: false,
        }
    );
}

export const cancelScheduledSessionEnd = async (sessionId: string) => {
    const job = await reviewSessionQueue.getJob(sessionId);
    if (job) await job.remove();
}
