import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockDb } from "../../mocks/db.mocks.js";
import {
    addQuestionsToSession,
    createSession,
    deleteSession,
    getSessionById,
    listSessionsByUser,
    removeQuestionFromSession,
} from "../../../src/services/review.session.service.js";
import { BadRequestError, NotFoundError } from "../../../src/errors/http.errors.js";

const mockDb = createMockDb();

vi.mock("@/db/index.js", () => ({
    get db() {
        return mockDb;
    },
}));

vi.mock("@/queues/review.session.queue.js", () => ({
    scheduleSessionEnd: vi.fn().mockResolvedValue(undefined),
    cancelScheduledSessionEnd: vi.fn().mockResolvedValue(undefined),
}));

const TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const SESSION_ID = "223e4567-e89b-12d3-a456-426614174000";
const QUESTION_ID_1 = "323e4567-e89b-12d3-a456-426614174000";
const QUESTION_ID_2 = "423e4567-e89b-12d3-a456-426614174000";

describe("reviewSessionService", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.where.mockReset();
        mockDb.where.mockResolvedValue([]);
        mockDb.insert.mockReturnValue(mockDb);
        mockDb.values.mockReturnValue(mockDb);
        mockDb.returning.mockResolvedValue([]);
        mockDb.delete.mockReturnValue(mockDb);
    });

    it("createSession cria sem questions", async () => {
        mockDb.returning.mockResolvedValueOnce([
            { id: SESSION_ID, name: "Sessao", plannedDuration: 30, userId: TEST_USER_ID },
        ]);

        const result = await createSession({
            name: "Sessao",
            plannedDuration: 30,
            userId: TEST_USER_ID,
            questionIds: [],
        });

        expect(result.id).toBe(SESSION_ID);
        expect(result.questionIds).toEqual([]);
        expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it("createSession cria com questions", async () => {
        const questionIds = [QUESTION_ID_1, QUESTION_ID_2];

        mockDb.where.mockResolvedValueOnce([{ id: QUESTION_ID_1 }, { id: QUESTION_ID_2 }]);
        mockDb.returning.mockResolvedValueOnce([
            { id: SESSION_ID, name: "Sessao", plannedDuration: 30, userId: TEST_USER_ID },
        ]);

        const result = await createSession({
            name: "Sessao",
            plannedDuration: 30,
            userId: TEST_USER_ID,
            questionIds,
        });

        expect(result.questionIds).toEqual(questionIds);
        expect(mockDb.insert).toHaveBeenCalledTimes(2);
        expect(mockDb.values).toHaveBeenNthCalledWith(2, [
            { reviewSessionId: SESSION_ID, questionId: QUESTION_ID_1 },
            { reviewSessionId: SESSION_ID, questionId: QUESTION_ID_2 },
        ]);
    });

    it("createSession lança BadRequestError se question não existe", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: QUESTION_ID_1 }]);

        await expect(
            createSession({
                name: "Sessao",
                plannedDuration: 30,
                userId: TEST_USER_ID,
                questionIds: [QUESTION_ID_1, QUESTION_ID_2],
            }),
        ).rejects.toThrow(BadRequestError);
    });

    it("listSessionsByUser retorna sessions", async () => {
        const sessions = [{ id: SESSION_ID, name: "Sessao", userId: TEST_USER_ID }];
        mockDb.where.mockResolvedValueOnce(sessions);

        const result = await listSessionsByUser(TEST_USER_ID);

        expect(result).toEqual(sessions);
    });

    it("listSessionsByUser lança NotFoundError se nenhuma", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(listSessionsByUser(TEST_USER_ID)).rejects.toThrow(NotFoundError);
    });

    it("getSessionById retorna session", async () => {
        const session = [{ id: SESSION_ID, name: "Sessao", userId: TEST_USER_ID }];
        mockDb.where.mockResolvedValueOnce(session);

        const result = await getSessionById(SESSION_ID, TEST_USER_ID);

        expect(result).toEqual(session);
    });

    it("getSessionById lança NotFoundError", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(getSessionById(SESSION_ID, TEST_USER_ID)).rejects.toThrow(NotFoundError);
    });

    it("deleteSession remove session", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: SESSION_ID, userId: TEST_USER_ID }]);
        mockDb.where.mockReturnValueOnce(mockDb);

        await deleteSession(SESSION_ID, TEST_USER_ID);

        expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });

    it("addQuestionsToSession adiciona questions", async () => {
        const questionIds = [QUESTION_ID_1, QUESTION_ID_2];
        mockDb.where.mockResolvedValueOnce([{ id: SESSION_ID, userId: TEST_USER_ID }]);
        mockDb.where.mockResolvedValueOnce([{ id: QUESTION_ID_1 }, { id: QUESTION_ID_2 }]);

        await addQuestionsToSession(SESSION_ID, TEST_USER_ID, questionIds);

        expect(mockDb.insert).toHaveBeenCalledTimes(1);
        expect(mockDb.values).toHaveBeenCalledWith([
            { reviewSessionId: SESSION_ID, questionId: QUESTION_ID_1 },
            { reviewSessionId: SESSION_ID, questionId: QUESTION_ID_2 },
        ]);
    });

    it("removeQuestionFromSession remove question", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: SESSION_ID, userId: TEST_USER_ID }]);
        mockDb.where.mockReturnValueOnce(mockDb);

        await removeQuestionFromSession(SESSION_ID, TEST_USER_ID, QUESTION_ID_1);

        expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });
});
