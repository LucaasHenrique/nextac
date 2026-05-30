import {describe, it, expect, vi, beforeEach} from 'vitest'
import { createMockDb } from '../../mocks/db.mocks.js'
import { createQuestion } from '../../../src/services/question.service.js';
import { ConflictError } from '../../../src/errors/http.errors.js';

const mockDb = createMockDb();

vi.mock("../../../src/db/index", () => ({get db() {return mockDb}}))


const TEST_USER_UUID = '123e4567-e89b-12d3-a456-426614174000'



describe('questionService', async () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("deve criar uma questão com sucesso", async () => {
        mockDb.where.mockResolvedValueOnce([]);
        mockDb.where.mockResolvedValueOnce([{id: 1}])

        await createQuestion({
            title: "Towers",
            description: "Calculete the number of towers",
            link: "https://cses.fi/towers",
            difficulty: "4.5",
            userId: TEST_USER_UUID
        })

        expect(mockDb.insert).toHaveBeenCalled();
    }) 

    it('deve retornar conflict error se o usuario ja cadastrou a questao', async () => {
        mockDb.where.mockResolvedValueOnce([{
            title: "Towers",
            description: "Calculete the number of towers",
            link: "https://cses.fi/towers",
            difficulty: "4.5",
            userId: TEST_USER_UUID
        }])
        
        await expect(createQuestion({title: "Towers",
            description: "Calculete the number of towers",
            link: "https://cses.fi/towers",
            difficulty: "4.5",
            userId: TEST_USER_UUID})).rejects.toThrow(ConflictError);
    })
})




