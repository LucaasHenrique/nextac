export interface Folder {
    id: string;
    name: string;
    userId: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateFolderBody {
    name: string;
    parentId?: string | null;
}

export interface UpdateFolderBody {
    name?: string;
    parentId?: string | null;
}

export interface FolderWithChildren extends Folder {
    children?: Folder[];
}

export interface FolderResponse extends Folder {
    childrenCount?: number;
}
