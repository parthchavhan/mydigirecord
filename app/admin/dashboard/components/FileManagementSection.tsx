'use client';

import { motion } from 'framer-motion';
import { File, Plus, Search, MoreVertical, Edit, FileText, Download, Share2, Printer, Trash2, Copy, Eye, Clipboard } from 'lucide-react';
import { formatStorage } from '@/lib/utils';
import type { File as FileType } from '../types';

interface FileManagementSectionProps {
  files: FileType[];
  filteredFiles: FileType[];
  fileSearchTerm: string;
  setFileSearchTerm: (term: string) => void;
  onOpenAddFileModal: () => void;
  onRenameFile: (file: FileType) => void;
  onUpdateFileDetails: (file: FileType) => void;
  onDownloadFile: (file: FileType) => void;
  onShareFile: (file: FileType) => void;
  onPrintFile: (file: FileType) => void;
  onDeleteFile: (id: string, name: string) => void;
  onViewFile?: (file: FileType) => void;
  onEditFile?: (file: FileType) => void;
  onCopyFile?: (file: FileType) => void;
  onPasteFile?: () => void;
  copiedFile: FileType | null;
  openFileMenuId: string | null;
  setOpenFileMenuId: (id: string | null) => void;
  loadFolders: (companyId: string) => void;
}

export default function FileManagementSection({
  files,
  filteredFiles,
  fileSearchTerm,
  setFileSearchTerm,
  onOpenAddFileModal,
  onRenameFile,
  onUpdateFileDetails,
  onDownloadFile,
  onShareFile,
  onPrintFile,
  onDeleteFile,
  onViewFile,
  onEditFile,
  onCopyFile,
  onPasteFile,
  copiedFile,
  openFileMenuId,
  setOpenFileMenuId,
  loadFolders,
}: FileManagementSectionProps) {
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">File Management</h2>
        <div className="flex items-center space-x-3">
          {onPasteFile && copiedFile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPasteFile}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              title={`Paste "${copiedFile.name}"`}
            >
              <Clipboard className="w-5 h-5" />
              <span>Paste</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAddFileModal}
            className="flex items-center space-x-2 bg-[#9f1d35] text-white px-4 py-2 rounded-lg hover:bg-[#8a1a2e]"
          >
            <Plus className="w-5 h-5" />
            <span>Add File</span>
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search files by name, folder, or company..."
            value={fileSearchTerm}
            onChange={(e) => setFileSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
          />
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No files yet. Upload your first file!</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No files found matching "{fileSearchTerm}"</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewFile && onViewFile(file)}
                  >
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
                      {formatStorage(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {file.user?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFileMenuId(openFileMenuId === file.id ? null : file.id);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openFileMenuId === file.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenFileMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              {onViewFile && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewFile(file);
                                    setOpenFileMenuId(null);
                                  }}
                                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </button>
                              )}
                              {onEditFile && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditFile(file);
                                    setOpenFileMenuId(null);
                                  }}
                                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                              )}
                              {onCopyFile && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCopyFile(file);
                                    setOpenFileMenuId(null);
                                  }}
                                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Copy className="w-4 h-4" />
                                  <span>Copy</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRenameFile(file);
                                  setOpenFileMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Rename File</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateFileDetails(file);
                                  if (file.folder?.company?.id) {
                                    loadFolders(file.folder.company.id);
                                  }
                                  setOpenFileMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FileText className="w-4 h-4" />
                                <span>Update Details</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDownloadFile(file);
                                  setOpenFileMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download File</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShareFile(file);
                                  setOpenFileMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Share2 className="w-4 h-4" />
                                <span>Share File</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPrintFile(file);
                                  setOpenFileMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Printer className="w-4 h-4" />
                                <span>Print File</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteFile(file.id, file.name);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete File</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

