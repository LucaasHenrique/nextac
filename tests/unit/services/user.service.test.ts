import {describe, it, expect, vi, beforeEach} from 'vitest'
import { createMockDb } from '../../mocks/db.mocks.js'
import { getUserById, updateUser, deleteUser } from '../../../src/services/user.service.js'
import { NotFoundError } from '../../../src/errors/http.errors.js'
import bcrypt from 'bcrypt'

const mockDb = createMockDb();

vi.mock("../../../src/db/index", () => ({get db() {return mockDb}}))

const TEST_UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('userService', async () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("deve retornar o user pelo id", async () => {
        const mockUser = {
            id: TEST_UUID,
            name: 'test',
            email: 'test@test.com',
            university: 'UFMG',
            major: 'CS',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockDb.where.mockResolvedValueOnce([mockUser]);
        
        const result = await getUserById(TEST_UUID);

        expect(result).toMatchObject({
            id: TEST_UUID,
            name: 'test',
            email: 'test@test.com',
            university: 'UFMG',
            major: 'CS',
        })
    })

    it("deve lançar NotFoundError se user não existe", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(getUserById(TEST_UUID)).rejects.toThrow(NotFoundError);
    })

    it("deve atualizar nome e email", async () => {
        const mockUser = { id: TEST_UUID, name: 'test', email: 'test@test.com' };
        mockDb.where.mockResolvedValueOnce([mockUser]);
        mockDb.returning.mockResolvedValueOnce([{
            ...mockUser,
            name: 'updated',
            email: 'updated@test.com',
            university: 'UFMG',
            major: 'CS',
            createdAt: new Date(),
            updatedAt: new Date(),
        }]);

        await updateUser(TEST_UUID, { name: 'updated', email: 'updated@test.com' });

        expect(mockDb.set).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'updated',
                email: 'updated@test.com',
            })
        );
    })

    it("deve fazer hash se password enviado", async () => {
        const mockUser = { id: TEST_UUID, name: 'test', email: 'test@test.com' };
        mockDb.where.mockResolvedValueOnce([mockUser]);
        mockDb.returning.mockResolvedValueOnce([{
            ...mockUser,
            university: 'UFMG',
            major: 'CS',
            createdAt: new Date(),
            updatedAt: new Date(),
        }]);

        await updateUser(TEST_UUID, { password: 'newpassword123' });

        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    })

    it("deve fazer update parcial (só nome)", async () => {
        const mockUser = { id: TEST_UUID, name: 'test', email: 'test@test.com' };
        mockDb.where.mockResolvedValueOnce([mockUser]);
        mockDb.returning.mockResolvedValueOnce([{
            ...mockUser,
            name: 'updated',
            university: 'UFMG',
            major: 'CS',
            createdAt: new Date(),
            updatedAt: new Date(),
        }]);

        await updateUser(TEST_UUID, { name: 'updated' });

        expect(mockDb.set).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'updated',
            })
        );
        expect(mockDb.set).not.toHaveBeenCalledWith(
            expect.objectContaining({ password: expect.anything() })
        );
    })

    it("deve lançar NotFoundError se user não existe", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(updateUser(TEST_UUID, { name: 'updated' })).rejects.toThrow(NotFoundError);
    })

    it("deve remover user", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: TEST_UUID }]);
        mockDb.delete.mockReturnValue(mockDb);

        await deleteUser(TEST_UUID);

        expect(mockDb.delete).toHaveBeenCalled();
    })
})
