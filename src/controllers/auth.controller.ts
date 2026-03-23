import type { FastifyRequest, FastifyReply } from "fastify";
import type { RegisterBody, LoginBody } from "@/types/index.js";
import { ServiceError, registerUser, loginUser, refreshAccessToken } from "@/services/auth.service.js";

export const register = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { username, email, password, university, major } = request.body as RegisterBody;

        await registerUser({ username, email, password, university, major });

        return reply.status(201).send({ message: "User created successfully" });
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { email, password } = request.body as LoginBody;

        const { accessToken, refreshToken } = await loginUser(email, password);

        reply.setCookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15,
        }).setCookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return reply.status(200).send({ message: "Login successful", accessToken });
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const refreshToken = request.cookies.refresh_token;

        if (!refreshToken) {
            return reply.status(401).send({ message: "Refresh token not found" });
        }

        const accessToken = await refreshAccessToken(refreshToken);

        reply.setCookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15,
        });

        return reply.status(200).send({ message: "Refresh token successful" });
    } catch (error) {
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie("access_token").clearCookie("refresh_token");
    return reply.status(200).send({ message: "Logout successful" });
};
