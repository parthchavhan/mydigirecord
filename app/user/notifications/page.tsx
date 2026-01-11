import { getAuth } from '@/app/actions/auth';
import { getNotifications, markAsRead, markAllAsRead, checkAndCreateExpiryNotifications } from '@/app/actions/notification';
import { redirect } from 'next/navigation';
import { Bell, Check, Calendar, FileText, RefreshCw } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function NotificationsPage() {
  const auth = await getAuth();
  
  if (!auth || !auth.userId) {
    redirect('/user/login');
  }

  const notificationsResult = await getNotifications(auth.userId);
  const notifications = notificationsResult.success ? notificationsResult.notifications : [];

  async function handleMarkAsRead(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await markAsRead(id);
      revalidatePath('/user/notifications');
      revalidatePath('/user/dashboard');
    }
  }

  async function handleMarkAllAsRead() {
    'use server';
    const auth = await getAuth();
    if (auth?.userId) {
      await markAllAsRead(auth.userId);
      revalidatePath('/user/notifications');
      revalidatePath('/user/dashboard');
    }
  }

  async function handleRefresh() {
    'use server';
    await checkAndCreateExpiryNotifications();
    revalidatePath('/user/notifications');
    revalidatePath('/user/dashboard');
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-[#9f1d35]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">Stay updated on your document status</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <form action={handleRefresh}>
                <button
                  type="submit"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Refresh notifications"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Check for Expiry</span>
                </button>
              </form>
              {notifications.some(n => !n.isRead) && (
                <form action={handleMarkAllAsRead}>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 text-[#9f1d35] hover:text-[#8a1a2e] px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    <span>Mark all as read</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900">No notifications</h2>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 transition-all ${
                    notification.isRead ? 'border-gray-200 opacity-75' : 'border-[#9f1d35] bg-red-50/30 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className={`p-2 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-[#9f1d35]'}`}>
                        {notification.type === 'expiry' ? <Calendar className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-400 space-x-4">
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          {notification.fileId && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <FileText className="w-3 h-3" />
                              <span>Document linked</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <form action={handleMarkAsRead}>
                        <input type="hidden" name="id" value={notification.id} />
                        <button
                          type="submit"
                          className="p-2 text-gray-400 hover:text-[#9f1d35] hover:bg-red-50 rounded-full transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
