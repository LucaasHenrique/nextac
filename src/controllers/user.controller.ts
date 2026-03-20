import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.user as { id: string };

        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                university: users.university,
                major: users.major,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, id));

        if (user.length === 0) {
            return reply.status(404).send({ message: "User not found" });
        }

        return reply.status(200).send(user[0]);
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.user as { id: string };

        const body = request.body as {
            name?: string;
            email?: string;
            password?: string;
            university?: string;
            major?: string;
        };

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id));

        if (existingUser.length === 0) {
            return reply.status(404).send({ message: "User not found" });
        }

        const updateData: Record<string, unknown> = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.university !== undefined) updateData.university = body.university;
        if (body.major !== undefined) updateData.major = body.major;

        if (body.password !== undefined) {
            const hashedPassword = await bcrypt.hash(body.password, 10);
            updateData.password = hashedPassword;
        }

        updateData.updatedAt = new Date();

        const updated = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                university: users.university,
                major: users.major,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        return reply.status(200).send(updated[0]);
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const deleteMe = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.user as { id: string };

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id));

        if (existingUser.length === 0) {
            return reply.status(404).send({ message: "User not found" });
        }

        await db.delete(users).where(eq(users.id, id));

        reply.clearCookie("access_token");
        reply.clearCookie("refresh_token");

        return reply.status(200).send({ message: "Account deleted successfully" });
    } catch (error) {
        return reply.status(500).send({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
