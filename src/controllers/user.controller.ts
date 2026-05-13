import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, UpdateUserBody } from "@/types/index.js";
import * as userService from "@/services/user.service.js";

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.user as AuthUser;

    const user = await userService.getUserById(id);

    return reply.status(200).send(user);
};

export const updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.user as AuthUser;
    const body = request.body as UpdateUserBody;

    const updated = await userService.updateUser(id, body);

    return reply.status(200).send(updated);
};

export const deleteMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.user as AuthUser;

    await userService.deleteUser(id);

    reply.clearCookie("access_token");
    reply.clearCookie("refresh_token");

    return reply.status(200).send({ message: "Account deleted successfully" });
};
