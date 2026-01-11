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
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <Bell className="w-6 h-6 text-[#9f1d35]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Notifications</h1>
                <p className="text-sm text-gray-500">Manage your document alerts and updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <form action={handleRefresh}>
                <button
                  type="submit"
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#9f1d35] px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                  title="Refresh notifications"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Check Updates</span>
                </button>
              </form>
              {notifications.some(n => !n.isRead) && (
                <form action={handleMarkAllAsRead}>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-[#9f1d35] text-white px-4 py-2 rounded-xl hover:bg-[#8a1a2e] transition-all duration-200 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Mark all read</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {notifications.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
              <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                You don't have any new notifications at the moment. We'll let you know when something important happens.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 ${
                    notification.isRead 
                      ? 'border-gray-100 opacity-80' 
                      : 'border-red-100 bg-red-50/10 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                      notification.isRead 
                        ? 'bg-gray-50 text-gray-400' 
                        : 'bg-red-100 text-[#9f1d35]'
                    }`}>
                      {notification.type === 'expiry' ? <Calendar className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-bold truncate ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 leading-relaxed ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center mt-3 gap-4">
                        <div className="flex items-center text-[11px] text-gray-400">
                          <RefreshCw className="w-3 h-3 mr-1.5" />
                          <span>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {notification.fileId && (
                          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#9f1d35] bg-red-50 px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3" />
                            <span>Linked Document</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <form action={handleMarkAsRead} className="flex-shrink-0">
                        <input type="hidden" name="id" value={notification.id} />
                        <button
                          type="submit"
                          className="p-2 text-gray-400 hover:text-[#9f1d35] hover:bg-red-100 rounded-xl transition-all duration-200"
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
