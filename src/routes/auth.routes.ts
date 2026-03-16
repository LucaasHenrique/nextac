import { register, login, refresh, logout } from "@/controllers/auth.controller.js";
import type { FastifyInstance } from "fastify";
import { authMiddleware } from "@/middleware/auth.js";

export const authRoutes = async (app: FastifyInstance) => {
    app.post("/register", register);
    app.post("/login", login);

    app.register(async (protectedRoutes) => {

        protectedRoutes.addHook("preHandler", authMiddleware);

        protectedRoutes.get("/refresh", refresh);
        protectedRoutes.get("/logout", logout);
    })
}

