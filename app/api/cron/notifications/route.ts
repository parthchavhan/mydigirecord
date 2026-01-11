import { NextResponse } from 'next/server';
import { checkAndCreateExpiryNotifications } from '@/app/actions/notification';

export async function GET(request: Request) {
  // Verify the request is from a cron job or has proper authentication
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await checkAndCreateExpiryNotifications();
    return NextResponse.json({ 
      success: result.success, 
      createdCount: result.createdCount 
    });
  } catch (error) {
    console.error('Error in notifications cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
