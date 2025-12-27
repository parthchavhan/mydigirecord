'use client';

import BaseModal from '../components/BaseModal';
import { FolderPlus } from 'lucide-react';
import type { Folder, FolderStats } from '../types';

interface FolderInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  infoFolder: Folder | null;
  folderStats: FolderStats | null;
}

export default function FolderInfoModal({
  isOpen,
  onClose,
  infoFolder,
  folderStats,
}: FolderInfoModalProps) {
  if (!infoFolder || !folderStats) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Folder Information"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
          <div className="p-3 bg-[#9f1d35]/10 rounded-lg">
            <FolderPlus className="w-6 h-6 text-[#9f1d35]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{infoFolder.name}</p>
            <p className="text-sm text-gray-500">
              Created: {new Date(infoFolder.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Folders</p>
                <p className="text-3xl font-bold text-[#9f1d35]">{folderStats.folderCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {folderStats.directFolderCount} direct
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Files</p>
                <p className="text-3xl font-bold text-blue-600">{folderStats.fileCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {folderStats.directFileCount} direct
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Contents Summary</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>
                {folderStats.directFolderCount} folder{folderStats.directFolderCount !== 1 ? 's' : ''} directly inside
              </li>
              <li>
                {folderStats.directFileCount} file{folderStats.directFileCount !== 1 ? 's' : ''} directly inside
              </li>
              {folderStats.folderCount > folderStats.directFolderCount && (
                <li className="text-gray-500">
                  {folderStats.folderCount - folderStats.directFolderCount} nested folder{folderStats.folderCount - folderStats.directFolderCount !== 1 ? 's' : ''}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

