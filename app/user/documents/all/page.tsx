'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { File, Lock, Eye, ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { getAuth } from '@/app/actions/auth';
import { getCompany } from '@/app/actions/company';
import { getAllFilesWithFolders } from '@/app/actions/file';
import { verifyFolderPassword, getLockedFolders } from '@/app/actions/folder';
import toast from 'react-hot-toast';
import DocumentViewerModal from '../../../admin/dashboard/modals/DocumentViewerModal';
import FolderPasswordModal from '../components/FolderPasswordModal';

export default function AllDocumentsPage() {
  const router = useRouter();
  const [company, setCompany] = useState<any | null>(null);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLockedFolders, setShowLockedFolders] = useState(false);
  const [verifiedFolderIds, setVerifiedFolderIds] = useState<Set<string>>(new Set());
  const [viewingFile, setViewingFile] = useState<any | null>(null);
  const [passwordModalFolder, setPasswordModalFolder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const auth = await getAuth();
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

        setCompany(result.company);
        await loadFiles(false, []);
      } catch (error) {
        console.error('Error loading documents:', error);
        router.push('/user/login');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const loadFiles = async (includeLocked: boolean, verifiedIds: string[]) => {
    if (!company) return;
    
    try {
      const result = await getAllFilesWithFolders(company.id, includeLocked, verifiedIds);
      if (result.success) {
        setAllFiles(result.files || []);
        setFilteredFiles(result.files || []);
      } else {
        toast.error(result.error || 'Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFiles(allFiles);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = allFiles.filter(file => 
        file.name.toLowerCase().includes(term) ||
        file.folderName?.toLowerCase().includes(term) ||
        file.category?.toLowerCase().includes(term)
      );
      setFilteredFiles(filtered);
    }
  }, [searchTerm, allFiles]);

  const handleToggleLockedFolders = async () => {
    if (!showLockedFolders) {
      // User wants to show locked folders - need to get locked folders and verify passwords
      if (!company) return;

      // Get all locked folders for this company
      const lockedFoldersResult = await getLockedFolders(company.id);
      
      if (!lockedFoldersResult.success || !lockedFoldersResult.folders || lockedFoldersResult.folders.length === 0) {
        toast.error('No locked folders found');
        return;
      }

      // Show password modal for locked folders
      setPasswordModalFolder({ id: 'all', name: 'All Locked Folders' });
    } else {
      // User wants to hide locked folders
      setShowLockedFolders(false);
      setVerifiedFolderIds(new Set());
      await loadFiles(false, []);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!company || !passwordModalFolder) return false;

    try {
      // Get all locked folders
      const lockedFoldersResult = await getLockedFolders(company.id);
      
      if (!lockedFoldersResult.success || !lockedFoldersResult.folders) {
        return false;
      }

      // Verify password for each locked folder
      const verifiedIds: string[] = [];
      for (const folder of lockedFoldersResult.folders) {
        const result = await verifyFolderPassword(folder.id, password);
        if (result.success && result.verified) {
          verifiedIds.push(folder.id);
        }
      }

      if (verifiedIds.length === 0) {
        return false; // Password incorrect for all folders
      }

      // Update verified folder IDs
      const newVerifiedSet = new Set(verifiedIds);
      setVerifiedFolderIds(newVerifiedSet);
      setShowLockedFolders(true);
      
      // Reload files with verified locked folders
      await loadFiles(true, verifiedIds);
      
      toast.success(`Unlocked ${verifiedIds.length} folder${verifiedIds.length !== 1 ? 's' : ''}`);
      return true;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f1d35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/user/documents"
                className="flex items-center text-gray-600 hover:text-[#9f1d35] transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                <span className="text-sm">Back to Documents</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">All Documents</h1>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLockedFolders}
                  onChange={handleToggleLockedFolders}
                  className="w-4 h-4 text-[#9f1d35] border-gray-300 rounded focus:ring-[#9f1d35]"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Show Locked Folders
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents by name, folder, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35]"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No documents found matching your search' : 'No documents found'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Folder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <File className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700">{file.folderName || 'Unknown'}</span>
                          {file.folderIsLocked && (
                            <span title="Locked folder">
                              <Lock className="w-4 h-4 text-yellow-600 ml-2" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {file.category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {formatFileSize(file.size || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setViewingFile(file)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-[#9f1d35] bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Count */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredFiles.length} of {allFiles.length} document{allFiles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingFile && (
        <DocumentViewerModal
          isOpen={!!viewingFile}
          onClose={() => setViewingFile(null)}
          file={viewingFile}
        />
      )}

      {/* Password Modal for Locked Folders */}
      {passwordModalFolder && (
        <FolderPasswordModal
          isOpen={!!passwordModalFolder}
          onClose={() => setPasswordModalFolder(null)}
          folderName={passwordModalFolder.name}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
}
