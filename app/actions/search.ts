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

    // First, get all folders for this company to check for locked parents
    const allCompanyFolders = await prisma.folders.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
    });

    // Helper to check if a folder or any of its parents are locked
    const isFolderAccessible = (folderId: string, depth = 0): boolean => {
      if (depth > 10) return false; // Prevent infinite recursion
      const folder = allCompanyFolders.find(f => f.id === folderId);
      if (!folder) return false;
      if (folder.isLocked) return false;
      if (folder.parentId) return isFolderAccessible(folder.parentId, depth + 1);
      return true;
    };

    const accessibleFolderIds = isAdmin 
      ? allCompanyFolders.map(f => f.id)
      : allCompanyFolders.filter(f => isFolderAccessible(f.id)).map(f => f.id);

    // Search all files in the company (including nested folders)
    const allFiles = accessibleFolderIds.length > 0 ? await prisma.files.findMany({
      where: {
        folderId: {
          in: accessibleFolderIds,
        },
        deletedAt: null,
      },
      include: {
        folders: {
          include: {
            companies: true,
          },
        },
        users: true,
      },
    }) : [];

    // Search all folders in the company
    const matchingFolders = allCompanyFolders.filter(f => {
      const isMatch = f.name.toLowerCase().includes(term);
      const isAccessible = isAdmin || accessibleFolderIds.includes(f.id);
      return isMatch && isAccessible;
    });

    // Filter files by search term
    const matchingFiles = allFiles.filter((file) =>
      file.name.toLowerCase().includes(term) ||
      (file.category && file.category.toLowerCase().includes(term))
    );

    // Build folder paths for context
    const folderPathMap = new Map<string, string[]>();
    const buildPath = (folderId: string | null, depth = 0): string[] => {
      if (!folderId || depth > 10) return [];
      if (folderPathMap.has(folderId)) return folderPathMap.get(folderId)!;
      
      const folder = allCompanyFolders.find(f => f.id === folderId);
      if (!folder) return [];
      
      const path = folder.parentId 
        ? [...buildPath(folder.parentId, depth + 1), folder.name]
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
