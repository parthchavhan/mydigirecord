'use client';

import BaseModal from '../components/BaseModal';
import ModalForm from '../components/ModalForm';
import FormField from '../components/FormField';

interface RenameFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  renameFileName: string;
  setRenameFileName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
}

export default function RenameFileModal({
  isOpen,
  onClose,
  renameFileName,
  setRenameFileName,
  onSubmit,
}: RenameFileModalProps) {
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
      title="Rename File"
      size="md"
    >
      <ModalForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Save Changes"
        cancelLabel="Cancel"
      >
        <FormField label="File Name" required>
          <input
            type="text"
            value={renameFileName}
            onChange={(e) => setRenameFileName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="Enter new file name"
            required
            autoFocus
          />
        </FormField>
      </ModalForm>
    </BaseModal>
  );
}

