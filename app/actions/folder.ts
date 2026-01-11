'use server';

import  prisma  from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuth } from './auth';
import { UTApi } from 'uploadthing/server';
import { createAuditLog } from './audit';

export async function createFolder(name: string, companyId: string, parentId: string | null = null, isLocked: boolean = false, password?: string) {
  try {
    const auth = await getAuth();
    if (!auth || !auth.companyId || auth.companyId !== companyId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Set userId to null for admin users since they don't have a User record in the database
    const userId = auth?.role === 'admin' || auth?.userId === 'admin' ? null : (auth?.userId || null);
    const folder = await prisma.folders.create({
      data: {
        id: crypto.randomUUID(),
        name,
        companyId,
        parentId,
        userId,
        isLocked: isLocked || false,
        password: password || null,
        updatedAt: new Date(),
      },
      include: {
        other_folders: true,
        files: true,
      },
    });

    await createAuditLog('create', 'folder', folder.id, folder.name, { parentId, isLocked });

    revalidatePath('/admin/dashboard');
    revalidatePath('/user/dashboard');
    return { success: true, folder };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { success: false, error: 'Failed to create folder' };
  }
}

export async function lockFolder(folderId: string, password: string) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only admins can lock folders
    // Allow main admin account (userId === 'admin') or users with admin/super_admin role
    if (auth.userId !== 'admin') {
      if (auth.role !== 'admin' && auth.role !== 'super_admin') {
        const user = await prisma.users.findUnique({
          where: { id: auth.userId },
        });
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
          return { success: false, error: 'Only admins can lock folders' };
        }
      }
    }

    const folder = await prisma.folders.update({
      where: { id: folderId },
      data: {
        isLocked: true,
        password,
        updatedAt: new Date(),
      },
    });

    await createAuditLog('update', 'folder', folder.id, folder.name, { action: 'lock' });

    revalidatePath('/admin/dashboard');
    revalidatePath('/user/dashboard');
    return { success: true, folder };
  } catch (error) {
    console.error('Error locking folder:', error);
    return { success: false, error: 'Failed to lock folder' };
  }
}

export async function unlockFolder(folderId: string, password: string) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return { success: false, error: 'Unauthorized' };
    }

    const folder = await prisma.folders.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    if (!folder.isLocked) {
      return { success: false, error: 'Folder is not locked' };
    }

    if (folder.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    // Only admins can unlock folders
    // Allow main admin account (userId === 'admin') or users with admin/super_admin role
    if (auth.userId !== 'admin') {
      if (auth.role !== 'admin' && auth.role !== 'super_admin') {
        const user = await prisma.users.findUnique({
          where: { id: auth.userId },
        });
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
          return { success: false, error: 'Only admins can unlock folders' };
        }
      }
    }

    const updatedFolder = await prisma.folders.update({
      where: { id: folderId },
      data: {
        isLocked: false,
        // Keep password when unlocking so it can be displayed with show/hide toggle
        updatedAt: new Date(),
      },
    });

    await createAuditLog('update', 'folder', folder.id, folder.name, { action: 'unlock' });

    revalidatePath('/admin/dashboard');
    revalidatePath('/user/dashboard');
    return { success: true, folder: updatedFolder };
  } catch (error) {
    console.error('Error unlocking folder:', error);
    return { success: false, error: 'Failed to unlock folder' };
  }
}

export async function verifyFolderPassword(folderId: string, password: string) {
  try {
    const folder = await prisma.folders.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    if (!folder.isLocked) {
      return { success: true, verified: true };
    }

    if (folder.password === password) {
      return { success: true, verified: true };
    }

    return { success: true, verified: false };
  } catch (error) {
    console.error('Error verifying folder password:', error);
    return { success: false, error: 'Failed to verify password' };
  }
}

export async function getFolderById(id: string) {
  try {
    const folder = await prisma.folders.findUnique({
      where: { id },
      include: {
        other_folders: {
          include: {
            other_folders: true,
            files: true,
          },
        },
        files: true,
        folders: true,
      },
    });
    return { success: true, folder };
  } catch (error) {
    console.error('Error fetching folder:', error);
    return { success: false, error: 'Failed to fetch folder', folder: null };
  }
}

export async function getFoldersByCompany(companyId: string, parentId: string | null = null, includeLocked: boolean = false) {
  try {
    const auth = await getAuth();
    const isAdmin = auth?.role === 'admin' || auth?.userId === 'admin' || 
      (auth?.userId && auth.userId !== 'admin' ? (await prisma.users.findUnique({ where: { id: auth.userId } }))?.role === 'admin' || (await prisma.users.findUnique({ where: { id: auth.userId } }))?.role === 'super_admin' : false);

    const where: any = {
      companyId,
      parentId,
      deletedAt: null,
    };

    // If not admin and not including locked, exclude locked folders
    if (!isAdmin && !includeLocked) {
      where.isLocked = false;
    }

    const folders = await prisma.folders.findMany({
      where,
      include: {
        other_folders: true,
        files: {
          where: {
            deletedAt: null,
          },
        },
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

export async function getAllFoldersFlat(companyId: string) {
  try {
    const auth = await getAuth();
    if (!auth || !auth.companyId || auth.companyId !== companyId) {
      return { success: false, error: 'Unauthorized' };
    }

    const folders = await prisma.folders.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return { success: true, folders: JSON.parse(JSON.stringify(folders)) };
  } catch (error) {
    console.error('Error fetching all folders flat:', error);
    return { success: false, error: 'Failed to fetch folders' };
  }
}

export async function getFolderTree(companyId: string, folderId: string) {
  try {
    const folder = await prisma.folders.findUnique({
      where: { id: folderId },
      include: {
        other_folders: {
          include: {
            other_folders: true,
            files: true,
          },
        },
        files: true,
        folders: {
          include: {
            folders: true,
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
    const auth = await getAuth();
    const folder = await prisma.folders.findUnique({
      where: { id },
    });

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    await createAuditLog('delete', 'folder', folder.id, folder.name);
    // First, get all files in this folder and nested folders before deletion
    const getAllFilesInFolder = async (folderId: string): Promise<string[]> => {
      const folder = await prisma.folders.findUnique({
        where: { id: folderId },
        include: {
          files: {
            select: { key: true },
          },
          other_folders: {
            select: { id: true },
          },
        },
      });

      if (!folder) return [];

      let fileKeys: string[] = folder.files
        .map((f: { key: string | null }) => f.key)
        .filter((key: string | null): key is string => key !== null);

      // Recursively get files from child folders
      for (const child of folder.other_folders) {
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
    await prisma.folders.delete({
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
    const folder = await prisma.folders.update({
      where: { id },
      data: { name, updatedAt: new Date() },
    });
    await createAuditLog('update', 'folder', folder.id, folder.name, { action: 'rename' });
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
    const folder = await prisma.folders.findUnique({
      where: { id: folderId },
      include: {
        _count: {
          select: {
            other_folders: true,
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
      const f = await prisma.folders.findUnique({
        where: { id: fId },
        include: {
          _count: {
            select: {
              other_folders: true,
              files: true,
            },
          },
          other_folders: {
            select: { id: true },
          },
        },
      });

      if (!f) return { folders: 0, files: 0 };

      let totalFolders = f._count.other_folders;
      let totalFiles = f._count.files;

      for (const child of f.other_folders) {
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
        directFolderCount: folder._count.other_folders,
        directFileCount: folder._count.files,
      },
    };
  } catch (error) {
    console.error('Error fetching folder stats:', error);
    return { success: false, error: 'Failed to fetch folder statistics' };
  }
}

export async function getLockedFolders(companyId: string) {
  try {
    const folders = await prisma.folders.findMany({
      where: {
        companyId,
        isLocked: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        isLocked: true,
        createdAt: true,
      },
    });
    return { success: true, folders };
  } catch (error) {
    console.error('Error fetching locked folders:', error);
    return { success: false, error: 'Failed to fetch locked folders', folders: [] };
  }
}