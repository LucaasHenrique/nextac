import { FastifyInstance } from "fastify";
import { getNoteById, updateNote, deleteNote } from "@/controllers/notes.controller.js";
import { authMiddleware } from "@/middleware/auth.js";

export default async function notesRoutes(app: FastifyInstance) {
    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.get("/:id", getNoteById);
        protectRoute.patch("/:id", updateNote);
        protectRoute.delete("/:id", deleteNote);
    });
}
