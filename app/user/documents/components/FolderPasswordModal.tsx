'use client';

import { useState } from 'react';
import BaseModal from '../../../admin/dashboard/components/BaseModal';
import { Lock } from 'lucide-react';

interface FolderPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  onSubmit: (password: string) => Promise<boolean>;
}

export default function FolderPasswordModal({
  isOpen,
  onClose,
  folderName,
  onSubmit,
}: FolderPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setError('');
    setLoading(true);
    const success = await onSubmit(password);
    setLoading(false);
    
    if (success) {
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Locked Folder: ${folderName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              This folder is password protected. Please enter the password to access it.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="Enter folder password"
            required
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !password}
            className="flex-1 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Access Folder'}</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
