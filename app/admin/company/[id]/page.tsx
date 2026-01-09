'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, ArrowLeft, File, Folder, HardDrive, Users, Search } from 'lucide-react';
import { getAuth } from '@/app/actions/auth';
import { getCompany } from '@/app/actions/company';
import { getUserStatsByCompany } from '@/app/actions/user';
import { formatStorage } from '@/lib/utils';
import Link from 'next/link';

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<any | null>(null);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [filteredUserStats, setFilteredUserStats] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'files' | 'folders' | 'storage'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const auth = await getAuth();
        if (!auth || auth.role !== 'admin') {
          router.push('/admin/login');
          return;
        }

        const companyResult = await getCompany(companyId);
        if (!companyResult.success || !companyResult.company) {
          router.push('/admin/dashboard');
          return;
        }

        setCompany(companyResult.company);

        const statsResult = await getUserStatsByCompany(companyId);
        if (statsResult.success) {
          const stats = statsResult.userStats || [];
          setUserStats(stats);
          setFilteredUserStats(stats);
        }
      } catch (error) {
        console.error('Error loading company details:', error);
        router.push('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [companyId, router]);

  useEffect(() => {
    let filtered = [...userStats];

    // Apply search filter
    if (userSearchTerm.trim() !== '') {
      filtered = filtered.filter(
        (stat) =>
          stat.userName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          stat.userEmail.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterBy === 'files') {
      filtered = filtered.filter((stat) => stat.fileCount > 0);
    } else if (filterBy === 'folders') {
      filtered = filtered.filter((stat) => stat.folderCount > 0);
    } else if (filterBy === 'storage') {
      filtered = filtered.filter((stat) => stat.totalStorage > 0);
    }

    setFilteredUserStats(filtered);
  }, [userSearchTerm, filterBy, userStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f1d35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  const totalFiles = filteredUserStats.reduce((sum, stat) => sum + stat.fileCount, 0);
  const totalFolders = filteredUserStats.reduce((sum, stat) => sum + stat.folderCount, 0);
  const totalStorage = filteredUserStats.reduce((sum, stat) => sum + stat.totalStorage, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#9f1d35] flex-shrink-0" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{company.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#9f1d35] opacity-50 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{userStats.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600">Total Files</p>
              <File className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 opacity-50 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalFiles}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600">Total Folders</p>
              <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-[#9f1d35] opacity-50 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalFolders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600">Total Storage</p>
              <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 opacity-50 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{formatStorage(totalStorage)}</p>
          </div>
        </div>

        {/* User Statistics Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Statistics</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Files & Folders Created by Users</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent text-sm"
                  />
                </div>
                {/* Filter */}
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="files">With Files</option>
                  <option value="folders">With Folders</option>
                  <option value="storage">With Storage</option>
                </select>
              </div>
            </div>
          </div>
          {userStats.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">No users found for this company</p>
            </div>
          ) : filteredUserStats.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">No users found matching your search/filter criteria</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-gray-200">
                {filteredUserStats.map((stat: any) => (
                  <div key={stat.userId} className="p-4 hover:bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{stat.userName}</p>
                            <p className="text-xs text-gray-500 truncate">{stat.userEmail}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <File className="w-4 h-4 text-blue-500 mr-1" />
                            <span className="text-xs text-gray-600">Files</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{stat.fileCount}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Folder className="w-4 h-4 text-[#9f1d35] mr-1" />
                            <span className="text-xs text-gray-600">Folders</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{stat.folderCount}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <HardDrive className="w-4 h-4 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-600">Storage</span>
                          </div>
                          <p className="text-xs font-semibold text-gray-900 break-words">{formatStorage(stat.totalStorage)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Name
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Files Created
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Folders Created
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storage Used
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUserStats.map((stat: any) => (
                      <tr key={stat.userId} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">{stat.userName}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {stat.userEmail}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <File className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                            <span className="font-semibold">{stat.fileCount}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Folder className="w-4 h-4 text-[#9f1d35] mr-2 flex-shrink-0" />
                            <span className="font-semibold">{stat.folderCount}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <HardDrive className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="font-semibold">{formatStorage(stat.totalStorage)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

