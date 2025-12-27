'use server';

import { cookies } from 'next/headers';
import { signToken, verifyToken } from '@/lib/auth';
import  prisma  from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function adminLogin(email: string, password: string) {
  if (email === 'admin@mydigirecord.com' && password === 'admin123') {
    const token = await signToken({
      userId: 'admin',
      role: 'admin',
    });

    (await cookies()).set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  }

  return { success: false, error: 'Invalid credentials' };
}

export async function userLogin(email: string, password: string, companyId: string) {
  try {
    const company = await prisma.companies.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    const user = await prisma.users.findUnique({
      where: {
        email_companyId: {
          email,
          companyId,
        },
      },
    });

    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    const token = await signToken({
      userId: user.id,
      role: 'user',
      companyId,
    });

    (await cookies()).set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error('Error during user login:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function logout() {
  (await cookies()).delete('auth-token');
  redirect('/');
}

export async function getAuth() {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload;
}

export async function requireAuth(role?: 'admin' | 'user') {
  const auth = await getAuth();
  if (!auth) {
    redirect(role === 'admin' ? '/admin/login' : '/user/login');
  }
  if (role && auth.role !== role) {
    redirect('/');
  }
  return auth;
}

