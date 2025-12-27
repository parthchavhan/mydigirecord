'use client';

import BaseModal from '../components/BaseModal';
import ModalForm from '../components/ModalForm';
import FormField from '../components/FormField';
import type { Company } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCompany: Company | null;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userPassword: string;
  setUserPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
}

export default function UserModal({
  isOpen,
  onClose,
  selectedCompany,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  userPassword,
  setUserPassword,
  onSubmit,
}: UserModalProps) {
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
      title={`Create User for ${selectedCompany.name}`}
      size="md"
    >
      <ModalForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Create User"
        cancelLabel="Cancel"
      >
        <FormField label="Full Name" required>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="John Doe"
            required
            autoFocus
          />
        </FormField>
        <FormField label="Email / ID" required>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="user@example.com"
            required
          />
        </FormField>
        <FormField label="Password" required hint="Minimum 6 characters">
          <input
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="Enter secure password"
            required
            minLength={6}
          />
        </FormField>
      </ModalForm>
    </BaseModal>
  );
}

