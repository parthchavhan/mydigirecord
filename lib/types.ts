export interface File {
  id: string;
  name: string;
  type: 'file';
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  type: 'folder';
  parentId: string | null;
  children: (File | Folder)[];
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  folders: Folder[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  companyId: string;
  name: string;
}

export interface AuthToken {
  userId: string;
  role: 'admin' | 'user';
  companyId?: string;
  expiresAt: number;
}

