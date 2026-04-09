import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { RegisterBody, LoginResult, JwtPayload } from "@/types/index.js";
import { ConflictError, NotFoundError, UnauthorizedError, ServiceError } from "@/errors/http.errors.js";

export { ServiceError };

export const registerUser = async ({ username, email, password, university, major }: RegisterBody) => {
    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length > 0) {
        throw new ConflictError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
        name: username,
        email,
        password: hashedPassword,
        university,
        major,
    });
};

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
    const user = await db.select().from(users).where(eq(users.email, email));

    if (user.length === 0) {
        throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid password");
    }

    const payload = { id: user[0].id, email: user[0].email };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;

        const user = await db.select().from(users).where(eq(users.id, decoded.id));

        if (user.length === 0) {
            throw new NotFoundError("User not found");
        }

        const payload = { id: user[0].id, email: user[0].email };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });

        return accessToken;
    } catch (error) {
        if (error instanceof ServiceError) throw error;
        throw new UnauthorizedError("Invalid refresh token");
    }
};
