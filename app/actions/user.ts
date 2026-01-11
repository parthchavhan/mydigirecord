'use server';

import  prisma  from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createUser(name: string, email: string, password: string, companyId: string, role: string = 'employee') {
  try {
    const { getAuth } = await import('./auth');
    const auth = await getAuth();
    
    if (!auth) return { success: false, error: 'Unauthorized' };

    // Authorization check: Only super_admin or company admin can create users
    let isAuthorized = false;
    if (auth.role === 'admin' || auth.userId === 'admin') {
      isAuthorized = true;
    } else if (auth.userId) {
      const currentUser = await prisma.users.findUnique({ where: { id: auth.userId } });
      if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized. Admin privileges required.' };
    }

    // Role specific checks
    if (role === 'admin' || role === 'super_admin') {
      const currentUser = auth.userId !== 'admin' ? await prisma.users.findUnique({ where: { id: auth.userId! } }) : null;
      // Only super_admins (system or company) can create other admins
      if (auth.userId !== 'admin' && (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'admin'))) {
        return { success: false, error: 'Insufficient permissions to create admin accounts' };
      }
      // Only super_admins can create super_admins
      if (role === 'super_admin' && auth.userId !== 'admin' && (!currentUser || currentUser.role !== 'super_admin')) {
        return { success: false, error: 'Only super admins can create super admin accounts' };
      }
    }

    const existingUser = await prisma.users.findUnique({
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

    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        companyId,
        role: role || 'employee',
        updatedAt: new Date(),
      },
    });
    revalidatePath('/admin/dashboard');
    revalidatePath('/user/users');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function getUserByEmailAndCompany(email: string, companyId: string) {
  try {
    const user = await prisma.users.findUnique({
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
    const users = await prisma.users.findMany({
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
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        companies: true,
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
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    await prisma.users.update({
      where: { id: userId },
      data: { password: newPassword, updatedAt: new Date() },
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
    const existingUser = await prisma.users.findUnique({
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

    await prisma.users.update({
      where: { id: userId },
      data: { email: newEmail, updatedAt: new Date() },
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
    await prisma.users.update({
      where: { id: userId },
      data: { name: newName, updatedAt: new Date() },
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
    await prisma.users.delete({
      where: { id: userId },
    });

    revalidatePath('/user/settings');
    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.users.delete({
      where: { id: userId },
    });

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

export async function updateUser(userId: string, email: string, password: string, companyId: string) {
  try {
    // Check if email already exists in the company (excluding current user)
    const existingUser = await prisma.users.findUnique({
      where: {
        email_companyId: {
          email,
          companyId,
        },
      },
    });

    if (existingUser && existingUser.id !== userId) {
      return { success: false, error: 'Email already exists in this company' };
    }

    await prisma.users.update({
      where: { id: userId },
      data: { 
        email, 
        password,
        updatedAt: new Date() 
      },
    });

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const { getAuth } = await import('./auth');
    const auth = await getAuth();
    
    if (!auth) return { success: false, error: 'Unauthorized' };

    // Check if the current user is an admin (either system admin or company admin)
    let isAuthorized = false;
    if (auth.role === 'admin' || auth.userId === 'admin') {
      isAuthorized = true;
    } else if (auth.userId) {
      const currentUser = await prisma.users.findUnique({ where: { id: auth.userId } });
      if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized. Admin privileges required.' };
    }

    // Validate role
    if (!['employee', 'admin', 'super_admin'].includes(newRole)) {
      return { success: false, error: 'Invalid role' };
    }

    // Restrict company admins from creating super_admins if they are not super_admins themselves
    if (newRole === 'super_admin') {
      const currentUser = auth.userId !== 'admin' ? await prisma.users.findUnique({ where: { id: auth.userId! } }) : null;
      if (auth.userId !== 'admin' && (!currentUser || currentUser.role !== 'super_admin')) {
        return { success: false, error: 'Only super admins can assign super admin role' };
      }
    }

    await prisma.users.update({
      where: { id: userId },
      data: { 
        role: newRole,
        updatedAt: new Date() 
      },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/user/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

export async function getUserStats(userId: string) {
  try {
    const fileCount = await prisma.files.count({
      where: { userId },
    });

    const folderCount = await prisma.folders.count({
      where: { userId },
    });

    const storageResult = await prisma.files.aggregate({
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

    const users = await prisma.users.findMany({
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
      const storageResult = await prisma.files.aggregate({
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

    const users = await prisma.users.findMany({
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
      const storageResult = await prisma.files.aggregate({
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

