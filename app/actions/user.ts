'use server';

import  prisma  from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createUser(name: string, email: string, password: string, companyId: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email_companyId: {
          email,
          companyId,
        },
      },
    });

    if (existingUser) {
      return { success: false, error: 'User with this email already exists in this company' };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        companyId,
      },
    });
    revalidatePath('/admin/dashboard');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function getUserByEmailAndCompany(email: string, companyId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email_companyId: {
          email,
          companyId,
        },
      },
    });
    return { success: true, user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user', user: null };
  }
}

export async function getUsersByCompany(companyId: string) {
  try {
    const users = await prisma.user.findMany({
      where: { companyId },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users', users: [] };
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });
    return { success: true, user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user', user: null };
  }
}

export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    revalidatePath('/user/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: 'Failed to update password' };
  }
}

export async function updateUserEmail(userId: string, newEmail: string, companyId: string) {
  try {
    // Check if email already exists in the company
    const existingUser = await prisma.user.findUnique({
      where: {
        email_companyId: {
          email: newEmail,
          companyId,
        },
      },
    });

    if (existingUser && existingUser.id !== userId) {
      return { success: false, error: 'Email already exists in this company' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    revalidatePath('/user/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating email:', error);
    return { success: false, error: 'Failed to update email' };
  }
}

export async function updateUserName(userId: string, newName: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
    });

    revalidatePath('/user/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating name:', error);
    return { success: false, error: 'Failed to update name' };
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/user/settings');
    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

export async function getUserStats(userId: string) {
  try {
    const fileCount = await prisma.file.count({
      where: { userId },
    });

    const folderCount = await prisma.folder.count({
      where: { userId },
    });

    const storageResult = await prisma.file.aggregate({
      where: { userId },
      _sum: { size: true },
    });

    const totalStorage = storageResult._sum.size || 0;

    return {
      success: true,
      stats: {
        fileCount,
        folderCount,
        totalStorage,
      },
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { success: false, error: 'Failed to fetch user stats' };
  }
}

export async function getUserStatsByCompany(companyId: string) {
  try {
    const { getAuth } = await import('./auth');
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return { success: false, error: 'Unauthorized', userStats: [] };
    }

    const users = await prisma.user.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            files: true,
            folders: true,
          },
        },
      },
    });

    const userStatsPromises = users.map(async (user: { id: string; name: string; email: string; companyId: string; _count: { files: number; folders: number } }) => {
      const storageResult = await prisma.file.aggregate({
        where: { userId: user.id },
        _sum: { size: true },
      });

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        companyId: user.companyId,
        fileCount: user._count.files,
        folderCount: user._count.folders,
        totalStorage: storageResult._sum.size || 0,
      };
    });

    const userStats = await Promise.all(userStatsPromises);

    return { success: true, userStats };
  } catch (error) {
    console.error('Error fetching user stats by company:', error);
    return { success: false, error: 'Failed to fetch user stats', userStats: [] };
  }
}

export async function getAllUserStats() {
  try {
    const { getAuth } = await import('./auth');
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return { success: false, error: 'Unauthorized', userStats: [] };
    }

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            files: true,
            folders: true,
          },
        },
      },
    });

    const userStatsPromises = users.map(async (user: { id: string; name: string; email: string; companyId: string; _count: { files: number; folders: number } }) => {
      const storageResult = await prisma.file.aggregate({
        where: { userId: user.id },
        _sum: { size: true },
      });

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        companyId: user.companyId,
        fileCount: user._count.files,
        folderCount: user._count.folders,
        totalStorage: storageResult._sum.size || 0,
      };
    });

    const userStats = await Promise.all(userStatsPromises);

    return { success: true, userStats };
  } catch (error) {
    console.error('Error fetching all user stats:', error);
    return { success: false, error: 'Failed to fetch user stats', userStats: [] };
  }
}

