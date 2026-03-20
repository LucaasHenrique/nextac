import { FastifyInstance } from "fastify";
import { createReviewSession } from "@/controllers/review.session.controller.js";
import { authMiddleware } from "@/middleware/auth.js";

export default async function reviewSessionRoutes(app: FastifyInstance) {
    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.post("/", createReviewSession);
    });
}
