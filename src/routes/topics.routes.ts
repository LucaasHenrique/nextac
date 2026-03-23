import { FastifyInstance } from "fastify";
import { getTopics, getTopicById, createTopic, addTopics, listUserTopics, deleteUserTopic } from "@/controllers/topics.controller.js";
import { authMiddleware } from "@/middleware/auth.js";

export default async function topicsRoutes(app: FastifyInstance) {
    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.post("/", createTopic);
        protectRoute.get("/", getTopics);
        protectRoute.get("/:id", getTopicById);
        protectRoute.post("/user", addTopics);
        protectRoute.get("/user", listUserTopics);
        protectRoute.delete("/user/:topicId", deleteUserTopic);
    });
}
