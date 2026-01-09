'use server';

import prisma from '@/lib/prisma';
import { getAuth } from './auth';

export async function createAuditLog(
  action: string,
  entityType: 'file' | 'folder',
  entityId: string,
  entityName: string,
  details?: any
) {
  try {
    const auth = await getAuth();
    if (!auth || !auth.companyId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.auditLogs.create({
      data: {
        id: crypto.randomUUID(),
        action,
        entityType,
        entityId,
        entityName,
        userId: auth.userId !== 'admin' ? auth.userId : null,
        companyId: auth.companyId,
        details: details ? JSON.stringify(details) : null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating audit log:', error);
    return { success: false, error: 'Failed to create audit log' };
  }
}

export async function getAuditLogs(companyId: string, limit: number = 100) {
  try {
    const auth = await getAuth();
    if (!auth || !auth.companyId || auth.companyId !== companyId) {
      return { success: false, error: 'Unauthorized', logs: [] };
    }

    // Only admins and super_admins can view logs
    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized - Admin access required', logs: [] };
    }

    const logs = await prisma.auditLogs.findMany({
      where: {
        companyId,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return { success: true, logs };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { success: false, error: 'Failed to fetch audit logs', logs: [] };
  }
}
