import { NextResponse } from 'next/server';
import { permanentlyDeleteOldFiles } from '@/app/actions/file';

export async function GET(request: Request) {
  // Verify the request is from a cron job or has proper authentication
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await permanentlyDeleteOldFiles();
    return NextResponse.json({ 
      success: result.success, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error in cleanup cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

