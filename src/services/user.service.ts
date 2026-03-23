import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { ServiceError } from "./auth.service.js";
import type { UpdateUserBody } from "@/types/index.js";

export const getUserById = async (id: string) => {
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
        throw new ServiceError(404, "User not found");
    }

    return user[0];
};

export const updateUser = async (id: string, data: UpdateUserBody) => {
    const existingUser = await db.select().from(users).where(eq(users.id, id));

    if (existingUser.length === 0) {
        throw new ServiceError(404, "User not found");
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.university !== undefined) updateData.university = data.university;
    if (data.major !== undefined) updateData.major = data.major;

    if (data.password !== undefined) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
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

    return updated[0];
};

export const deleteUser = async (id: string) => {
    const existingUser = await db.select().from(users).where(eq(users.id, id));

    if (existingUser.length === 0) {
        throw new ServiceError(404, "User not found");
    }

    await db.delete(users).where(eq(users.id, id));
};
