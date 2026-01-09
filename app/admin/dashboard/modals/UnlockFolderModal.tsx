'use client';

import { useState, useEffect } from 'react';
import BaseModal from '../components/BaseModal';
import { Unlock, Eye, EyeOff } from 'lucide-react';
import type { Folder } from '../types';

interface UnlockFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null;
  onSubmit: (password: string) => Promise<boolean>;
  onUnlocked?: (folderId: string, password: string) => void;
}

export default function UnlockFolderModal({
  isOpen,
  onClose,
  folder,
  onSubmit,
  onUnlocked,
}: UnlockFolderModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unlockedPassword, setUnlockedPassword] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPassword('');
      setUnlockedPassword(null);
      setIsUnlocked(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!folder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      return;
    }

    setLoading(true);
    const success = await onSubmit(password);
    setLoading(false);
    
    if (success) {
      setUnlockedPassword(password);
      setIsUnlocked(true);
      if (onUnlocked) {
        onUnlocked(folder.id, password);
      }
      // Don't close modal, show password instead
    }
  };

  // Show password display after unlock
  if (isUnlocked && unlockedPassword) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={`Folder Unlocked: ${folder.name}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <Unlock className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                Folder has been unlocked. It will automatically lock again after 5 minutes.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={unlockedPassword}
                readOnly
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e]"
            >
              Close
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Unlock Folder: ${folder.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="Enter folder password"
            required
            autoFocus
          />
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
            <Unlock className="w-4 h-4" />
            <span>{loading ? 'Unlocking...' : 'Unlock Folder'}</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
