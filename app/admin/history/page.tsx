'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, LogOut, Calendar, User, File, Folder } from 'lucide-react';
import { logout, getAuth, checkIsAdmin } from '@/app/actions/auth';
import { getAuditLogs } from '@/app/actions/audit';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const auth = await getAuth();
        if (!auth || !auth.companyId) {
          router.push('/admin/login');
          return;
        }

        // Check if user is admin using server action
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.success || !adminCheck.isAdmin) {
          toast.error('Access denied. Admin privileges required.');
          router.push('/user/dashboard');
          return;
        }

        setCompanyId(auth.companyId);
        const result = await getAuditLogs(auth.companyId);
        if (result.success) {
          setLogs(result.logs || []);
        } else {
          toast.error(result.error || 'Failed to load history');
        }
      } catch (error) {
        console.error('Error loading history:', error);
        toast.error('An error occurred while loading history');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [router]);

  const handleLogout = async () => {
    await logout();
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'move':
        return 'bg-purple-100 text-purple-800';
      case 'copy':
        return 'bg-yellow-100 text-yellow-800';
      case 'share':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (entityType: string) => {
    return entityType === 'file' ? (
      <File className="w-4 h-4" />
    ) : (
      <Folder className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f1d35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <History className="w-8 h-8 text-[#9f1d35]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
                <p className="text-sm text-gray-500">All file and folder operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {logs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <History className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No activity history</h3>
            <p className="text-gray-500">Activity logs will appear here as users perform actions.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.entityType)}
                          <span className="text-sm text-gray-900 capitalize">{log.entityType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{log.entityName}</div>
                        {log.details && (
                          <div className="text-xs text-gray-500 mt-1">
                            {(() => {
                              try {
                                const details = JSON.parse(log.details);
                                if (details.action) {
                                  return `Action: ${details.action}`;
                                }
                                return '';
                              } catch {
                                return '';
                              }
                            })()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {log.users?.name || log.users?.email || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
