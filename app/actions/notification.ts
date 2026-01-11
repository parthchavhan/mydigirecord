'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotifications(userId: string) {
  try {
    const notifications = await prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed to fetch notifications', notifications: [] };
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const count = await prisma.notifications.count({
      where: {
        userId,
        isRead: false,
      },
    });
    return { success: true, count };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { success: false, error: 'Failed to fetch unread count', count: 0 };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notifications.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    revalidatePath('/user/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await prisma.notifications.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath('/user/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}

export async function checkAndCreateExpiryNotifications() {
  try {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Find all files that expire within the next month
    const expiringFiles = await prisma.files.findMany({
      where: {
        expiryDate: {
          lte: oneMonthFromNow,
          gt: new Date(),
        },
        deletedAt: null,
      },
      include: {
        folders: {
          include: {
            users: true, // Folder owner
            companies: {
              include: {
                users: true, // All users in the company
              },
            },
          },
        },
        users: true, // File owner
      },
    });

    let createdCount = 0;

    for (const file of expiringFiles) {
      const usersToNotify = new Set<string>();

      // 1. Notify the file owner if exists
      if (file.userId) {
        usersToNotify.add(file.userId);
      }

      // 2. Notify the folder owner if exists
      if (file.folders.userId) {
        usersToNotify.add(file.folders.userId);
      }

      // 3. If no specific user, notify all company admins or all users if it's a user-side file
      if (usersToNotify.size === 0) {
        const companyUsers = file.folders.companies.users;
        companyUsers.forEach(u => {
          // If it's a small company or we want to be safe, notify everyone in the company
          // Or just admins: if (u.role === 'admin' || u.role === 'super_admin' || u.role === 'employee')
          usersToNotify.add(u.id);
        });
      }

      for (const userId of usersToNotify) {
        const title = 'Document Expiry Warning';
        const message = `The document "${file.name}" is set to expire on ${file.expiryDate?.toLocaleDateString()}. Please renew it soon.`;

        // Check if notification already exists for this file and user within the last 30 days
        const existingNotification = await prisma.notifications.findFirst({
          where: {
            userId,
            fileId: file.id,
            type: 'expiry',
            createdAt: {
              gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        });

        if (!existingNotification) {
          await prisma.notifications.create({
            data: {
              id: crypto.randomUUID(),
              userId,
              fileId: file.id,
              title,
              message,
              type: 'expiry',
              isRead: false,
            },
          });
          createdCount++;
        }
      }
    }

    return { success: true, createdCount };
  } catch (error) {
    console.error('Error creating expiry notifications:', error);
    return { success: false, error: 'Failed to create expiry notifications' };
  }
}
