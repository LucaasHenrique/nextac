import {describe, it, expect, vi, beforeEach} from 'vitest'
import { createMockDb } from '../../mocks/db.mocks.js'
import { registerUser } from '../../../src/services/auth.service.js';
import { ConflictError } from '../../../src/errors/http.errors.js';

const mockDb = createMockDb();

vi.mock("../../../src/db/index", () => ({get db() {return mockDb}
}))

describe("Auth Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("deve lançar ConflictError se email ja existe", async () => {
        mockDb.where.mockResolvedValueOnce([{
            id: 1, email: "test@test.com", password: "hashed"
        }])
        
        await expect(registerUser({username: 'test',email: 'test@test.com', password: '123', university: 'test', major: 'Software Engineer'})).rejects.toThrow(ConflictError);
    })
})


