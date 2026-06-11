import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockDb } from "../../mocks/db.mocks.js";
import {
    createQuestion,
    deleteQuestion,
    getQuestionById,
    getQuestionsByUserId,
    updateQuestion,
    associateTopicToQuestion,
    deleteQuestionTopic,
    getQuestionToReviewToday,
    addSpacedRepetition,
} from "../../../src/services/question.service.js";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "../../../src/errors/http.errors.js";

const mockDb = createMockDb();

vi.mock("../../../src/db/index", () => ({
    get db() {
        return mockDb;
    },
}));

const TEST_USER_UUID = "123e2167-e89b-12d3-a456-426614174000";
const QUESTION_ID = "123e4567-e89b-12d3-a456-426614174000";
const TOPIC_ID = "123e4217-e89b-12d3-a421-426614174000";

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

    it("deve associar um topic a uma questao com sucesso", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: QUESTION_ID }]);
        mockDb.where.mockResolvedValueOnce([{ id: TOPIC_ID }]);

        await associateTopicToQuestion(QUESTION_ID, TOPIC_ID, TEST_USER_UUID);

        expect(mockDb.where).toHaveBeenCalledTimes(2);
        expect(mockDb.insert).toHaveBeenCalled();
    });

    it("deve retornar NotFoundError ao associar um topic a uma questao inexistente", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(
            associateTopicToQuestion(QUESTION_ID, TOPIC_ID, TEST_USER_UUID),
        ).rejects.toThrow(NotFoundError);
    });

    it("deve retornar NotFoundError ao associar um topic não existente", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(
            associateTopicToQuestion(QUESTION_ID, TOPIC_ID, TEST_USER_UUID),
        ).rejects.toThrow(NotFoundError);
    });

    it("deve remover a associação entre topic e questao", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: QUESTION_ID }]);
        mockDb.where.mockResolvedValueOnce([{ id: TOPIC_ID }]);

        await deleteQuestionTopic(QUESTION_ID, TOPIC_ID, TEST_USER_UUID);

        expect(mockDb.where).toHaveBeenCalledTimes(3);
        expect(mockDb.delete).toHaveBeenCalled();
    });

    it("deve retornar questoes para revisar hoje", async () => {
        const dueQuestions = [
            {
                id: QUESTION_ID,
                name: "Towers",
                userId: TEST_USER_UUID,
                next_review: "2026-06-10",
            },
        ];

        mockDb.where.mockResolvedValueOnce(dueQuestions);

        const result = await getQuestionToReviewToday(TEST_USER_UUID);

        expect(result).toEqual(dueQuestions);
        expect(mockDb.select).toHaveBeenCalledTimes(1);
        expect(mockDb.from).toHaveBeenCalledTimes(1);
        expect(mockDb.where).toHaveBeenCalledTimes(1);
    });

    it("deve retornar BadRequestError se grade < 0", async () => {
        const obj = {
            grade: -1,
            questionId: QUESTION_ID,
            userId: TEST_USER_UUID,
        };

        await expect(
            addSpacedRepetition(obj.grade, obj.questionId, obj.userId),
        ).rejects.toThrow(BadRequestError);
    });

    it("deve retornar BadRequestError se grade > 6", async () => {
        const obj = {
            grade: 6,
            questionId: QUESTION_ID,
            userId: TEST_USER_UUID,
        };

        await expect(
            addSpacedRepetition(obj.grade, obj.questionId, obj.userId),
        ).rejects.toThrow(BadRequestError);
    });

    it("deve retornar ForbiddenError se userId não for o mesmo do question", async () => {
        mockDb.where.mockResolvedValueOnce([
            {
                userId: TEST_USER_UUID,
                easeFactor: 2.5,
                interval_days: 1,
                times_reviewed: 1,
            },
        ]);

        const obj = {
            grade: 4,
            questionId: QUESTION_ID,
            userId: TEST_USER_UUID,
        };

        await expect(
            addSpacedRepetition(obj.grade, obj.questionId, "12212"),
        ).rejects.toThrow(ForbiddenError);
    });

    it("deve retornar NotFoundError se question não for encontrado", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        const obj = {
            grade: 4,
            questionId: QUESTION_ID,
            userId: TEST_USER_UUID,
        };

        await expect(
            addSpacedRepetition(obj.grade, obj.questionId, obj.userId),
        ).rejects.toThrow(NotFoundError);
    });

    it("deve atualizar campos SM-2", async () => {
        mockDb.where.mockResolvedValueOnce([
            {
                userId: TEST_USER_UUID,
                easeFactor: 2.5,
                interval_days: 0,
                times_reviewed: 0,
            },
        ]);
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.returning.mockResolvedValueOnce([{ id: QUESTION_ID }]);
        const result = await addSpacedRepetition(
            4,
            QUESTION_ID,
            TEST_USER_UUID,
        );
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalledWith(
            expect.objectContaining({
                ease_factor: expect.any(Number),
                interval_days: expect.any(Number),
                times_reviewed: expect.any(Number),
                next_review: expect.any(String),
                last_reviewed_at: expect.any(Date),
                updatedAt: expect.any(Date),
            }),
        );
        expect(result).toHaveProperty("question");
        expect(result).toHaveProperty("nextReview");
        expect(result).toHaveProperty("interval_days");
    });
});
