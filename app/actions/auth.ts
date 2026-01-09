'use server';

import { cookies } from 'next/headers';
import { signToken, verifyToken } from '@/lib/auth';
import  prisma  from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function adminLogin(email: string, password: string) {
  if (email === 'admin@mendorabox.com' && password === 'admin123') {
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

export async function userLogin(email: string, password: string) {
  try {
    // Find user by email (since email should be unique across companies or we'll take the first match)
    const user = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Determine role based on user's role field
    let role = 'user';
    if (user.role === 'super_admin' || user.role === 'admin') {
      role = user.role;
    }

    const token = await signToken({
      userId: user.id,
      role: role as any,
      companyId: user.companyId,
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

export async function checkIsAdmin() {
  try {
    const auth = await getAuth();
    if (!auth) {
      return { success: false, isAdmin: false };
    }

    // Check if user is admin or super_admin
    if (auth.role === 'admin' || auth.userId === 'admin') {
      return { success: true, isAdmin: true };
    }

    // Check database if user has admin role
    if (auth.userId && auth.userId !== 'admin') {
      const user = await prisma.users.findUnique({
        where: { id: auth.userId },
        select: { role: true },
      });
      if (user && (user.role === 'admin' || user.role === 'super_admin')) {
        return { success: true, isAdmin: true };
      }
    }

    return { success: true, isAdmin: false };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { success: false, isAdmin: false };
  }
}
