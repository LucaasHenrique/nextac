import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/errors/http.errors.js";
import jwt from "jsonwebtoken";

export async function authMiddleware(request: FastifyRequest) {
    const token = request.cookies.access_token;

    if (!token) {
        throw new UnauthorizedError();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, email: string };
        request.user = decoded;
    } catch {
        throw new UnauthorizedError();
    }
}
