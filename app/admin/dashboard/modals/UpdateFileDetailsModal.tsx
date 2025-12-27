'use client';

import { useState, useEffect } from 'react';
import BaseModal from '../components/BaseModal';
import ModalForm from '../components/ModalForm';
import FormField from '../components/FormField';
import type { Company } from '../types';
import type { File } from '../types';

interface UpdateFileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  selectedFile: File | null;
  updateFileFolder: string;
  setUpdateFileFolder: (folderId: string) => void;
  onSubmit: (data: any) => Promise<boolean>;
}

export default function UpdateFileDetailsModal({
  isOpen,
  onClose,
  companies,
  selectedFile,
  updateFileFolder,
  setUpdateFileFolder,
  onSubmit,
}: UpdateFileDetailsModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [showRenewalFields, setShowRenewalFields] = useState(false);
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [placeOfIssue, setPlaceOfIssue] = useState('');

  useEffect(() => {
    if (selectedFile) {
      setName(selectedFile.name || '');
      setCategory(selectedFile.category || '');
      setIssueDate(selectedFile.issueDate ? new Date(selectedFile.issueDate).toISOString().split('T')[0] : '');
      setExpiryDate(selectedFile.expiryDate ? new Date(selectedFile.expiryDate).toISOString().split('T')[0] : '');
      setRenewalDate(selectedFile.renewalDate ? new Date(selectedFile.renewalDate).toISOString().split('T')[0] : '');
      setPlaceOfIssue(selectedFile.placeOfIssue || '');
      setShowRenewalFields(!!(selectedFile.issueDate || selectedFile.expiryDate || selectedFile.renewalDate || selectedFile.placeOfIssue));
      if (selectedFile.folderId) {
        setUpdateFileFolder(selectedFile.folderId);
      }
    }
  }, [selectedFile, setUpdateFileFolder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return false;

    const success = await onSubmit({
      name,
      folderId: updateFileFolder,
      category: category || undefined,
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      renewalDate: renewalDate || undefined,
      placeOfIssue: placeOfIssue || undefined,
    });

    if (success) {
      onClose();
    }
    return success;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit File Details"
      size="lg"
    >
      <ModalForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Update File"
        cancelLabel="Cancel"
      >
        <FormField label="File Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
            required
          />
        </FormField>

        <FormField label="Move to Folder" required>
          <select
            value={updateFileFolder}
            onChange={(e) => setUpdateFileFolder(e.target.value)}
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

        <FormField label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors bg-white"
          >
            <option value="">Select category...</option>
            <option value="Personal">Personal</option>
            <option value="Educational">Educational</option>
            <option value="Financial">Financial</option>
            <option value="Legal">Legal</option>
            <option value="Medical">Medical</option>
            <option value="Professional">Professional</option>
            <option value="Shared With me">Shared With me</option>
          </select>
        </FormField>

        <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
          <input
            type="checkbox"
            id="showRenewalFields"
            checked={showRenewalFields}
            onChange={(e) => setShowRenewalFields(e.target.checked)}
            className="w-4 h-4 text-[#9f1d35] border-gray-300 rounded focus:ring-[#9f1d35]"
          />
          <label htmlFor="showRenewalFields" className="text-sm font-medium text-gray-700">
            Add renewal, expiry date, and place of issue
          </label>
        </div>

        {showRenewalFields && (
          <>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <FormField label="Issue Date">
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
                />
              </FormField>
              <FormField label="Expiry Date">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
                />
              </FormField>
              <FormField label="Place of Issue">
                <input
                  type="text"
                  value={placeOfIssue}
                  onChange={(e) => setPlaceOfIssue(e.target.value)}
                  placeholder="Enter place"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
                />
              </FormField>
            </div>

            <FormField label="Renewal Date">
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
              />
            </FormField>
          </>
        )}
      </ModalForm>
    </BaseModal>
  );
}
