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
      return NextResponse.json({ allowed: false });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ allowed: false });
    }

    // Only company users (role 'user') get AI chat; admins don't see it in the same way
    if (payload.role !== 'user' || !payload.companyId) {
      return NextResponse.json({ allowed: false });
    }

    const company = await prisma.companies.findUnique({
      where: { id: payload.companyId },
      select: { aiChatEnabled: true },
    });

    return NextResponse.json({
      allowed: company?.aiChatEnabled === true,
    });
  } catch {
    return NextResponse.json({ allowed: false });
  }
}
