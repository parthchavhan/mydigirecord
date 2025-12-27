'use client';

import { X } from 'lucide-react';
import BaseModal from '../components/BaseModal';
import type { File } from '../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  file,
}: DocumentViewerModalProps) {
  if (!file || !file.url) {
    return null;
  }

  const getFileType = (mimeType?: string | null) => {
    if (!mimeType) return 'unknown';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('text') || mimeType.includes('document')) return 'text';
    return 'unknown';
  };

  const fileType = getFileType(file.mimeType);

  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <img
            src={file.url!}
            alt={file.name}
            className="max-w-full max-h-[70vh] mx-auto object-contain"
          />
        );
      case 'pdf':
        return (
          <iframe
            src={file.url!}
            className="w-full h-[70vh] border-0"
            title={file.name}
          />
        );
      case 'video':
        return (
          <video
            src={file.url!}
            controls
            className="max-w-full max-h-[70vh] mx-auto"
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'text':
        return (
          <iframe
            src={file.url!}
            className="w-full h-[70vh] border-0"
            title={file.name}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <p className="text-gray-500 mb-4">Preview not available for this file type</p>
            <a
              href={file.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] transition-colors"
            >
              Open in New Tab
            </a>
          </div>
        );
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={file.name}
      size="xl"
    >
      <div className="relative">
        <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
          {renderContent()}
        </div>
      </div>
    </BaseModal>
  );
}

