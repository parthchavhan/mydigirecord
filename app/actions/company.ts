'use server';

import fs from 'fs';
import path from 'path';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UTApi } from 'uploadthing/server';

const TEMPLATE_FOLDER_NAME = 'Template';

type TemplateFileEntry = { name: string; key: string | null; url: string | null; size: number };

function getTemplateEntries(): TemplateFileEntry[] {
  const templatePath = path.join(process.cwd(), 'public', 'template.json');
  try {
    const raw = fs.readFileSync(templatePath, 'utf-8');
    const data = JSON.parse(raw) as TemplateFileEntry[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getTemplateFileKeys(): Set<string> {
  const entries = getTemplateEntries();
  const keys = new Set<string>();
  for (const e of entries) {
    if (e.key) keys.add(e.key);
  }
  return keys;
}

// Define folder structures for each company type
const UNIVERSITY_FOLDERS = [
  'Student Records',
  'Faculty & Staff Records',
  'Examination Records',
  'Academic & Curriculum',
  'Research & Innovation',
  'Governance & Compliance',
  'Infrastructure & Assets',
  'Financial Records',
  'Emergency & Legal',
  'Communication & Outreach',
];

const COLLEGE_FOLDERS = [
  'Student Records',
  'Faculty & Staff Records',
  'Academic & Curriculum',
  'Compliance & Accreditation',
  'Infrastructure & Assets',
  'Financial Records',
  'Communication & Outreach',
];

const SCHOOL_FOLDERS = [
  'Student Records',
  'Staff Records',
  'Compliance & Governance',
  'Academic & Curriculum',
  'Infrastructure & Assets',
  'Financial Records',
];

async function createDefaultFolders(companyId: string, companyType: string) {
  let foldersToCreate: string[] = [];

  if (companyType === 'university') {
    foldersToCreate = UNIVERSITY_FOLDERS;
  } else if (companyType === 'college') {
    foldersToCreate = COLLEGE_FOLDERS;
  } else if (companyType === 'school') {
    foldersToCreate = SCHOOL_FOLDERS;
  }
  // For 'other', no default folders are created

  // Create all folders for the company directly using Prisma
  // Skip audit logs for system-created folders during company setup
  for (const folderName of foldersToCreate) {
    try {
      await prisma.folders.create({
        data: {
          id: crypto.randomUUID(),
          name: folderName,
          companyId,
          parentId: null,
          userId: null, // Created by system during company setup
          isLocked: false,
          password: null,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error creating folder ${folderName}:`, error);
      // Continue creating other folders even if one fails
    }
  }
}

async function createTemplateFolderWithFiles(companyId: string) {
  const templateFolderId = crypto.randomUUID();
  await prisma.folders.create({
    data: {
      id: templateFolderId,
      name: TEMPLATE_FOLDER_NAME,
      companyId,
      parentId: null,
      userId: null,
      isLocked: false,
      password: null,
      updatedAt: new Date(),
    },
  });

  const entries = getTemplateEntries();
  const now = new Date();
  for (const entry of entries) {
    try {
      await prisma.files.create({
        data: {
          id: crypto.randomUUID(),
          name: entry.name,
          folderId: templateFolderId,
          key: entry.key ?? undefined,
          url: entry.url ?? undefined,
          size: entry.size ?? 0,
          userId: null,
          updatedAt: now,
        },
      });
    } catch (error) {
      console.error(`Error creating template file ${entry.name}:`, error);
    }
  }
}

export async function createCompany(name: string, type?: string) {
  try {
    // Validate input
    if (!name || !name.trim()) {
      return { success: false, error: 'Company name is required' };
    }

    // Validate type if provided
    if (type && !['school', 'college', 'university', 'other'].includes(type)) {
      return { success: false, error: 'Invalid company type' };
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
        type: type || null,
        updatedAt: new Date(),
      },
    });

    // Create default folders and Template folder (with template files) for school/college/university
    if (type && (type === 'university' || type === 'college' || type === 'school')) {
      await createDefaultFolders(company.id, type);
      await createTemplateFolderWithFiles(company.id);
    }

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

    // Get all file keys before deletion (exclude shared template keys - do not delete from UploadThing)
    const allFileKeys = await getAllFilesInCompany(id);
    const templateKeys = getTemplateFileKeys();
    const fileKeysToDelete = allFileKeys.filter((key) => !templateKeys.has(key));

    if (fileKeysToDelete.length > 0) {
      try {
        const utapi = new UTApi();
        await Promise.all(
          fileKeysToDelete.map((key) => utapi.deleteFiles(key).catch((err) => {
            console.error(`Error deleting file ${key} from UploadThing:`, err);
          }))
        );
      } catch (uploadThingError) {
        console.error('Error deleting files from UploadThing:', uploadThingError);
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

