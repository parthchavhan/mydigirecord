'use client';

import BaseModal from '../components/BaseModal';
import ModalForm from '../components/ModalForm';
import FormField from '../components/FormField';
import type { Folder } from '../types';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFolder: Folder | null;
  editFolderName: string;
  setEditFolderName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
}

export default function EditFolderModal({
  isOpen,
  onClose,
  editingFolder,
  editFolderName,
  setEditFolderName,
  onSubmit,
}: EditFolderModalProps) {
  if (!editingFolder) return null;

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
      title="Rename Folder"
      size="md"
    >
      <ModalForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Save Changes"
        cancelLabel="Cancel"
      >
        <FormField label="Folder Name" required>
          <input
            type="text"
            value={editFolderName}
            onChange={(e) => setEditFolderName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="Enter new folder name"
            required
            autoFocus
          />
        </FormField>
      </ModalForm>
    </BaseModal>
  );
}

