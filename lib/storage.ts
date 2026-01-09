import { Company, Folder, File, User, AuthToken } from './types';

const COMPANIES_KEY = 'mendorabox_companies';
const USERS_KEY = 'mendorabox_users';
const AUTH_KEY = 'mendorabox_auth';

export const storage = {
  // Companies
  getCompanies(): Company[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COMPANIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCompanies(companies: Company[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
  },

  getCompany(id: string): Company | null {
    const companies = this.getCompanies();
    return companies.find(c => c.id === id) || null;
  },

  addCompany(company: Company): void {
    const companies = this.getCompanies();
    companies.push(company);
    this.saveCompanies(companies);
  },

  updateCompany(companyId: string, updater: (company: Company) => Company): void {
    const companies = this.getCompanies();
    const index = companies.findIndex(c => c.id === companyId);
    if (index !== -1) {
      companies[index] = updater(companies[index]);
      this.saveCompanies(companies);
    }
  },

  // Users
  getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUserByCompany(companyId: string): User[] {
    return this.getUsers().filter(u => u.companyId === companyId);
  },

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  },

  getUserByEmailAndCompany(email: string, companyId: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email && u.companyId === companyId) || null;
  },

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  },

  // Auth
  setAuth(token: AuthToken): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_KEY, JSON.stringify(token));
  },

  getAuth(): AuthToken | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    const token = JSON.parse(data);
    if (token.expiresAt < Date.now()) {
      this.clearAuth();
      return null;
    }
    return token;
  },

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_KEY);
  },

  // Folder operations
  findFolder(company: Company, folderId: string): Folder | null {
    const findInFolders = (folders: Folder[]): Folder | null => {
      for (const folder of folders) {
        if (folder.id === folderId) return folder;
        const found = findInFolders(folder.children.filter(c => c.type === 'folder') as Folder[]);
        if (found) return found;
      }
      return null;
    };
    return findInFolders(company.folders);
  },

  addFolderToParent(companyId: string, parentId: string | null, folder: Folder): void {
    this.updateCompany(companyId, (company) => {
      if (parentId === null) {
        company.folders.push(folder);
      } else {
        const parent = this.findFolder(company, parentId);
        if (parent) {
          parent.children.push(folder);
        }
      }
      return company;
    });
  },

  addFileToFolder(companyId: string, folderId: string, file: File): void {
    this.updateCompany(companyId, (company) => {
      const folder = this.findFolder(company, folderId);
      if (folder) {
        folder.children.push(file);
      }
      return company;
    });
  },
};

