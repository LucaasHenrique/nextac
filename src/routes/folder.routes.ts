import { FastifyInstance } from "fastify";
import { authMiddleware } from "@/middleware/auth.js";
import {
    createFolder,
    getFolders,
    searchFoldersByName,
    getFolderById,
    updateFolder,
    deleteFolder,
} from "@/controllers/folder.controller.js";

export default async function folderRoutes(app: FastifyInstance) {
    app.register(async (protectRoute) => {
        protectRoute.addHook("preHandler", authMiddleware);

        protectRoute.post("/", createFolder);
        protectRoute.get("/", getFolders);
        protectRoute.get("/search", searchFoldersByName);
        protectRoute.get("/:id", getFolderById);
        protectRoute.patch("/:id", updateFolder);
        protectRoute.delete("/:id", deleteFolder);
    });
}
