'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateFileDetails } from '@/app/actions/file';

interface EditFileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: any | null;
  onSuccess: () => void;
}

export default function EditFileDetailsModal({
  isOpen,
  onClose,
  file,
  onSuccess,
}: EditFileDetailsModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [showRenewalFields, setShowRenewalFields] = useState(false);
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [placeOfIssue, setPlaceOfIssue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name || '');
      setCategory(file.category || '');
      setIssueDate(file.issueDate ? new Date(file.issueDate).toISOString().split('T')[0] : '');
      setExpiryDate(file.expiryDate ? new Date(file.expiryDate).toISOString().split('T')[0] : '');
      setRenewalDate(file.renewalDate ? new Date(file.renewalDate).toISOString().split('T')[0] : '');
      setPlaceOfIssue(file.placeOfIssue || '');
      setShowRenewalFields(!!(file.issueDate || file.expiryDate || file.renewalDate || file.placeOfIssue));
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const result = await updateFileDetails(file.id, {
        name,
        category: category || undefined,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        renewalDate: renewalDate || undefined,
        placeOfIssue: placeOfIssue || undefined,
      });

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(result.error || 'Failed to update file details');
      }
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Failed to update file details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Edit File Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent bg-white"
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
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showRenewalFields"
              checked={showRenewalFields}
              onChange={(e) => setShowRenewalFields(e.target.checked)}
              className="w-4 h-4 text-[#9f1d35] border-gray-300 rounded focus:ring-[#9f1d35]"
            />
            <label htmlFor="showRenewalFields" className="text-sm font-medium text-gray-700">
              Add Issue/Expiry Information
            </label>
          </div>

          {showRenewalFields && (
            <>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Place of Issue
                  </label>
                  <input
                    type="text"
                    value={placeOfIssue}
                    onChange={(e) => setPlaceOfIssue(e.target.value)}
                    placeholder="Enter place"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renewal Date
                </label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

