'use server';

import  prisma  from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuth } from './auth';
import { UTApi } from 'uploadthing/server';

export async function createFile(
  name: string,
  folderId: string,
  url: string,
  key: string,
  size: number,
  mimeType?: string,
  category?: string,
  issueDate?: string,
  expiryDate?: string,
  renewalDate?: string,
  placeOfIssue?: string
) {
  try {
    const auth = await getAuth();
    const file = await prisma.file.create({
      data: {
        name,
        folderId,
        userId: auth?.userId || null,
        url,
        key,
        size,
        mimeType: mimeType || null,
        category: category || null,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        placeOfIssue: placeOfIssue || null,
      },
    });
    revalidatePath('/user/dashboard');
    revalidatePath('/admin/dashboard');
    return { success: true, file };
  } catch (error) {
    console.error('Error creating file:', error);
    return { success: false, error: 'Failed to create file' };
  }
}

export async function getFilesByFolder(folderId: string) {
  try {
    const files = await prisma.file.findMany({
      where: { 
        folderId,
        deletedAt: null, // Exclude deleted files
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, files };
  } catch (error) {
    console.error('Error fetching files:', error);
    return { success: false, error: 'Failed to fetch files', files: [] };
  }
}

export async function deleteFile(id: string, permanent: boolean = false) {
  try {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return { success: false, error: 'File not found' };
    }

    if (permanent) {
      // Permanent delete - remove from UploadThing and database
      if (file.key) {
        try {
          const utapi = new UTApi();
          await utapi.deleteFiles(file.key);
        } catch (uploadThingError) {
          console.error('Error deleting file from UploadThing:', uploadThingError);
        }
      }

      await prisma.file.delete({
        where: { id },
      });
    } else {
      // Soft delete - just mark as deleted
      await prisma.file.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    revalidatePath('/user/dashboard');
    revalidatePath('/admin/dashboard');
    revalidatePath('/user/bin');
    revalidatePath('/admin/bin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: 'Failed to delete file' };
  }
}

export async function restoreFile(id: string) {
  try {
    await prisma.file.update({
      where: { id },
      data: { deletedAt: null },
    });
    revalidatePath('/user/dashboard');
    revalidatePath('/admin/dashboard');
    revalidatePath('/user/bin');
    revalidatePath('/admin/bin');
    return { success: true };
  } catch (error) {
    console.error('Error restoring file:', error);
    return { success: false, error: 'Failed to restore file' };
  }
}

export async function copyFile(id: string, targetFolderId: string) {
  try {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return { success: false, error: 'File not found' };
    }

    const auth = await getAuth();
    const newFile = await prisma.file.create({
      data: {
        name: `${file.name} (Copy)`,
        folderId: targetFolderId,
        userId: auth?.userId || null,
        url: file.url,
        key: file.key,
        size: file.size,
        mimeType: file.mimeType,
        category: file.category,
        issueDate: file.issueDate,
        expiryDate: file.expiryDate,
        renewalDate: file.renewalDate,
        placeOfIssue: file.placeOfIssue,
      },
    });

    revalidatePath('/user/dashboard');
    revalidatePath('/admin/dashboard');
    return { success: true, file: newFile };
  } catch (error) {
    console.error('Error copying file:', error);
    return { success: false, error: 'Failed to copy file' };
  }
}

export async function getDeletedFiles(companyId?: string) {
  try {
    const where: any = {
      deletedAt: { not: null },
    };

    if (companyId) {
      where.folder = {
        companyId,
      };
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        folder: {
          include: {
            company: true,
          },
        },
        user: true,
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });
    return { success: true, files };
  } catch (error) {
    console.error('Error fetching deleted files:', error);
    return { success: false, error: 'Failed to fetch deleted files', files: [] };
  }
}

export async function permanentlyDeleteOldFiles() {
  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const oldDeletedFiles = await prisma.file.findMany({
      where: {
        deletedAt: {
          lte: fiveDaysAgo,
        },
      },
    });

    const utapi = new UTApi();
    let deletedCount = 0;

    for (const file of oldDeletedFiles) {
      if (file.key) {
        try {
          await utapi.deleteFiles(file.key);
        } catch (error) {
          console.error(`Error deleting file ${file.id} from UploadThing:`, error);
        }
      }

      await prisma.file.delete({
        where: { id: file.id },
      });
      deletedCount++;
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error('Error permanently deleting old files:', error);
    return { success: false, error: 'Failed to permanently delete old files' };
  }
}

export async function updateFile(id: string, name: string) {
  try {
    const file = await prisma.file.update({
      where: { id },
      data: { name },
    });
    revalidatePath('/user/dashboard');
    revalidatePath('/admin/dashboard');
    return { success: true, file };
  } catch (error) {
    console.error('Error updating file:', error);
    return { success: false, error: 'Failed to update file' };
  }
}

export async function updateFileDetails(
  id: string,
  data: {
    name?: string;
    folderId?: string;
    category?: string;
    issueDate?: string;
    expiryDate?: string;
    renewalDate?: string;
    placeOfIssue?: string;
  }
) {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.folderId !== undefined) updateData.folderId = data.folderId;
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.issueDate !== undefined) updateData.issueDate = data.issueDate ? new Date(data.issueDate) : null;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    if (data.renewalDate !== undefined) updateData.renewalDate = data.renewalDate ? new Date(data.renewalDate) : null;
    if (data.placeOfIssue !== undefined) updateData.placeOfIssue = data.placeOfIssue || null;

    const file = await prisma.file.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/user/dashboard');
    revalidatePath('/admin/dashboard');
    return { success: true, file };
  } catch (error) {
    console.error('Error updating file details:', error);
    return { success: false, error: 'Failed to update file details' };
  }
}

export async function getFileById(id: string) {
  try {
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        folder: {
          include: {
            company: true,
          },
        },
        user: true,
      },
    });
    return { success: true, file };
  } catch (error) {
    console.error('Error fetching file:', error);
    return { success: false, error: 'Failed to fetch file' };
  }
}

export async function getAllFiles() {
  try {
    const files = await prisma.file.findMany({
      include: {
        folder: {
          include: {
            company: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, files };
  } catch (error) {
    console.error('Error fetching files:', error);
    return { success: false, error: 'Failed to fetch files', files: [] };
  }
}

export async function getFilesByCompany(companyId: string) {
  try {
    const files = await prisma.file.findMany({
      where: {
        folder: {
          companyId,
        },
        deletedAt: null, // Exclude deleted files
      },
      include: {
        folder: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, files };
  } catch (error) {
    console.error('Error fetching files by company:', error);
    return { success: false, error: 'Failed to fetch files', files: [] };
  }
}

