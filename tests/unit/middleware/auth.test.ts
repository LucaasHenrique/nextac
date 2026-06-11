import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../../src/middleware/auth.js";
import { UnauthorizedError } from "../../../src/errors/http.errors.js";

describe("authMiddleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";
    });

    it("deve decodificar token válido e anexar request.user", async () => {
        const request = {
            cookies: { access_token: "valid-token" },
        } as any;

        vi.mocked(jwt.verify).mockReturnValueOnce({ id: "user-1", email: "user@test.com" } as any);

        await authMiddleware(request);

        expect(request.user).toBeDefined();
        expect(request.user.id).toBe("user-1");
        expect(request.user.email).toBe("user@test.com");
    });

    it("deve lançar UnauthorizedError quando token está ausente", async () => {
        const request = {
            cookies: { access_token: undefined },
        } as any;

        await expect(authMiddleware(request)).rejects.toThrow(UnauthorizedError);
    });

    it("deve lançar UnauthorizedError quando token está expirado", async () => {
        const request = {
            cookies: { access_token: "expired-token" },
        } as any;

        vi.mocked(jwt.verify).mockImplementationOnce(() => {
            throw new Error("jwt expired");
        });

        await expect(authMiddleware(request)).rejects.toThrow(UnauthorizedError);
    });

    it("deve lançar UnauthorizedError quando token é inválido", async () => {
        const request = {
            cookies: { access_token: "invalid-token" },
        } as any;

        vi.mocked(jwt.verify).mockImplementationOnce(() => {
            throw new Error("invalid token");
        });

        await expect(authMiddleware(request)).rejects.toThrow(UnauthorizedError);
    });
});
