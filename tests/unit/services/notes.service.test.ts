import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockDb } from "../../mocks/db.mocks.js";
import {
    createNote,
    deleteNote,
    getNoteById,
    getNotesByQuestionId,
    getStandaloneNotes,
    updateNote,
} from "../../../src/services/notes.service.js";
import { NotFoundError } from "../../../src/errors/http.errors.js";

const mockDb = createMockDb();

vi.mock("@/db/index.js", () => ({
    get db() {
        return mockDb;
    },
}));

const TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const TEST_NOTE_ID = "223e4567-e89b-12d3-a456-426614174000";
const TEST_QUESTION_ID = "323e4567-e89b-12d3-a456-426614174000";

describe("Notes Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.where.mockReset();
        mockDb.where.mockResolvedValue([]);
        mockDb.insert.mockReturnValue(mockDb);
        mockDb.values.mockReturnValue(mockDb);
        mockDb.returning.mockResolvedValue([]);
        mockDb.update.mockReturnValue(mockDb);
        mockDb.set.mockReturnValue(mockDb);
        mockDb.delete.mockReturnValue(mockDb);
    });

    it("createNote cria nota standalone", async () => {
        mockDb.returning.mockResolvedValueOnce([
            {
                id: TEST_NOTE_ID,
                title: "Anotacao",
                content: "Conteudo",
                userId: TEST_USER_ID,
                questionId: null,
            },
        ]);

        const result = await createNote(TEST_USER_ID, {
            title: "Anotacao",
            content: "Conteudo",
        });

        expect(mockDb.values).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Anotacao",
                content: "Conteudo",
                userId: TEST_USER_ID,
                questionId: null,
            }),
        );
        expect(result[0].questionId).toBeNull();
    });

    it("createNote cria nota vinculada a question", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: TEST_QUESTION_ID, userId: TEST_USER_ID }]);
        mockDb.returning.mockResolvedValueOnce([
            {
                id: TEST_NOTE_ID,
                title: "Anotacao",
                content: "Conteudo",
                userId: TEST_USER_ID,
                questionId: TEST_QUESTION_ID,
            },
        ]);

        const result = await createNote(TEST_USER_ID, {
            title: "Anotacao",
            content: "Conteudo",
            questionId: TEST_QUESTION_ID,
        });

        expect(mockDb.where).toHaveBeenCalledTimes(1);
        expect(mockDb.values).toHaveBeenCalledWith(
            expect.objectContaining({
                questionId: TEST_QUESTION_ID,
                userId: TEST_USER_ID,
            }),
        );
        expect(result[0].questionId).toBe(TEST_QUESTION_ID);
    });

    it("createNote lança NotFoundError se question nao pertence ao user", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(
            createNote(TEST_USER_ID, {
                title: "Anotacao",
                content: "Conteudo",
                questionId: TEST_QUESTION_ID,
            }),
        ).rejects.toThrow(NotFoundError);

        expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it("getNotesByQuestionId retorna notas", async () => {
        const questionNotes = [
            {
                id: TEST_NOTE_ID,
                title: "Q note",
                content: "Question content",
                userId: TEST_USER_ID,
                questionId: TEST_QUESTION_ID,
            },
        ];
        mockDb.where.mockResolvedValueOnce(questionNotes);

        const result = await getNotesByQuestionId(TEST_QUESTION_ID, TEST_USER_ID);

        expect(result).toEqual(questionNotes);
        expect(mockDb.select).toHaveBeenCalledTimes(1);
        expect(mockDb.from).toHaveBeenCalledTimes(1);
        expect(mockDb.where).toHaveBeenCalledTimes(1);
    });

    it("getStandaloneNotes retorna notas sem question", async () => {
        const standaloneNotes = [
            {
                id: TEST_NOTE_ID,
                title: "Standalone",
                content: "Sem vinculacao",
                userId: TEST_USER_ID,
                questionId: null,
            },
        ];
        mockDb.where.mockResolvedValueOnce(standaloneNotes);

        const result = await getStandaloneNotes(TEST_USER_ID);

        expect(result).toEqual(standaloneNotes);
        expect(result[0].questionId).toBeNull();
        expect(mockDb.where).toHaveBeenCalledTimes(1);
    });

    it("getNoteById retorna nota", async () => {
        const note = {
            id: TEST_NOTE_ID,
            title: "Anotacao",
            content: "Conteudo",
            userId: TEST_USER_ID,
            questionId: null,
        };
        mockDb.where.mockResolvedValueOnce([note]);

        const result = await getNoteById(TEST_NOTE_ID, TEST_USER_ID);

        expect(result).toEqual(note);
        expect(mockDb.where).toHaveBeenCalledTimes(1);
    });

    it("getNoteById lança NotFoundError", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(getNoteById(TEST_NOTE_ID, TEST_USER_ID)).rejects.toThrow(NotFoundError);
    });

    it("updateNote atualiza titulo/conteudo com update parcial", async () => {
        mockDb.where.mockResolvedValueOnce([
            {
                id: TEST_NOTE_ID,
                title: "Titulo antigo",
                content: "Conteudo antigo",
                userId: TEST_USER_ID,
                questionId: null,
            },
        ]);
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.returning.mockResolvedValueOnce([
            {
                id: TEST_NOTE_ID,
                title: "Titulo novo",
                content: "Conteudo antigo",
                userId: TEST_USER_ID,
                questionId: null,
            },
        ]);

        const result = await updateNote(TEST_NOTE_ID, TEST_USER_ID, {
            title: "Titulo novo",
        });

        expect(mockDb.set).toHaveBeenCalledWith({
            title: "Titulo novo",
            updatedAt: expect.any(Date),
        });
        expect(result[0].title).toBe("Titulo novo");
    });

    it("updateNote lança NotFoundError", async () => {
        mockDb.where.mockResolvedValueOnce([]);

        await expect(
            updateNote(TEST_NOTE_ID, TEST_USER_ID, {
                title: "Atualizada",
            }),
        ).rejects.toThrow(NotFoundError);
    });

    it("deleteNote remove nota", async () => {
        mockDb.where.mockResolvedValueOnce([{ id: TEST_NOTE_ID, userId: TEST_USER_ID }]);

        await deleteNote(TEST_NOTE_ID, TEST_USER_ID);

        expect(mockDb.delete).toHaveBeenCalled();
    });
});
