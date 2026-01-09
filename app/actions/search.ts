'use server';

import prisma from '@/lib/prisma';
import { getAuth } from './auth';

export async function globalSearch(companyId: string, searchTerm: string) {
  try {
    const auth = await getAuth();
    if (!auth || !auth.companyId || auth.companyId !== companyId) {
      return { success: false, error: 'Unauthorized', results: [] };
    }

    if (!searchTerm || searchTerm.trim().length === 0) {
      return { success: true, results: [] };
    }

    const term = searchTerm.toLowerCase().trim();

    // Check if user is admin
    const isAdmin = auth?.role === 'admin' || auth?.userId === 'admin' || 
      (auth?.userId && auth.userId !== 'admin' ? (await prisma.users.findUnique({ where: { id: auth.userId } }))?.role === 'admin' || (await prisma.users.findUnique({ where: { id: auth.userId } }))?.role === 'super_admin' : false);

    const fileWhere: any = {
      folders: {
        companyId,
        deletedAt: null,
      },
      deletedAt: null,
    };

    const folderWhere: any = {
      companyId,
      deletedAt: null,
    };

    // If not admin, exclude locked folders and files in locked folders
    if (!isAdmin) {
      fileWhere.folders.isLocked = false;
      folderWhere.isLocked = false;
    }

    // Search all files in the company (including nested folders)
    const allFiles = await prisma.files.findMany({
      where: fileWhere,
      include: {
        folders: {
          include: {
            companies: true,
          },
        },
        users: true,
      },
    });

    // Search all folders in the company
    const allFolders = await prisma.folders.findMany({
      where: folderWhere,
      include: {
        companies: true,
        folders: true, // parent folder
      },
    });

    // Filter files by search term
    const matchingFiles = allFiles.filter((file) =>
      file.name.toLowerCase().includes(term) ||
      (file.category && file.category.toLowerCase().includes(term))
    );

    // Filter folders by search term
    const matchingFolders = allFolders.filter((folder) =>
      folder.name.toLowerCase().includes(term)
    );

    // Build folder paths for context
    const folderPathMap = new Map<string, string[]>();
    const buildPath = (folderId: string | null): string[] => {
      if (!folderId) return [];
      if (folderPathMap.has(folderId)) return folderPathMap.get(folderId)!;
      
      const folder = allFolders.find(f => f.id === folderId);
      if (!folder) return [];
      
      const path = folder.parentId 
        ? [...buildPath(folder.parentId), folder.name]
        : [folder.name];
      folderPathMap.set(folderId, path);
      return path;
    };

    const results = [
      ...matchingFiles.map((file) => ({
        type: 'file' as const,
        id: file.id,
        name: file.name,
        path: buildPath(file.folderId),
        folderId: file.folderId,
        category: file.category,
        createdAt: file.createdAt,
        data: file,
      })),
      ...matchingFolders.map((folder) => ({
        type: 'folder' as const,
        id: folder.id,
        name: folder.name,
        path: buildPath(folder.parentId),
        folderId: folder.parentId,
        createdAt: folder.createdAt,
        data: folder,
      })),
    ];

    return { success: true, results };
  } catch (error) {
    console.error('Error in global search:', error);
    return { success: false, error: 'Failed to search', results: [] };
  }
}
