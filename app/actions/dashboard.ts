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

export async function getFolderWithChildren(folderId: string, companyId: string, password?: string) {
  try {
    // First, get folder metadata and nested folders (always visible)
    const folderWithNested = await prisma.folders.findFirst({
      where: {
        id: folderId,
        companyId,
      },
      include: {
        other_folders: {
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

    if (!folderWithNested) {
      return { success: false, error: 'Folder not found', folder: null };
    }

    // Check if folder is locked - require password verification for contents
    if (folderWithNested.isLocked) {
      // Check if user is admin (admins can bypass password check)
      const auth = await getAuth();
      const isAdmin = auth?.role === 'admin' || auth?.userId === 'admin' || 
        (auth?.userId && auth.userId !== 'admin' ? (await prisma.users.findUnique({ where: { id: auth.userId } }))?.role === 'admin' || (await prisma.users.findUnique({ where: { id: auth.userId } }))?.role === 'super_admin' : false);
      
      // If not admin, require password to access contents
      if (!isAdmin) {
        if (!password) {
          // Return folder structure with nested folders visible, but no files
          return { 
            success: true, 
            folder: {
              ...folderWithNested,
              other_folders: folderWithNested.other_folders,
              files: [], // No files without password
            },
            requiresPassword: true 
          };
        }
        
        // Verify password
        if (folderWithNested.password !== password) {
          return { success: false, error: 'Incorrect password', folder: null, requiresPassword: true };
        }
      }
    }

    // Password verified or not locked - get full contents including files
    const folder = await prisma.folders.findFirst({
      where: {
        id: folderId,
        companyId,
      },
      include: {
        other_folders: {
          where: {
            deletedAt: null,
          },
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

    return { success: true, folder };
  } catch (error) {
    console.error('Error fetching folder:', error);
    return { success: false, error: 'Failed to fetch folder', folder: null };
  }
}

