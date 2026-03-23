import { FastifyInstance } from "fastify";
import { createNote, getStandaloneNotes, getNoteById, updateNote, deleteNote } from "@/controllers/notes.controller.js";
import { authMiddleware } from "@/middleware/auth.js";

export default async function notesRoutes(app: FastifyInstance) {
    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.post("/", createNote);
        protectRoute.get("/standalone", getStandaloneNotes);
        protectRoute.get("/:id", getNoteById);
        protectRoute.patch("/:id", updateNote);
        protectRoute.delete("/:id", deleteNote);
    });
}
