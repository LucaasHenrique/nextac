import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam } from "@/types/index.js";
import type { CreateFolderBody, UpdateFolderBody } from "@/types/folder.types.js";
import { ServiceError } from "@/services/auth.service.js";
import * as folderService from "@/services/folder.service.js";

export const createFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const body = request.body as CreateFolderBody;

        const createdFolder = await folderService.createFolder(userId, body);

        return reply.status(201).send(createdFolder);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }

        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getFolders = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id: userId } = request.user as AuthUser;
        const { parentId } = request.query as { parentId?: string };

        const folders = await folderService.getFolders(userId, parentId);

        return reply.status(200).send(folders);
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getFolderById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;

        const selectedFolder = await folderService.getFolderById(id, userId);

        return reply.status(200).send(selectedFolder);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }

        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const updateFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;
        const body = request.body as UpdateFolderBody;

        const updatedFolder = await folderService.updateFolder(id, userId, body);

        return reply.status(200).send(updatedFolder);
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }

        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const deleteFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as IdParam;
        const { id: userId } = request.user as AuthUser;

        await folderService.deleteFolder(id, userId);

        return reply.status(200).send({ message: "Folder deleted successfully" });
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }

        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
