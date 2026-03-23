import { FastifyInstance } from "fastify";
import {
    createReviewSession, listReviewSessionsByUser, getSessionById, addQuestionToSession,
    removeQuestionFromSession, listQuestionsFromSession,
    deleteSessionById,
} from "@/controllers/review.session.controller.js";
import { authMiddleware } from "@/middleware/auth.js";

export default async function reviewSessionRoutes(app: FastifyInstance) {
    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.post("/", createReviewSession);
        protectRoute.get("/", listReviewSessionsByUser);
        protectRoute.get("/:id", getSessionById);
        protectRoute.post("/:id/questions", addQuestionToSession);
        protectRoute.delete("/:id/questions/:questionId", removeQuestionFromSession);
        protectRoute.get("/:id/questions", listQuestionsFromSession);
        protectRoute.delete("/:id", deleteSessionById);
    });
}
