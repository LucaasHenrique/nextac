import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, IdParam } from "@/types/index.js";
import type { CreateFolderBody, UpdateFolderBody } from "@/types/folder.types.js";
import * as folderService from "@/services/folder.service.js";

export const createFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const body = request.body as CreateFolderBody;

    const createdFolder = await folderService.createFolder(userId, body);

    return reply.status(201).send(createdFolder);
};

export const getFolders = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { parentId } = request.query as { parentId?: string };

    const folders = await folderService.getFolders(userId, parentId);

    return reply.status(200).send(folders);
};

export const searchFoldersByName = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = request.user as AuthUser;
    const { name } = request.query as { name?: string };

    const folders = await folderService.searchFoldersByName(userId, name ?? "");

    return reply.status(200).send(folders);
};

export const getFolderById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;

    const selectedFolder = await folderService.getFolderById(id, userId);

    return reply.status(200).send(selectedFolder);
};

export const updateFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;
    const body = request.body as UpdateFolderBody;

    const updatedFolder = await folderService.updateFolder(id, userId, body);

    return reply.status(200).send(updatedFolder);
};

export const deleteFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as IdParam;
    const { id: userId } = request.user as AuthUser;

    await folderService.deleteFolder(id, userId);

    return reply.status(200).send({ message: "Folder deleted successfully" });
};
