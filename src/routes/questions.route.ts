import { FastifyInstance } from "fastify";
import { getQuestionsAuthUser, getQuestionById, deleteQuestion, createQuestion, associateTopicQuestion, deleteQuestionTopic, updateQuestion } from "@/controllers/question.controller.js";
import { createNote, getNotesByQuestionId } from "@/controllers/notes.controller.js";
import { authMiddleware } from "@/middleware/auth.js";

export default async function questionsRoutes(app: FastifyInstance) {

    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.get("/", getQuestionsAuthUser);
        protectRoute.get("/:id", getQuestionById);
        protectRoute.patch("/:id", updateQuestion);
        protectRoute.delete("/:id", deleteQuestion);
        protectRoute.post("/", createQuestion); 
        protectRoute.post("/:id/topic/", associateTopicQuestion);
        protectRoute.delete("/:id/topic/:topic_id", deleteQuestionTopic);
        protectRoute.post("/:id/notes", createNote);
        protectRoute.get("/:id/notes", getNotesByQuestionId);
    });
}
