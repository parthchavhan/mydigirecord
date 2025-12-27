'use client';

import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X, File } from 'lucide-react';
import { getDeletedFiles, restoreFile, deleteFile } from '@/app/actions/file';
import toast from 'react-hot-toast';
import AdminHeader from '../dashboard/components/AdminHeader';

export default function AdminBinPage() {
  const [deletedFiles, setDeletedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeletedFiles = async () => {
      try {
        const result = await getDeletedFiles();
        if (result.success) {
          setDeletedFiles(result.files || []);
        } else {
          toast.error(result.error || 'Failed to load deleted files');
          setDeletedFiles([]);
        }
      } catch (error) {
        console.error('Error loading deleted files:', error);
        toast.error('An error occurred while loading deleted files');
        setDeletedFiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadDeletedFiles();
  }, []);

  const handleRestore = async (fileId: string, fileName: string) => {
    const result = await restoreFile(fileId);
    if (result.success) {
      toast.success(`"${fileName}" restored successfully!`);
      setDeletedFiles(deletedFiles.filter(f => f.id !== fileId));
    } else {
      toast.error(result.error || 'Failed to restore file');
    }
  };

  const handlePermanentDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteFile(fileId, true);
    if (result.success) {
      toast.success('File permanently deleted!');
      setDeletedFiles(deletedFiles.filter(f => f.id !== fileId));
    } else {
      toast.error(result.error || 'Failed to delete file');
    }
  };

  const getDaysUntilPermanentDelete = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const now = new Date();
    const diffTime = now.getTime() - deleted.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 5 - diffDays);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Trash2 className="w-8 h-8 text-[#9f1d35]" />
              <span>Bin</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Files will be permanently deleted after 5 days
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : deletedFiles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="flex flex-col items-center justify-center">
              <Trash2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Bin is empty</h3>
              <p className="text-gray-500 max-w-md">
                Deleted files will appear here. Files are automatically permanently deleted after 5 days.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Folder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deleted On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto-Delete In
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deletedFiles.map((file) => {
                  const daysLeft = getDaysUntilPermanentDelete(file.deletedAt);
                  return (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <File className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {file.folder?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {file.folder?.company?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(file.deletedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {daysLeft > 0 ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            daysLeft <= 1 ? 'bg-red-100 text-red-800' :
                            daysLeft <= 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Will be deleted soon
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleRestore(file.id, file.name)}
                            className="text-[#9f1d35] hover:text-[#8a1a2e] flex items-center space-x-1"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(file.id, file.name)}
                            className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                          >
                            <X className="w-4 h-4" />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

