'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, CreditCard, FileText } from 'lucide-react';
import Link from 'next/link';
import { logout, getAuth } from '@/app/actions/auth';
import { getCompany } from '@/app/actions/company';
import { getFilesByCompany } from '@/app/actions/file';
import { getAllFoldersFlat } from '@/app/actions/folder';
import toast from 'react-hot-toast';
import DashboardView from '@/app/user/dashboard/components/DashboardView';

export default function UserDashboard() {
  const router = useRouter();
  const [company, setCompany] = useState<any | null>(null);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [allFolders, setAllFolders] = useState<any[]>([]);
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

        // Load all folders for the tree view (including nested folders)
        const foldersResult = await getAllFoldersFlat(auth.companyId);
        if (foldersResult.success) {
          setAllFolders(foldersResult.folders || []);
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
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <LayoutDashboard className="w-6 h-6 text-[#9f1d35]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-sm text-gray-500">{company?.name || 'Welcome back'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/user/documents"
                className="flex items-center space-x-2 text-gray-600 hover:text-[#9f1d35] px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Documents ({documentCount})</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 overflow-y-auto custom-scrollbar">
        {/* Document Count Card */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Total Documents</h2>
                <p className="text-5xl font-black text-[#9f1d35]">{documentCount}</p>
              </div>
              <Link
                href="/user/documents"
                className="px-6 py-3 bg-[#9f1d35] text-white rounded-xl font-bold hover:bg-[#8a1a2e] transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                View All Documents
              </Link>
            </div>
          </div>

          {/* Dashboard View with Chart */}
          {company && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <DashboardView files={allFiles} folders={allFolders} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

