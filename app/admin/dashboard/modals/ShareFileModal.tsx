'use client';

import BaseModal from '../components/BaseModal';
import FormField from '../components/FormField';
import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import type { File } from '../types';

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile: File | null;
  onShare: (file: File) => void;
}

export default function ShareFileModal({
  isOpen,
  onClose,
  selectedFile,
  onShare,
}: ShareFileModalProps) {
  const [copied, setCopied] = useState(false);

  if (!selectedFile) return null;

  const handleCopy = () => {
    onShare(selectedFile);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Share File"
      size="md"
    >
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-700">File Sharing URL</p>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Copy this URL to share the file with others. Anyone with this link can access the file.
          </p>
        </div>

        <FormField label="File URL">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={selectedFile.url || ''}
              readOnly
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-[#9f1d35] text-white hover:bg-[#8a1a2e]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <span>Copy</span>
              )}
            </button>
          </div>
        </FormField>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

