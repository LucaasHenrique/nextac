import { db } from "@/db/index.js";
import { eq, and, isNull } from "drizzle-orm";
import { folder } from "@/db/schema.js";
import { NotFoundError, BadRequestError, ConflictError } from "@/errors/http.errors.js";
import type { CreateFolderBody, UpdateFolderBody } from "@/types/folder.types.js";

export const createFolder = async (userId: string, data: CreateFolderBody) => {
    if (data.parentId) {
        const parentFolder = await db
            .select()
            .from(folder)
            .where(and(eq(folder.id, data.parentId), eq(folder.userId, userId)));

        if (parentFolder.length === 0) {
            throw new NotFoundError("Parent folder not found");
        }
    }

    if (data.parentId) {
        const existing = await db
            .select()
            .from(folder)
            .where(and(eq(folder.name, data.name), eq(folder.userId, userId), eq(folder.parentId, data.parentId)));

        if (existing.length > 0) {
            throw new ConflictError("Folder with this name already exists in this parent folder");
        }
    } else {
        const existing = await db
            .select()
            .from(folder)
            .where(and(eq(folder.name, data.name), eq(folder.userId, userId), isNull(folder.parentId)));

        if (existing.length > 0) {
            throw new ConflictError("Folder with this name already exists in root");
        }
    }

    const createdFolder = await db
        .insert(folder)
        .values({
            name: data.name,
            userId,
            parentId: data.parentId ?? null,
        })
        .returning();

    return createdFolder[0];
};

export const getFolders = async (userId: string, parentId?: string) => {
    if (parentId) {
        return db
            .select()
            .from(folder)
            .where(and(eq(folder.userId, userId), eq(folder.parentId, parentId)));
    }

    return db
        .select()
        .from(folder)
        .where(and(eq(folder.userId, userId), isNull(folder.parentId)));
};

export const getFolderById = async (folderId: string, userId: string) => {
    const selectedFolder = await db
        .select()
        .from(folder)
        .where(and(eq(folder.id, folderId), eq(folder.userId, userId)));

    if (selectedFolder.length === 0) {
        throw new NotFoundError("Folder not found");
    }

    return selectedFolder[0];
};

export const updateFolder = async (folderId: string, userId: string, data: UpdateFolderBody) => {
    const existingFolder = await db
        .select()
        .from(folder)
        .where(and(eq(folder.id, folderId), eq(folder.userId, userId)));

    if (existingFolder.length === 0) {
        throw new NotFoundError("Folder not found");
    }

    if (data.parentId) {
        const parentFolder = await db
            .select()
            .from(folder)
            .where(and(eq(folder.id, data.parentId), eq(folder.userId, userId)));

        if (parentFolder.length === 0) {
            throw new NotFoundError("Parent folder not found");
        }

        if (data.parentId === folderId) {
            throw new BadRequestError("Folder cannot be its own parent");
        }
    }

    const nextName = data.name ?? existingFolder[0].name;
    const nextParentId = data.parentId === undefined ? existingFolder[0].parentId : data.parentId;

    let duplicate: typeof existingFolder;

    if (nextParentId) {
        duplicate = await db
            .select()
            .from(folder)
            .where(and(eq(folder.name, nextName), eq(folder.userId, userId), eq(folder.parentId, nextParentId)));
    } else {
        duplicate = await db
            .select()
            .from(folder)
            .where(and(eq(folder.name, nextName), eq(folder.userId, userId), isNull(folder.parentId)));
    }

    const duplicatedByAnotherFolder = duplicate.some((item) => item.id !== folderId);

    if (duplicatedByAnotherFolder) {
        throw new ConflictError("Folder with this name already exists in this location");
    }

    const updated = await db
        .update(folder)
        .set({
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
            updatedAt: new Date(),
        })
        .where(and(eq(folder.id, folderId), eq(folder.userId, userId)))
        .returning();

    return updated[0];
};

export const deleteFolderRecursively = async (folderId: string, userId: string) => {
    const subfolders = await db
        .select()
        .from(folder)
        .where(and(eq(folder.userId, userId), eq(folder.parentId, folderId)));

    for (const subfolder of subfolders) {
        await deleteFolderRecursively(subfolder.id, userId);
    }

    await db.delete(folder).where(and(eq(folder.id, folderId), eq(folder.userId, userId)));
};

export const deleteFolder = async (folderId: string, userId: string) => {
    const existingFolder = await db
        .select()
        .from(folder)
        .where(and(eq(folder.id, folderId), eq(folder.userId, userId)));

    if (existingFolder.length === 0) {
        throw new NotFoundError("Folder not found");
    }

    await deleteFolderRecursively(folderId, userId);
};



