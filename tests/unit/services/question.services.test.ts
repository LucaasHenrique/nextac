import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockDb } from "../../mocks/db.mocks.js";
import {
    createQuestion,
    deleteQuestion,
    getQuestionById,
    getQuestionsByUserId,
    updateQuestion,
} from "../../../src/services/question.service.js";
import {
    ConflictError,
    NotFoundError,
} from "../../../src/errors/http.errors.js";

const mockDb = createMockDb();

vi.mock("../../../src/db/index", () => ({
    get db() {
        return mockDb;
    },
}));

const TEST_USER_UUID = "123e4567-e89b-12d3-a456-426614174000";
const QUESTION_ID = "123e4567-e89b-12d3-a456-426614174000";

describe("questionService", async () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.where.mockReset();
        mockDb.where.mockResolvedValue([]);
        mockDb.insert.mockReturnValue(mockDb);
        mockDb.values.mockReturnValue(mockDb);
        mockDb.update.mockReturnValue(mockDb);
        mockDb.set.mockReturnValue(mockDb);
        mockDb.returning.mockResolvedValue([]);
    });

    it("deve criar uma questão com sucesso", async () => {
        mockDb.where.mockResolvedValueOnce([]);
        mockDb.returning.mockResolvedValueOnce([{ id: QUESTION_ID }]);

        await createQuestion({
            title: "Towers",
            description: "Calculete the number of towers",
            link: "https://cses.fi/towers",
            difficulty: "4.5",
            userId: TEST_USER_UUID,
        });

        expect(mockDb.insert).toHaveBeenCalled();
    });

    it("deve retornar conflict error se o usuario ja cadastrou a questao", async () => {
        mockDb.where.mockResolvedValueOnce([
            {
                title: "Towers",
                description: "Calculete the number of towers",
                link: "https://cses.fi/towers",
                difficulty: "4.5",
                userId: TEST_USER_UUID,
            },
        ]);

        await expect(
            createQuestion({
                title: "Towers",
                description: "Calculete the number of towers",
                link: "https://cses.fi/towers",
                difficulty: "4.5",
                userId: TEST_USER_UUID,
            }),
        ).rejects.toThrow(ConflictError);
    });

    it("deve retornar questao pelo user id", async () => {
        mockDb.where.mockResolvedValueOnce([
            {
                id: QUESTION_ID,
                name: "Towers",
                description: "Calculete the number of towers",
                link: "https://cses.fi/towers",
                difficulty_rating: "4.5",
                userId: TEST_USER_UUID,
            },
        ]);

        const question = await getQuestionsByUserId(TEST_USER_UUID);

        for (const q of question) {
            expect(q).toBeDefined();
            expect(q.id).toBe(QUESTION_ID);
            expect(q.name).toBe("Towers");
            expect(q.description).toBe("Calculete the number of towers");
            expect(q.link).toBe("https://cses.fi/towers");
            expect(q.difficulty_rating).toBe("4.5");
            expect(q.userId).toBe(TEST_USER_UUID);
            expect(mockDb.where).toHaveBeenCalledTimes(1);
            expect(mockDb.select).toHaveBeenCalledTimes(1);
            expect(mockDb.from).toHaveBeenCalledTimes(1);
        }
    });

    it("deve retornar questao pelo id", async () => {
        mockDb.where.mockResolvedValueOnce([
            {
                id: QUESTION_ID,
                name: "Towers",
                description: "Calculete the number of towers",
                link: "https://cses.fi/towers",
                difficulty_rating: "4.5",
                userId: TEST_USER_UUID,
            },
        ]);

        const question = await getQuestionById(QUESTION_ID, TEST_USER_UUID);

        expect(question).toBeDefined();
        expect(question.id).toBe(QUESTION_ID);
        expect(question.name).toBe("Towers");
        expect(question.description).toBe("Calculete the number of towers");
        expect(question.link).toBe("https://cses.fi/towers");
        expect(question.difficulty_rating).toBe("4.5");
        expect(question.userId).toBe(TEST_USER_UUID);
        expect(mockDb.where).toHaveBeenCalledTimes(1);
        expect(mockDb.select).toHaveBeenCalledTimes(1);
        expect(mockDb.from).toHaveBeenCalledTimes(1);
    });

    it("deve retornar not found error se a questao nao for encontrada", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(
            getQuestionById(QUESTION_ID, TEST_USER_UUID),
        ).rejects.toThrow(NotFoundError);
        expect(mockDb.where).toHaveBeenCalledTimes(1);
        expect(mockDb.select).toHaveBeenCalledTimes(1);
        expect(mockDb.from).toHaveBeenCalledTimes(1);
    });

    it("deve atualizar todos os campos da questao", async () => {
        mockDb.where.mockResolvedValueOnce([
            {
                id: QUESTION_ID,
                name: "Towers",
                description: "Old description",
                link: "https://cses.fi/towers",
                difficulty_rating: "2.0",
                status: "pending",
                platform: "cses",
                user_dificulty: "1",
                folderId: null,
                userId: TEST_USER_UUID,
            },
        ]);
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.returning.mockResolvedValueOnce([
            {
                id: QUESTION_ID,
                name: "Updated Towers",
                description: "Updated description",
                link: "https://cses.fi/towers-updated",
                difficulty_rating: "4.5",
                status: "solved",
                platform: "leetcode",
                user_dificulty: "4",
                folderId: "folder-1",
                userId: TEST_USER_UUID,
            },
        ]);

        const result = await updateQuestion(QUESTION_ID, TEST_USER_UUID, {
            title: "Updated Towers",
            description: "Updated description",
            link: "https://cses.fi/towers-updated",
            difficulty: "4.5",
            status: "solved",
            platform: "leetcode",
            user_difficulty: "4",
            folderId: "folder-1",
        });

        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalledWith({
            name: "Updated Towers",
            description: "Updated description",
            link: "https://cses.fi/towers-updated",
            difficulty_rating: "4.5",
            status: "solved",
            platform: "leetcode",
            user_dificulty: "4",
            folderId: "folder-1",
            updatedAt: expect.any(Date),
        });
        expect(result[0].name).toBe("Updated Towers");
    });

    it("deve fazer update parcial com apenas campos enviados", async () => {
        mockDb.where.mockResolvedValueOnce([
            {
                id: QUESTION_ID,
                name: "Towers",
                description: "Old description",
                userId: TEST_USER_UUID,
            },
        ]);
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.returning.mockResolvedValueOnce([
            {
                id: QUESTION_ID,
                name: "Only Title Updated",
                description: "Old description",
                userId: TEST_USER_UUID,
            },
        ]);

        const result = await updateQuestion(QUESTION_ID, TEST_USER_UUID, {
            title: "Only Title Updated",
        });

        expect(mockDb.set).toHaveBeenCalledWith({
            name: "Only Title Updated",
            updatedAt: expect.any(Date),
        });
        expect(result[0].name).toBe("Only Title Updated");
    });

    it("deve lançar NotFoundError ao atualizar questao inexistente", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(
            updateQuestion(QUESTION_ID, TEST_USER_UUID, { title: "Updated" }),
        ).rejects.toThrow(NotFoundError);
    });

    it("deve deletar uma questao com sucesso", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: QUESTION_ID }]);
        mockDb.where.mockReturnValueOnce(mockDb);

        await deleteQuestion(QUESTION_ID, TEST_USER_UUID);

        expect(mockDb.delete).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalledTimes(2);
    });

    it("deve lançar NotFoundError ao deletar questao inexistente", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(
            deleteQuestion(QUESTION_ID, TEST_USER_UUID),
        ).rejects.toThrow(NotFoundError);
    });
});
