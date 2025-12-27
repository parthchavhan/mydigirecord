'use server';

import  prisma  from '@/lib/prisma';
import { getAuth } from './auth';

export async function getUserDashboardData() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'user' || !auth.companyId) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    const company = await prisma.company.findUnique({
      where: { id: auth.companyId },
      include: {
        folders: {
          where: {
            parentId: null,
          },
          include: {
            children: {
              include: {
                children: true,
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
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        companyId,
      },
      include: {
        children: {
          include: {
            children: true,
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
        parent: {
          include: {
            parent: true,
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

