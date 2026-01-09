'use client';

import { X, Download, Printer } from 'lucide-react';
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

  const handleDownload = async () => {
    if (!file.url) {
      return;
    }

    try {
      // Try to fetch the file and create a blob URL for download
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to direct link
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (!file.url) {
      return;
    }

    try {
      if (fileType === 'pdf' || fileType === 'image') {
        const printWindow = window.open(file.url, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            setTimeout(() => {
              printWindow.print();
            }, 250);
          });
        } else {
          // Fallback if popup blocked
          window.open(file.url, '_blank');
        }
      } else {
        // For other file types, try to print the current window
        window.print();
      }
    } catch (error) {
      console.error('Print error:', error);
      // Fallback: open in new tab
      window.open(file.url, '_blank');
    }
  };

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
        <div className="flex items-center justify-end gap-2 mb-4">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          {(fileType === 'pdf' || fileType === 'image') && (
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          )}
        </div>
        <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
          {renderContent()}
        </div>
      </div>
    </BaseModal>
  );
}

