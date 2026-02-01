'use client';

import { useState, useEffect } from 'react';
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.url || !isOpen) {
      // Cleanup previous blob URL if exists
      setBlobUrl(prev => {
        if (prev && prev.startsWith('blob:')) {
          window.URL.revokeObjectURL(prev);
        }
        return null;
      });
      return;
    }

    let currentBlobUrl: string | null = null;

    // Fetch file as blob to prevent download
    const fetchFileAsBlob = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(file.url!, {
          method: 'GET',
          headers: {
            'Accept': file.mimeType || '*/*',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        currentBlobUrl = url;
        setBlobUrl(url);
      } catch (err) {
        console.error('Error fetching file:', err);
        setError('Failed to load file. Please try downloading it instead.');
        // Do NOT set blobUrl to file.url - that would load the direct URL in the
        // iframe and trigger download when the server sends Content-Disposition: attachment
      } finally {
        setLoading(false);
      }
    };

    fetchFileAsBlob();

    // Cleanup blob URL when component unmounts or file changes
    return () => {
      if (currentBlobUrl && currentBlobUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [file?.url, isOpen, file?.mimeType]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      setBlobUrl(prev => {
        if (prev && prev.startsWith('blob:')) {
          window.URL.revokeObjectURL(prev);
        }
        return null;
      });
    }
  }, [isOpen]);

  if (!file || !file.url) {
    return null;
  }

  // Office/binary docs (docx, xlsx, etc.) must not be shown in an iframe - the browser
  // would download them instead of rendering. Only use 'text' for types the browser can display.
  const isOfficeOrBinaryDoc = (mimeType: string) => {
    const office = [
      'application/vnd.openxmlformats-officedocument', // docx, xlsx, pptx
      'application/vnd.ms-excel',
      'application/msword',
      'application/vnd.ms-powerpoint',
    ];
    return office.some((p) => mimeType.startsWith(p));
  };

  const getFileType = (mimeType?: string | null, fileName?: string) => {
    const ext = fileName?.toLowerCase().split('.').pop() ?? '';
    const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'];
    if (officeExts.includes(ext)) return 'unknown';

    if (!mimeType) return 'unknown';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (isOfficeOrBinaryDoc(mimeType)) return 'unknown';
    if (mimeType.startsWith('text/') || mimeType === 'application/json') return 'text';
    return 'unknown';
  };

  const fileType = getFileType(file.mimeType, file.name);
  // Only use blob URL for preview - never the direct file.url in iframe/img,
  // or the server's Content-Disposition: attachment will trigger a download on open
  const displayUrl = blobUrl;

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
    if (!blobUrl) return;
    const urlToPrint = blobUrl;

    try {
      if (fileType === 'pdf' || fileType === 'image') {
        const printWindow = window.open(urlToPrint, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            setTimeout(() => {
              printWindow.print();
            }, 250);
          });
        } else {
          // Fallback if popup blocked
          window.open(urlToPrint, '_blank');
        }
      } else {
        // For other file types, try to print the current window
        window.print();
      }
    } catch (error) {
      console.error('Print error:', error);
      // Fallback: open in new tab
      window.open(urlToPrint, '_blank');
    }
  };

  const renderContent = () => {
    // Show loading when fetching or when we have a file but no blob yet (prevents
    // flashing direct URL in iframe, which would trigger download)
    if (loading || (file?.url && !blobUrl && !error)) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f1d35] mb-4"></div>
          <p className="text-gray-500">Loading file...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <p className="text-red-500 mb-4">{error}</p>
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

    if (!displayUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <p className="text-gray-500">No file URL available</p>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <img
            src={displayUrl}
            alt={file.name}
            className="max-w-full max-h-[70vh] mx-auto object-contain"
            onError={() => setError('Failed to load image')}
          />
        );
      case 'pdf':
        return (
          <iframe
            src={displayUrl}
            className="w-full h-[70vh] border-0"
            title={file.name}
            onError={() => setError('Failed to load PDF')}
          />
        );
      case 'video':
        return (
          <video
            src={displayUrl}
            controls
            className="max-w-full max-h-[70vh] mx-auto"
            onError={() => setError('Failed to load video')}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'text':
        return (
          <iframe
            src={displayUrl}
            className="w-full h-[70vh] border-0"
            title={file.name}
            onError={() => setError('Failed to load document')}
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

