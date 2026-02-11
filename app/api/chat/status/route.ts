import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const token = (await cookies()).get('auth-token')?.value;
    if (!token) {
      console.log('[chat/status] No auth token found');
      return NextResponse.json({ allowed: false });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      console.log('[chat/status] Token verification failed');
      return NextResponse.json({ allowed: false });
    }

    // Only company users (role 'user') get AI chat; admins don't see it in the same way
    if (payload.role !== 'user' || !payload.companyId) {
      console.log('[chat/status] User role check failed:', { role: payload.role, companyId: payload.companyId });
      return NextResponse.json({ allowed: false });
    }

    const company = await prisma.companies.findUnique({
      where: { id: payload.companyId },
      select: { aiChatEnabled: true },
    });

    const allowed = company?.aiChatEnabled === true;
    console.log('[chat/status] Result:', { companyId: payload.companyId, aiChatEnabled: company?.aiChatEnabled, allowed });
    
    return NextResponse.json({
      allowed,
    });
  } catch (error) {
    console.error('[chat/status] Error:', error);
    return NextResponse.json({ allowed: false });
  }
}
