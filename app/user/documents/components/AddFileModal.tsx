'use client';

import { useState } from 'react';
import BaseModal from '../../../admin/dashboard/components/BaseModal';
import FormField from '../../../admin/dashboard/components/FormField';
import { UploadButton } from '@/lib/uploadthing';
import { Upload } from 'lucide-react';
import { createFile } from '@/app/actions/file';
import toast from 'react-hot-toast';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId: string | null;
  onUploadComplete: (res: any, metadata?: any) => Promise<boolean>;
}

export default function AddFileModal({
  isOpen,
  onClose,
  currentFolderId,
  onUploadComplete,
}: AddFileModalProps) {
  const [documentName, setDocumentName] = useState('');
  const [showRenewalFields, setShowRenewalFields] = useState(false);
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [placeOfIssue, setPlaceOfIssue] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const handleUploadComplete = async (res: any) => {
    if (!res || !res[0] || !currentFolderId) {
      toast.error('Upload failed or no folder selected');
      setUploading(false);
      return;
    }

    const file = res[0];
    setUploadedFile(file);
    setUploading(false);
    toast.success('File uploaded! Please fill in the details and click Save.');
  };

  const handleSave = async () => {
    if (!uploadedFile || !currentFolderId) {
      toast.error('Please upload a file first');
      return;
    }

    if (!documentName.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    setSaving(true);

    try {
      const result = await createFile(
        documentName,
        currentFolderId,
        uploadedFile.url,
        uploadedFile.key || uploadedFile.fileKey,
        uploadedFile.size || 0,
        uploadedFile.type || uploadedFile.mimeType,
        category || undefined,
        issueDate || undefined,
        expiryDate || undefined,
        renewalDate || undefined,
        placeOfIssue || undefined
      );

      if (result.success) {
        toast.success('Document saved successfully!');
        // Reset form
        setDocumentName('');
        setShowRenewalFields(false);
        setIssueDate('');
        setExpiryDate('');
        setRenewalDate('');
        setPlaceOfIssue('');
        setCategory('');
        setUploadedFile(null);
        setSaving(false);
        await onUploadComplete([uploadedFile], {
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
          renewalDate: renewalDate || undefined,
          placeOfIssue: placeOfIssue || undefined,
          category: category || undefined,
        });
        onClose();
      } else {
        toast.error(result.error || 'Failed to save document');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Failed to save document');
      setSaving(false);
    }
  };

  const handleUploadError = (error: Error) => {
    toast.error(`Upload failed: ${error.message}`);
    setUploading(false);
  };

  const handleUploadBegin = () => {
    setUploading(true);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Document"
      size="lg"
    >
      <div className="space-y-5">
        {!currentFolderId ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Please navigate to a folder first before uploading documents.
            </p>
          </div>
        ) : (
          <>
            <FormField label="Document Name" required>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35] transition-colors"
                required
              />
            </FormField>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Upload className="w-5 h-5 text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Upload Document
                </label>
              </div>
              <div>
                <UploadButton
                  endpoint="fileUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  onUploadBegin={handleUploadBegin}
                />
              </div>
            </div>

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
                <option value="Certificate">Certificate</option>
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
          </>
        )}

        {uploadedFile && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 mb-2">
              ✓ File uploaded successfully: {uploadedFile.name}
            </p>
            <p className="text-xs text-green-700">
              Fill in the details above and click Save to complete.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading || saving}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {uploadedFile && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading || !documentName.trim()}
              className="flex-1 px-4 py-2.5 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Document'}
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

