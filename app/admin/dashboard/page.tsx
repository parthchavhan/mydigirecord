'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAdminDashboard } from './hooks/useAdminDashboard';
import { useCompanyHandlers } from './hooks/useCompanyHandlers';
import { useFileHandlers } from './hooks/useFileHandlers';
import { useModalState } from './hooks/useModalState';
import AdminHeader from './components/AdminHeader';
import CompaniesSection from './components/CompaniesSection';
import FileManagementSection from './components/FileManagementSection';
import CompanyModal from './modals/CompanyModal';
import FolderModal from './modals/FolderModal';
import UserModal from './modals/UserModal';
import EditFolderModal from './modals/EditFolderModal';
import FolderInfoModal from './modals/FolderInfoModal';
import AddFileModal from './modals/AddFileModal';
import RenameFileModal from './modals/RenameFileModal';
import UpdateFileDetailsModal from './modals/UpdateFileDetailsModal';
import ShareFileModal from './modals/ShareFileModal';
import PasteFileModal from './modals/PasteFileModal';
import DocumentViewerModal from './modals/DocumentViewerModal';

export default function AdminDashboard() {
  const {
    companies,
    filteredCompanies,
    companySearchTerm,
    setCompanySearchTerm,
    files,
    filteredFiles,
    fileSearchTerm,
    setFileSearchTerm,
    loadCompanies,
    loadFiles,
  } = useAdminDashboard();

  const companyHandlers = useCompanyHandlers(loadCompanies);
  const fileHandlers = useFileHandlers(loadFiles);
  const modalState = useModalState();
  const [viewingFile, setViewingFile] = useState<any | null>(null);

  const handleOpenAddFileModal = () => {
    if (companies.length === 0) {
      toast.error('Please create a company first');
      return;
    }
    modalState.setShowAddFileModal(true);
  };

  const handleEditFolderClick = (folder: any) => {
    if (companyHandlers.handleEditFolder(folder)) {
      modalState.setShowEditFolderModal(true);
    }
  };

  const handleShowFolderInfoClick = async (folder: any) => {
    const success = await companyHandlers.handleShowFolderInfo(folder);
    if (success) {
      modalState.setShowFolderInfoModal(true);
    }
  };

  const handleRenameFileClick = (file: any) => {
    fileHandlers.setSelectedFile(file);
    fileHandlers.setRenameFileName(file.name);
    modalState.setShowRenameFileModal(true);
  };

  const handleUpdateFileDetailsClick = (file: any) => {
    fileHandlers.setSelectedFile(file);
    fileHandlers.setUpdateFileFolder(file.folderId);
    if (file.folder?.companyId) {
      companyHandlers.loadFolders(file.folder.companyId);
    }
    modalState.setShowUpdateDetailsModal(true);
  };

  const handleShareFileClick = (file: any) => {
    fileHandlers.setSelectedFile(file);
    modalState.setShowShareFileModal(true);
  };


  const handleRenameFileWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await fileHandlers.handleRenameFile(e);
    if (success) {
      modalState.setShowRenameFileModal(false);
    }
    return success || false;
  };

  const handleUpdateFileDetailsWrapper = async (data: any) => {
    const success = await fileHandlers.handleUpdateFileDetails(data);
    if (success) {
      modalState.setShowUpdateDetailsModal(false);
    }
    return success || false;
  };

  const handleShareFileWrapper = (file: any) => {
    fileHandlers.handleShareFile(file);
    modalState.setShowShareFileModal(false);
    fileHandlers.setSelectedFile(null);
  };

  const handleViewFile = (file: any) => {
    setViewingFile(file);
  };

  const handleEditFile = (file: any) => {
    handleUpdateFileDetailsClick(file);
  };

  const handleCopyFile = (file: any) => {
    fileHandlers.setCopiedFile(file);
    toast.success('File copied! Use Paste in the destination folder to duplicate it.');
  };

  const handlePasteFileClick = () => {
    if (!fileHandlers.copiedFile) {
      toast.error('No file copied. Please copy a file first.');
      return;
    }
    modalState.setShowPasteFileModal(true);
  };

  const handlePasteFileWrapper = async (targetFolderId: string): Promise<boolean> => {
    const success = await fileHandlers.handlePasteFile(targetFolderId);
    if (success) {
      modalState.setShowPasteFileModal(false);
    }
    return success;
  };

  const handleFileUploadCompleteWrapper = async (res: any, metadata?: any): Promise<boolean> => {
    const success = await fileHandlers.handleFileUploadComplete(res, metadata);
    if (success) {
      modalState.setShowAddFileModal(false);
      fileHandlers.setUploadingFile(false);
    }
    return success || false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompaniesSection
          companies={companies}
          filteredCompanies={filteredCompanies}
          companySearchTerm={companySearchTerm}
          setCompanySearchTerm={setCompanySearchTerm}
          onShowCompanyModal={() => modalState.setShowCompanyModal(true)}
          onSelectCompany={companyHandlers.setSelectedCompany}
          onShowUserModal={(company) => {
            companyHandlers.setSelectedCompany(company);
            modalState.setShowUserModal(true);
          }}
          onShowFolderModal={(company) => {
            companyHandlers.setSelectedCompany(company);
            modalState.setShowFolderModal(true);
          }}
          onDeleteCompany={companyHandlers.handleDeleteCompany}
          onEditFolder={handleEditFolderClick}
          onShowFolderInfo={handleShowFolderInfoClick}
          onDeleteFolder={companyHandlers.handleDeleteFolder}
          openFolderMenuId={companyHandlers.openFolderMenuId}
          setOpenFolderMenuId={companyHandlers.setOpenFolderMenuId}
        />

        <FileManagementSection
          files={files}
          filteredFiles={filteredFiles}
          fileSearchTerm={fileSearchTerm}
          setFileSearchTerm={setFileSearchTerm}
          onOpenAddFileModal={handleOpenAddFileModal}
          onRenameFile={handleRenameFileClick}
          onUpdateFileDetails={handleUpdateFileDetailsClick}
          onDownloadFile={fileHandlers.handleDownloadFile}
          onShareFile={handleShareFileClick}
          onPrintFile={fileHandlers.handlePrintFile}
          onDeleteFile={fileHandlers.handleDeleteFile}
          onViewFile={handleViewFile}
          onEditFile={handleEditFile}
          onCopyFile={handleCopyFile}
          onPasteFile={handlePasteFileClick}
          copiedFile={fileHandlers.copiedFile}
          openFileMenuId={fileHandlers.openFileMenuId}
          setOpenFileMenuId={fileHandlers.setOpenFileMenuId}
          loadFolders={companyHandlers.loadFolders}
        />
      </main>

      {/* Modals */}
      <CompanyModal
        isOpen={modalState.showCompanyModal}
        onClose={() => {
          modalState.setShowCompanyModal(false);
          companyHandlers.setCompanyName('');
        }}
        companyName={companyHandlers.companyName}
        setCompanyName={companyHandlers.setCompanyName}
        onSubmit={async (e) => {
          const success = await companyHandlers.handleCreateCompany(e);
          return success || false;
        }}
      />

      <FolderModal
        isOpen={modalState.showFolderModal}
        onClose={() => {
          modalState.setShowFolderModal(false);
          companyHandlers.setSelectedCompany(null);
          companyHandlers.setFolderName('');
        }}
        selectedCompany={companyHandlers.selectedCompany}
        folderName={companyHandlers.folderName}
        setFolderName={companyHandlers.setFolderName}
        onSubmit={async (e) => {
          const success = await companyHandlers.handleCreateFolder(e);
          return success || false;
        }}
      />

      <UserModal
        isOpen={modalState.showUserModal}
        onClose={() => {
          modalState.setShowUserModal(false);
          companyHandlers.setSelectedCompany(null);
          companyHandlers.setUserName('');
          companyHandlers.setUserEmail('');
          companyHandlers.setUserPassword('');
        }}
        selectedCompany={companyHandlers.selectedCompany}
        userName={companyHandlers.userName}
        setUserName={companyHandlers.setUserName}
        userEmail={companyHandlers.userEmail}
        setUserEmail={companyHandlers.setUserEmail}
        userPassword={companyHandlers.userPassword}
        setUserPassword={companyHandlers.setUserPassword}
        onSubmit={async (e) => {
          const success = await companyHandlers.handleCreateUser(e);
          return success || false;
        }}
      />

      <EditFolderModal
        isOpen={modalState.showEditFolderModal}
        onClose={() => {
          modalState.setShowEditFolderModal(false);
          companyHandlers.setEditingFolder(null);
          companyHandlers.setEditFolderName('');
        }}
        editingFolder={companyHandlers.editingFolder}
        editFolderName={companyHandlers.editFolderName}
        setEditFolderName={companyHandlers.setEditFolderName}
        onSubmit={async (e) => {
          const success = await companyHandlers.handleUpdateFolder(e);
          return success || false;
        }}
      />

      <FolderInfoModal
        isOpen={modalState.showFolderInfoModal}
        onClose={() => {
          modalState.setShowFolderInfoModal(false);
          companyHandlers.setInfoFolder(null);
          companyHandlers.setFolderStats(null);
        }}
        infoFolder={companyHandlers.infoFolder}
        folderStats={companyHandlers.folderStats}
      />

      <AddFileModal
        isOpen={modalState.showAddFileModal}
        onClose={() => {
          modalState.setShowAddFileModal(false);
          fileHandlers.setSelectedFileFolder('');
        }}
        companies={companies}
        selectedFileFolder={fileHandlers.selectedFileFolder}
        setSelectedFileFolder={fileHandlers.setSelectedFileFolder}
        onUploadComplete={handleFileUploadCompleteWrapper}
        onUploadError={fileHandlers.handleFileUploadError}
        onUploadBegin={() => fileHandlers.setUploadingFile(true)}
        loadFolders={companyHandlers.loadFolders}
      />

      <RenameFileModal
        isOpen={modalState.showRenameFileModal}
        onClose={() => {
          modalState.setShowRenameFileModal(false);
          fileHandlers.setSelectedFile(null);
          fileHandlers.setRenameFileName('');
        }}
        renameFileName={fileHandlers.renameFileName}
        setRenameFileName={fileHandlers.setRenameFileName}
        onSubmit={handleRenameFileWrapper}
      />

      <UpdateFileDetailsModal
        isOpen={modalState.showUpdateDetailsModal}
        onClose={() => {
          modalState.setShowUpdateDetailsModal(false);
          fileHandlers.setSelectedFile(null);
          fileHandlers.setUpdateFileFolder('');
        }}
        companies={companies}
        selectedFile={fileHandlers.selectedFile}
        updateFileFolder={fileHandlers.updateFileFolder}
        setUpdateFileFolder={fileHandlers.setUpdateFileFolder}
        onSubmit={handleUpdateFileDetailsWrapper}
      />

      <ShareFileModal
        isOpen={modalState.showShareFileModal}
        onClose={() => {
          modalState.setShowShareFileModal(false);
          fileHandlers.setSelectedFile(null);
        }}
        selectedFile={fileHandlers.selectedFile}
        onShare={handleShareFileWrapper}
      />

      <PasteFileModal
        isOpen={modalState.showPasteFileModal}
        onClose={() => {
          modalState.setShowPasteFileModal(false);
        }}
        companies={companies}
        copiedFileName={fileHandlers.copiedFile?.name || ''}
        onPaste={handlePasteFileWrapper}
        loadFolders={companyHandlers.loadFolders}
      />

      <DocumentViewerModal
        isOpen={viewingFile !== null}
        onClose={() => setViewingFile(null)}
        file={viewingFile}
      />
    </div>
  );
}
