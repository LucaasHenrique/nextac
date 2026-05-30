import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockDb } from '../../mocks/db.mocks.js'
import {
    createFolder,
    getFolders,
    getFolderById,
    searchFoldersByName,
    updateFolder,
    deleteFolder,
    deleteFolderRecursively,
} from '../../../src/services/folder.service.js'
import { NotFoundError, BadRequestError, ConflictError } from '../../../src/errors/http.errors.js'

const mockDb = createMockDb()

vi.mock("@/db/index.js", () => ({ get db() { return mockDb } }))

const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000'
const TEST_FOLDER_ID = 'folder-1'
const TEST_PARENT_ID = 'parent-1'

describe('Folder Service', () => {
    beforeEach(() => {
        vi.resetAllMocks()

        mockDb.select.mockReturnValue(mockDb)
        mockDb.from.mockReturnValue(mockDb)
        mockDb.where.mockReturnValue(mockDb)
        mockDb.insert.mockReturnValue(mockDb)
        mockDb.values.mockReturnValue(mockDb)
        mockDb.returning.mockReturnValue(mockDb)
        mockDb.update.mockReturnValue(mockDb)
        mockDb.set.mockReturnValue(mockDb)
        mockDb.delete.mockReturnValue(mockDb)
    })

    describe('createFolder', () => {
        it('deve criar folder na raiz com sucesso', async () => {
            mockDb.where.mockResolvedValueOnce([])
            mockDb.returning.mockResolvedValueOnce([{
                id: TEST_FOLDER_ID,
                name: 'Root Folder',
                userId: TEST_USER_ID,
                parentId: null,
            }])

            const result = await createFolder(TEST_USER_ID, { name: 'Root Folder' })

            expect(result.id).toBe(TEST_FOLDER_ID)
            expect(result.parentId).toBeNull()
            expect(mockDb.insert).toHaveBeenCalled()
        })

        it('deve criar folder dentro de um parent válido', async () => {
            mockDb.where.mockResolvedValueOnce([{ id: TEST_PARENT_ID, name: 'Parent', userId: TEST_USER_ID }])
            mockDb.where.mockResolvedValueOnce([])
            mockDb.returning.mockResolvedValueOnce([{
                id: TEST_FOLDER_ID,
                name: 'Child Folder',
                userId: TEST_USER_ID,
                parentId: TEST_PARENT_ID,
            }])

            const result = await createFolder(TEST_USER_ID, { name: 'Child Folder', parentId: TEST_PARENT_ID })

            expect(result.parentId).toBe(TEST_PARENT_ID)
            expect(mockDb.insert).toHaveBeenCalled()
        })

        it('deve lançar NotFoundError se o parent não existe', async () => {
            mockDb.where.mockResolvedValueOnce([])

            await expect(
                createFolder(TEST_USER_ID, { name: 'Child Folder', parentId: 'invalid-parent' })
            ).rejects.toThrow(NotFoundError)
        })

        it('deve lançar ConflictError se nome duplicado na raiz', async () => {
            mockDb.where.mockResolvedValueOnce([{ id: 'existing-folder', name: 'Duplicate', userId: TEST_USER_ID, parentId: null }])

            await expect(
                createFolder(TEST_USER_ID, { name: 'Duplicate' })
            ).rejects.toThrow(ConflictError)
        })

        it('deve lançar ConflictError se nome duplicado no mesmo parent', async () => {
            mockDb.where.mockResolvedValueOnce([{ id: TEST_PARENT_ID, name: 'Parent', userId: TEST_USER_ID }])
            mockDb.where.mockResolvedValueOnce([{ id: 'existing-folder', name: 'Duplicate', userId: TEST_USER_ID, parentId: TEST_PARENT_ID }])

            await expect(
                createFolder(TEST_USER_ID, { name: 'Duplicate', parentId: TEST_PARENT_ID })
            ).rejects.toThrow(ConflictError)
        })
    })

    describe('getFolders', () => {
        it('deve retornar folders da raiz quando parentId não é fornecido', async () => {
            const mockFolders = [
                { id: '1', name: 'Folder 1', userId: TEST_USER_ID, parentId: null },
                { id: '2', name: 'Folder 2', userId: TEST_USER_ID, parentId: null },
            ]

            mockDb.where.mockResolvedValueOnce(mockFolders)

            const result = await getFolders(TEST_USER_ID)

            expect(result).toEqual(mockFolders)
        })

        it('deve retornar subfolders de um parent quando parentId é fornecido', async () => {
            const mockSubfolders = [
                { id: '3', name: 'Sub 1', userId: TEST_USER_ID, parentId: TEST_PARENT_ID },
                { id: '4', name: 'Sub 2', userId: TEST_USER_ID, parentId: TEST_PARENT_ID },
            ]

            mockDb.where.mockResolvedValueOnce(mockSubfolders)

            const result = await getFolders(TEST_USER_ID, TEST_PARENT_ID)

            expect(result).toEqual(mockSubfolders)
        })
    })

    describe('searchFoldersByName', () => {
        it('deve retornar folders que correspondem ao nome', async () => {
            const mockResults = [
                { id: '1', name: 'Algorithms', userId: TEST_USER_ID, parentId: null },
            ]

            mockDb.where.mockResolvedValueOnce(mockResults)

            const result = await searchFoldersByName(TEST_USER_ID, 'Algo')

            expect(result).toEqual(mockResults)
        })

        it('deve lançar BadRequestError se nome vazio', async () => {
            await expect(searchFoldersByName(TEST_USER_ID, '   '))
                .rejects.toThrow(BadRequestError)
        })
    })

    describe('updateFolder', () => {
        it('deve atualizar nome do folder', async () => {
            mockDb.where.mockResolvedValueOnce([{ id: TEST_FOLDER_ID, name: 'Old Name', userId: TEST_USER_ID, parentId: null }])
            mockDb.where.mockResolvedValueOnce([])
            mockDb.returning.mockResolvedValueOnce([{ id: TEST_FOLDER_ID, name: 'New Name', userId: TEST_USER_ID, parentId: null }])

            const result = await updateFolder(TEST_FOLDER_ID, TEST_USER_ID, { name: 'New Name' })

            expect(result.name).toBe('New Name')
            expect(mockDb.update).toHaveBeenCalled()
        })

        it('deve lançar BadRequestError se folder é seu próprio parent', async () => {
            mockDb.where.mockResolvedValueOnce([{ id: TEST_FOLDER_ID, name: 'Folder', userId: TEST_USER_ID, parentId: null }])
            mockDb.where.mockResolvedValueOnce([{ id: TEST_FOLDER_ID, name: 'Folder', userId: TEST_USER_ID }])

            await expect(
                updateFolder(TEST_FOLDER_ID, TEST_USER_ID, { parentId: TEST_FOLDER_ID })
            ).rejects.toThrow(BadRequestError)
        })

        it('deve lançar NotFoundError se o novo parent não existe', async () => {
            mockDb.where.mockResolvedValueOnce([{ id: TEST_FOLDER_ID, name: 'Folder', userId: TEST_USER_ID, parentId: null }])
            mockDb.where.mockResolvedValueOnce([])

            await expect(
                updateFolder(TEST_FOLDER_ID, TEST_USER_ID, { parentId: 'invalid-parent' })
            ).rejects.toThrow(NotFoundError)
        })

        it('deve lançar ConflictError se nome duplicado na mesma localização', async () => {
            mockDb.where.mockResolvedValueOnce([{ id: TEST_FOLDER_ID, name: 'Old Name', userId: TEST_USER_ID, parentId: null }])
            mockDb.where.mockResolvedValueOnce([{ id: 'other-folder', name: 'Duplicate', userId: TEST_USER_ID, parentId: null }])

            await expect(
                updateFolder(TEST_FOLDER_ID, TEST_USER_ID, { name: 'Duplicate' })
            ).rejects.toThrow(ConflictError)
        })
    })

    describe('deleteFolder', () => {
        it('deve lançar NotFoundError se folder não existe', async () => {
            mockDb.where.mockResolvedValueOnce([])

            await expect(deleteFolder(TEST_FOLDER_ID, TEST_USER_ID))
                .rejects.toThrow(NotFoundError)
        })

        it('deve deletar folder recursivamente', async () => {
            mockDb.where.mockResolvedValueOnce([{ id: TEST_FOLDER_ID, name: 'Folder', userId: TEST_USER_ID, parentId: null }])
            mockDb.where.mockResolvedValueOnce([])

            await deleteFolder(TEST_FOLDER_ID, TEST_USER_ID)

            expect(mockDb.delete).toHaveBeenCalled()
        })
    })

    describe('deleteFolderRecursively', () => {
        it('deve deletar subfolders em cadeia', async () => {
            const subfolder = { id: 'sub-1', name: 'Sub', userId: TEST_USER_ID, parentId: TEST_FOLDER_ID }

            mockDb.where
                .mockResolvedValueOnce([subfolder])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])

            await deleteFolderRecursively(TEST_FOLDER_ID, TEST_USER_ID)

            expect(mockDb.delete).toHaveBeenCalledTimes(2)
        })
    })

    describe('getFolderById', () => {
        it('deve retornar folder quando existe', async () => {
            const mockFolder = { id: TEST_FOLDER_ID, name: 'Test Folder', userId: TEST_USER_ID, parentId: null }

            mockDb.where.mockResolvedValueOnce([mockFolder])

            const result = await getFolderById(TEST_FOLDER_ID, TEST_USER_ID)

            expect(result).toEqual(mockFolder)
        })

        it('deve lançar NotFoundError se folder não existe', async () => {
            mockDb.where.mockResolvedValueOnce([])

            await expect(getFolderById(TEST_FOLDER_ID, TEST_USER_ID))
                .rejects.toThrow(NotFoundError)
        })
    })
})
