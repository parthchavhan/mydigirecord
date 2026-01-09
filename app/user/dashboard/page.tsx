'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, CreditCard, FileText } from 'lucide-react';
import Link from 'next/link';
import { logout, getAuth } from '@/app/actions/auth';
import { getCompany } from '@/app/actions/company';
import { getFilesByCompany } from '@/app/actions/file';
import toast from 'react-hot-toast';
import DashboardView from './components/DashboardView';

export default function UserDashboard() {
  const router = useRouter();
  const [company, setCompany] = useState<any | null>(null);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const auth = await getAuth();
        // Allow users with 'user', 'admin', or 'super_admin' roles to access dashboard
        // But exclude the main admin account (userId === 'admin')
        if (!auth || !auth.companyId || auth.userId === 'admin') {
          router.push('/user/login');
          return;
        }

        const result = await getCompany(auth.companyId);
        if (!result.success || !result.company) {
          toast.error('Company not found');
          router.push('/user/login');
          return;
        }

        const companyData = result.company;
        setCompany(companyData);

        // Load all files for the company for the chart
        const filesResult = await getFilesByCompany(auth.companyId);
        if (filesResult.success) {
          setAllFiles(filesResult.files || []);
          setDocumentCount(filesResult.files?.length || 0);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        router.push('/user/login');
      }
    };
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await logout();
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f1d35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
                <LayoutDashboard className="w-8 h-8 text-[#9f1d35]" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-500">{company?.name || ''}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3 ml-auto">
                <Link
                  href="/user/documents"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <FileText className="w-5 h-5" />
                  <span>Documents ({documentCount})</span>
                </Link>
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
          {/* Document Count Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Documents</h2>
                <p className="text-4xl font-bold text-[#9f1d35]">{documentCount}</p>
              </div>
              <Link
                href="/user/documents"
                className="px-6 py-3 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] transition-colors"
              >
                View All Documents
              </Link>
            </div>
          </div>

          {/* Dashboard View with Chart */}
          {company && (
            <DashboardView files={allFiles} />
          )}
        </main>
      </div>
  );
}

