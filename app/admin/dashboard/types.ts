export interface Company {
  id: string;
  name: string;
  type?: string | null;
  folders: Folder[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  companyId: string;
  parentId?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: string;
  name: string;
  folderId: string;
  userId?: string | null;
  size: number;
  url?: string | null;
  key?: string | null;
  mimeType?: string | null;
  category?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  renewalDate?: string | null;
  placeOfIssue?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: string;
    name: string;
    company?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    name: string;
  };
}

export interface FolderStats {
  folderCount: number;
  fileCount: number;
  directFolderCount: number;
  directFileCount: number;
}


