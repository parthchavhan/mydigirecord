'use server';

import  prisma  from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuth } from './auth';
import { UTApi } from 'uploadthing/server';

export async function createFolder(name: string, companyId: string, parentId: string | null = null) {
  try {
    const auth = await getAuth();
    // Set userId to null for admin users since they don't have a User record in the database
    const userId = auth?.role === 'admin' || auth?.userId === 'admin' ? null : (auth?.userId || null);
    const folder = await prisma.folder.create({
      data: {
        name,
        companyId,
        parentId,
        userId,
      },
      include: {
        children: true,
        files: true,
      },
    });
    revalidatePath('/admin/dashboard');
    revalidatePath('/user/dashboard');
    return { success: true, folder };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { success: false, error: 'Failed to create folder' };
  }
}

export async function getFolderById(id: string) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            children: true,
            files: true,
          },
        },
        files: true,
        parent: true,
      },
    });
    return { success: true, folder };
  } catch (error) {
    console.error('Error fetching folder:', error);
    return { success: false, error: 'Failed to fetch folder', folder: null };
  }
}

export async function getFoldersByCompany(companyId: string, parentId: string | null = null) {
  try {
    const folders = await prisma.folder.findMany({
      where: {
        companyId,
        parentId,
      },
      include: {
        children: true,
        files: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // Serialize dates to strings using JSON serialization (converts Date objects to ISO strings)
    const serializedFolders = JSON.parse(JSON.stringify(folders));
    return { success: true, folders: serializedFolders };
  } catch (error) {
    console.error('Error fetching folders:', error);
    return { success: false, error: 'Failed to fetch folders', folders: [] };
  }
}

export async function getFolderTree(companyId: string, folderId: string) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        children: {
          include: {
            children: true,
            files: true,
          },
        },
        files: true,
        parent: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!folder || folder.companyId !== companyId) {
      return { success: false, error: 'Folder not found', folder: null };
    }

    return { success: true, folder };
  } catch (error) {
    console.error('Error fetching folder tree:', error);
    return { success: false, error: 'Failed to fetch folder tree', folder: null };
  }
}

export async function deleteFolder(id: string) {
  try {
    // First, get all files in this folder and nested folders before deletion
    const getAllFilesInFolder = async (folderId: string): Promise<string[]> => {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: {
          files: {
            select: { key: true },
          },
          children: {
            select: { id: true },
          },
        },
      });

      if (!folder) return [];

      let fileKeys: string[] = folder.files
        .map((f: { key: string | null }) => f.key)
        .filter((key: string | null): key is string => key !== null);

      // Recursively get files from child folders
      for (const child of folder.children) {
        const childFiles = await getAllFilesInFolder(child.id);
        fileKeys = [...fileKeys, ...childFiles];
      }

      return fileKeys;
    };

    // Get all file keys before deletion
    const fileKeys = await getAllFilesInFolder(id);

    // Delete files from UploadThing if any exist
    if (fileKeys.length > 0) {
      try {
        const utapi = new UTApi();
        // Delete all files in parallel
        await Promise.all(
          fileKeys.map((key) => utapi.deleteFiles(key).catch((err) => {
            console.error(`Error deleting file ${key} from UploadThing:`, err);
            // Continue even if individual file deletion fails
          }))
        );
      } catch (uploadThingError) {
        console.error('Error deleting files from UploadThing:', uploadThingError);
        // Continue with folder deletion even if UploadThing deletion fails
      }
    }

    // Delete folder (this will cascade delete files from database)
    await prisma.folder.delete({
      where: { id },
    });
    revalidatePath('/admin/dashboard');
    revalidatePath('/user/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting folder:', error);
    return { success: false, error: 'Failed to delete folder' };
  }
}

export async function updateFolder(id: string, name: string) {
  try {
    const folder = await prisma.folder.update({
      where: { id },
      data: { name },
    });
    revalidatePath('/admin/dashboard');
    revalidatePath('/user/dashboard');
    return { success: true, folder };
  } catch (error) {
    console.error('Error updating folder:', error);
    return { success: false, error: 'Failed to update folder' };
  }
}

export async function getFolderStats(folderId: string) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        _count: {
          select: {
            children: true,
            files: true,
          },
        },
      },
    });

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    // Recursively count all nested folders and files
    const countRecursive = async (fId: string): Promise<{ folders: number; files: number }> => {
      const f = await prisma.folder.findUnique({
        where: { id: fId },
        include: {
          _count: {
            select: {
              children: true,
              files: true,
            },
          },
          children: {
            select: { id: true },
          },
        },
      });

      if (!f) return { folders: 0, files: 0 };

      let totalFolders = f._count.children;
      let totalFiles = f._count.files;

      for (const child of f.children) {
        const childCounts = await countRecursive(child.id);
        totalFolders += childCounts.folders + 1; // +1 for the child folder itself
        totalFiles += childCounts.files;
      }

      return { folders: totalFolders, files: totalFiles };
    };

    const counts = await countRecursive(folderId);

    return {
      success: true,
      stats: {
        folderCount: counts.folders,
        fileCount: counts.files,
        directFolderCount: folder._count.children,
        directFileCount: folder._count.files,
      },
    };
  } catch (error) {
    console.error('Error fetching folder stats:', error);
    return { success: false, error: 'Failed to fetch folder statistics' };
  }
}

