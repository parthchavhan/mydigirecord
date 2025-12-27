'use client';

import BaseModal from '../components/BaseModal';
import ModalForm from '../components/ModalForm';
import FormField from '../components/FormField';
import type { Company } from '../types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCompany: Company | null;
  folderName: string;
  setFolderName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
}

export default function FolderModal({
  isOpen,
  onClose,
  selectedCompany,
  folderName,
  setFolderName,
  onSubmit,
}: FolderModalProps) {
  if (!selectedCompany) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    const success = await onSubmit(e);
    if (success) {
      onClose();
    }
    return success;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create Folder in ${selectedCompany.name}`}
      size="md"
    >
      <ModalForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Create Folder"
        cancelLabel="Cancel"
      >
        <FormField label="Folder Name" required hint="e.g., Students, Staff, KYC">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="Enter folder name"
            required
            autoFocus
          />
        </FormField>
      </ModalForm>
    </BaseModal>
  );
}

