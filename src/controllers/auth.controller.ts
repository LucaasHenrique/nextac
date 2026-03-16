import { db } from "@/db/index.js";
import bcrypt from "bcrypt";
import type { FastifyRequest, FastifyReply } from "fastify";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema.js";
import jwt from "jsonwebtoken";

export const register = async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, email, password, university, major } = request.body as { email: string, password: 
        string, username: string, university: string, major: string };

    const user = await db.select().from(users).where(eq(users.email, email));

    if (user.length > 0) {
        return reply.status(400).send({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
        name: username,
        email,
        password: hashedPassword,
        university,
        major,
    });
        
    return reply.status(201).send({ message: "User created successfully" });
}

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as { email: string, password: string };

    const user = await db.select().from(users).where(eq(users.email, email));

    if (user.length === 0) {
        return reply.status(404).send({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
        return reply.status(401).send({ message: "Invalid password" });
    }

    const payload = {id: user[0].id, email: user[0].email}
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: "15m"})
    
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {expiresIn: "7d"})

    reply.setCookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 15
    }).setCookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
    });

    return reply.status(200).send({ message: "Login successful", accessToken });
}

export const refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refresh_token;

    if (!refreshToken) {
        return reply.status(401).send({ message: "Refresh token not found" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {id: string, email: string};

        const user = await db.select().from(users).where(eq(users.id, decoded.id));

        if (user.length === 0) {
            return reply.status(404).send({ message: "User not found" });
        }

        const payload = {id: user[0].id, email: user[0].email}
    
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: "15m"})
    
        reply.setCookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15
        });

        return reply.status(200).send({ message: "Refresh token successful" });
    } catch (error) {
        return reply.status(401).send({ message: "Invalid refresh token" });
    }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie("access_token").clearCookie("refresh_token")
    return reply.status(200).send({ message: "Logout successful" });
}
