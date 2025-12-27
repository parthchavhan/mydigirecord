'use server';

import  prisma  from '@/lib/prisma';
import { getAuth } from './auth';

export async function getUserDashboardData() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'user' || !auth.companyId) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    const company = await prisma.companies.findUnique({
      where: { id: auth.companyId },
      include: {
        folders: {
          where: {
            parentId: null,
          },
          include: {
            other_folders: {
              include: {
                other_folders: true,
                files: true,
              },
            },
            files: true,
          },
        },
      },
    });

    if (!company) {
      return { success: false, error: 'Company not found', data: null };
    }

    return { success: true, data: company };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { success: false, error: 'Failed to fetch data', data: null };
  }
}

export async function getFolderWithChildren(folderId: string, companyId: string) {
  try {
    const folder = await prisma.folders.findFirst({
      where: {
        id: folderId,
        companyId,
      },
      include: {
        other_folders: {
          include: {
            other_folders: true,
            files: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        files: {
          where: {
            deletedAt: null,
          },
        },
        folders: {
          include: {
            folders: true,
          },
        },
      },
    });

    if (!folder) {
      return { success: false, error: 'Folder not found', folder: null };
    }

    return { success: true, folder };
  } catch (error) {
    console.error('Error fetching folder:', error);
    return { success: false, error: 'Failed to fetch folder', folder: null };
  }
}

