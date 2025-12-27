'use client';

import { useState } from 'react';
import BaseModal from '../components/BaseModal';
import ModalForm from '../components/ModalForm';
import FormField from '../components/FormField';
import type { Company } from '../types';

interface PasteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  copiedFileName: string;
  onPaste: (targetFolderId: string) => Promise<boolean>;
  loadFolders: (companyId: string) => void;
}

export default function PasteFileModal({
  isOpen,
  onClose,
  companies,
  copiedFileName,
  onPaste,
  loadFolders,
}: PasteFileModalProps) {
  const [targetFolderId, setTargetFolderId] = useState('');
  const [pasting, setPasting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFolderId) return false;

    setPasting(true);
    const success = await onPaste(targetFolderId);
    setPasting(false);

    if (success) {
      setTargetFolderId('');
      onClose();
    }
    return success;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Paste File"
      size="md"
    >
      <ModalForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel={pasting ? 'Pasting...' : 'Paste File'}
        cancelLabel="Cancel"
        isLoading={pasting}
      >
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">File to paste:</span> {copiedFileName}
          </p>
        </div>

        <FormField label="Select Destination Folder" required>
          <select
            value={targetFolderId}
            onChange={(e) => {
              setTargetFolderId(e.target.value);
              if (e.target.value) {
                const selectedCompany = companies.find(c => 
                  c.folders.some((f: any) => f.id === e.target.value)
                );
                if (selectedCompany) {
                  loadFolders(selectedCompany.id);
                }
              }
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors bg-white"
            required
          >
            <option value="">Select a folder...</option>
            {companies.map((company) =>
              company.folders.map((folder: any) => (
                <option key={folder.id} value={folder.id}>
                  {company.name} / {folder.name}
                </option>
              ))
            )}
          </select>
        </FormField>
      </ModalForm>
    </BaseModal>
  );
}

