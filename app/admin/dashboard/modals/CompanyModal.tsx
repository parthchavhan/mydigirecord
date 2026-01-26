'use client';

import { useState } from 'react';
import BaseModal from '../components/BaseModal';
import ModalForm from '../components/ModalForm';
import FormField from '../components/FormField';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  companyType: string;
  setCompanyType: (type: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
}

export default function CompanyModal({
  isOpen,
  onClose,
  companyName,
  setCompanyName,
  companyType,
  setCompanyType,
  onSubmit,
}: CompanyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!companyName.trim()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(e);
      if (success) {
        onClose();
      }
      return success;
    } catch (error) {
      console.error('Error submitting company form:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Company"
      size="md"
    >
      <ModalForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Create Company"
        cancelLabel="Cancel"
        isLoading={isSubmitting}
      >
        <FormField label="Company Name" required>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            placeholder="e.g., Greenfield School"
            required
            autoFocus
          />
        </FormField>
        <FormField label="Company Profile/Type" required>
          <select
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors bg-white"
            required
          >
            <option value="">Select company type...</option>
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="university">University</option>
            <option value="other">Other</option>
          </select>
        </FormField>
      </ModalForm>
    </BaseModal>
  );
}

