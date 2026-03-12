import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies.access_token;

    if (!token) {
        return reply.status(401).send({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, email: string };
        request.user = decoded;
    } catch {
        return reply.status(401).send({ message: "Unauthorized" });
    }
}
