import { FastifyInstance } from "fastify";
import { getQuestionsAuthUser, getQuestionById, deleteQuestion, createQuestion, associateTopicQuestion, deleteQuestionTopic } from "@/controllers/question.controller.js";
import { authMiddleware } from "@/middleware/auth.js";

export default async function questionsRoutes(app: FastifyInstance) {

    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.get("/", getQuestionsAuthUser);
        protectRoute.get("/:id", getQuestionById);
        protectRoute.delete("/:id", deleteQuestion);
        protectRoute.post("/", createQuestion); 
        protectRoute.post("/:id/topic/", associateTopicQuestion);
        protectRoute.delete("/:id/topic/:topic_id", deleteQuestionTopic);
    });
}