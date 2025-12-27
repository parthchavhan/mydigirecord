import { useState } from 'react';
import toast from 'react-hot-toast';
import { createFile, deleteFile, updateFile, updateFileDetails, copyFile } from '@/app/actions/file';
import type { File } from '../types';

export function useFileHandlers(
  loadFiles: () => Promise<void>
) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileFolder, setSelectedFileFolder] = useState<string>('');
  const [renameFileName, setRenameFileName] = useState('');
  const [updateFileFolder, setUpdateFileFolder] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [openFileMenuId, setOpenFileMenuId] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<File | null>(null);

  const handleFileUploadComplete = async (res: any, metadata?: {
    documentName?: string;
    issueDate?: string;
    expiryDate?: string;
    renewalDate?: string;
    placeOfIssue?: string;
    category?: string;
  }) => {
    if (!res || !res[0]) {
      toast.error('Upload failed');
      setUploadingFile(false);
      return false;
    }

    const uploadedFile = res[0];
    if (!selectedFileFolder) {
      toast.error('Please select a folder');
      setUploadingFile(false);
      return false;
    }

    const result = await createFile(
      metadata?.documentName || uploadedFile.name,
      selectedFileFolder,
      uploadedFile.url,
      uploadedFile.key || uploadedFile.fileKey,
      uploadedFile.size || 0,
      uploadedFile.type || uploadedFile.mimeType,
      metadata?.category,
      metadata?.issueDate,
      metadata?.expiryDate,
      metadata?.renewalDate,
      metadata?.placeOfIssue
    );

    if (result.success) {
      toast.success('File uploaded successfully!');
      setSelectedFileFolder('');
      loadFiles();
      return true;
    } else {
      toast.error(result.error || 'Failed to save file');
      setUploadingFile(false);
      return false;
    }
  };

  const handleFileUploadError = (error: Error) => {
    toast.error(`Upload error: ${error.message}`);
    setUploadingFile(false);
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? It will be moved to bin and permanently deleted after 5 days.`)) {
      return;
    }

    const result = await deleteFile(fileId, false); // Soft delete
    if (result.success) {
      toast.success('File moved to bin!');
      setOpenFileMenuId(null);
      loadFiles();
    } else {
      toast.error(result.error || 'Failed to delete file');
    }
  };

  const handleRenameFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameFileName.trim() || !selectedFile) {
      toast.error('File name is required');
      return false;
    }

    const result = await updateFile(selectedFile.id, renameFileName);
    if (result.success) {
      toast.success('File renamed successfully!');
      setSelectedFile(null);
      setRenameFileName('');
      loadFiles();
      return true;
    } else {
      toast.error(result.error || 'Failed to rename file');
      return false;
    }
  };

  const handleUpdateFileDetails = async (data: any) => {
    if (!selectedFile || !data.folderId) {
      toast.error('Please select a folder');
      return false;
    }

    const result = await updateFileDetails(selectedFile.id, data);

    if (result.success) {
      toast.success('File details updated successfully!');
      setSelectedFile(null);
      setUpdateFileFolder('');
      loadFiles();
      return true;
    } else {
      toast.error(result.error || 'Failed to update file details');
      return false;
    }
  };

  const handleDownloadFile = (file: File) => {
    if (!file.url) {
      toast.error('File URL not available');
      return;
    }
    window.open(file.url, '_blank');
  };

  const handleShareFile = (file: File) => {
    if (!file.url) {
      toast.error('File URL not available');
      return;
    }
    navigator.clipboard.writeText(file.url);
    toast.success('File URL copied to clipboard!');
  };

  const handlePrintFile = (file: File) => {
    if (!file.url) {
      toast.error('File URL not available');
      return;
    }
    const printWindow = window.open(file.url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handlePasteFile = async (targetFolderId: string) => {
    if (!copiedFile) {
      toast.error('No file copied. Please copy a file first.');
      return false;
    }

    if (!targetFolderId) {
      toast.error('Please select a destination folder');
      return false;
    }

    const result = await copyFile(copiedFile.id, targetFolderId);
    
    if (result.success) {
      toast.success('File pasted successfully!');
      setCopiedFile(null); // Clear copied file after successful paste
      loadFiles();
      return true;
    } else {
      toast.error(result.error || 'Failed to paste file');
      return false;
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    selectedFileFolder,
    setSelectedFileFolder,
    renameFileName,
    setRenameFileName,
    updateFileFolder,
    setUpdateFileFolder,
    uploadingFile,
    setUploadingFile,
    openFileMenuId,
    setOpenFileMenuId,
    handleFileUploadComplete,
    handleFileUploadError,
    handleDeleteFile,
    handleRenameFile,
    handleUpdateFileDetails,
    handleDownloadFile,
    handleShareFile,
    handlePrintFile,
    copiedFile,
    setCopiedFile,
    handlePasteFile,
  };
}

