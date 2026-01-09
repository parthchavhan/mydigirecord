'use server';

import  prisma  from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UTApi } from 'uploadthing/server';

export async function createCompany(name: string) {
  try {
    // Validate input
    if (!name || !name.trim()) {
      return { success: false, error: 'Company name is required' };
    }

    // Check if company with same name already exists
    const existingCompany = await prisma.companies.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingCompany) {
      return { success: false, error: 'A company with this name already exists' };
    }

    const company = await prisma.companies.create({
      data: {
        id: crypto.randomUUID(),
        name: name.trim(),
        updatedAt: new Date(),
      },
    });
    
    revalidatePath('/admin/dashboard');
    return { success: true, company };
  } catch (error: any) {
    console.error('Error creating company:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      return { success: false, error: 'A company with this name already exists' };
    }
    
    if (error.message) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to create company. Please try again.' };
  }
}

export async function getCompanies() {
  try {
    const companies = await prisma.companies.findMany({
      include: {
        folders: {
          where: {
            parentId: null,
          },
        },
        _count: {
          select: {
            users: true,
            folders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, companies };
  } catch (error) {
    console.error('Error fetching companies:', error);
    return { success: false, error: 'Failed to fetch companies', companies: [] };
  }
}

export async function getCompany(id: string) {
  try {
    const company = await prisma.companies.findUnique({
      where: { id },
      include: {
        folders: {
          where: {
            parentId: null,
            deletedAt: null,
          },
          include: {
            other_folders: {
              where: {
                deletedAt: null,
              },
            },
            files: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
    
    // Ensure locked folders are visible to all users (they need to see them to try accessing)
    // The isLocked field is included by default in Prisma queries
    return { success: true, company };
  } catch (error) {
    console.error('Error fetching company:', error);
    return { success: false, error: 'Failed to fetch company', company: null };
  }
}

export async function deleteCompany(id: string) {
  try {
    // Get all files in all folders of this company before deletion
    const getAllFilesInCompany = async (companyId: string): Promise<string[]> => {
      const folders = await prisma.folders.findMany({
        where: { companyId },
        include: {
          files: {
            select: { key: true },
          },
        },
      });

      let fileKeys: string[] = [];
      
      // Recursively get all files from all folders
      const getFilesFromFolder = async (folderId: string): Promise<string[]> => {
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

        let keys: string[] = folder.files
          .map((f: { key: string | null }) => f.key)
          .filter((key: string | null): key is string => key !== null);

        // Recursively get files from child folders
        for (const child of folder.other_folders) {
          const childFiles = await getFilesFromFolder(child.id);
          keys = [...keys, ...childFiles];
        }

        return keys;
      };

      for (const folder of folders) {
        const folderFiles = await getFilesFromFolder(folder.id);
        fileKeys = [...fileKeys, ...folderFiles];
      }

      return fileKeys;
    };

    // Get all file keys before deletion
    const fileKeys = await getAllFilesInCompany(id);

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
        // Continue with company deletion even if UploadThing deletion fails
      }
    }

    // Delete company (this will cascade delete folders and files from database)
    await prisma.companies.delete({
      where: { id },
    });
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting company:', error);
    return { success: false, error: 'Failed to delete company' };
  }
}

