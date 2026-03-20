import { FastifyInstance } from "fastify";
import { getMe, updateMe, deleteMe } from "@/controllers/user.controller.js";
import { authMiddleware } from "@/middleware/auth.js";

export default async function userRoutes(app: FastifyInstance) {
    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.get("/me", getMe);
        protectRoute.patch("/me", updateMe);
        protectRoute.delete("/me", deleteMe);
    });
}
