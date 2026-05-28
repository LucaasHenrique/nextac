import {describe, it, expect, vi, beforeEach} from 'vitest'
import { createMockDb } from '../../mocks/db.mocks.js'
import { loginUser, registerUser } from '../../../src/services/auth.service.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../../src/errors/http.errors.js';
import bcrypt from 'bcrypt'

const mockDb = createMockDb();

vi.mock("../../../src/db/index", () => ({get db() {return mockDb}
}))

describe("Auth Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    describe('registerUser', async () => {

        it('deve criar usuario com sucesso', async () => {
            mockDb.where.mockResolvedValue([]);
            mockDb.values.mockResolvedValueOnce([{id: 1}]);

            await registerUser({
                username: 'test',
                email: 'test@test.com',
                password: '123456',
                university: 'UFMG',
                major: 'CS',
            })

            expect(mockDb.insert).toHaveBeenCalled();
        })
    
        it("deve lançar ConflictError se email ja existe", async () => {
            mockDb.where.mockResolvedValueOnce([{
                id: 1, email: "test@test.com", password: "hashed"
            }])
        
            await expect(registerUser({username: 'test',email: 'test@test.com', password: '123', university: 'test', major: 'Software Engineer'}))
            .rejects.toThrow(ConflictError);
        })
    })
    
    describe('loginUser', async () => {
        it('deve retornar o token com sucesso', async () => {
            mockDb.where.mockResolvedValueOnce([{
                id: 1,
                email: "test@test.com",
                password: 'hashed',
            }])

            
            const result = await loginUser("test@test.com", '123456');

            expect(result).toHaveProperty("accessToken")
            expect(result).toHaveProperty("refreshToken")
        })
        
        it('Deve retornar NotFoundError se user não existir', async () => {
            mockDb.where.mockResolvedValueOnce([]);

            await expect(loginUser('test@test.com', '123456')).rejects.toThrow(NotFoundError);
        })

        it('deve retonar UnauthorizedError se senha invalida', async () => {
            mockDb.where.mockResolvedValueOnce([{
                id: '1',
                email: 'test@test.com',
                password: 'hashed',
            }])
             
            vi.mocked(bcrypt.compare as any).mockResolvedValueOnce(null);

            await expect(loginUser('test@test.com', 'wrong'))
                .rejects.toThrow(UnauthorizedError)
        })
    })
    

    
})


