'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminDashboard } from './hooks/useAdminDashboard';
import { useCompanyHandlers } from './hooks/useCompanyHandlers';
import { useModalState } from './hooks/useModalState';
import AdminHeader from './components/AdminHeader';
import CompaniesSection from './components/CompaniesSection';
import CompanyModal from './modals/CompanyModal';
import FolderModal from './modals/FolderModal';
import UserModal from './modals/UserModal';
import EditFolderModal from './modals/EditFolderModal';
import FolderInfoModal from './modals/FolderInfoModal';
import ViewUsersModal from './modals/ViewUsersModal';
import LockFolderModal from './modals/LockFolderModal';
import UnlockFolderModal from './modals/UnlockFolderModal';
import { getAuth, checkIsAdmin } from '@/app/actions/auth';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // All hooks must be called before any conditional returns
  const {
    companies,
    setCompanies,
    filteredCompanies,
    companySearchTerm,
    setCompanySearchTerm,
    loadCompanies,
  } = useAdminDashboard();

  const companyHandlers = useCompanyHandlers(loadCompanies, setCompanies, companies);
  const modalState = useModalState();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const auth = await getAuth();
        if (!auth) {
          router.push('/admin/login');
          return;
        }

        // Only admin can access admin dashboard
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.success || !adminCheck.isAdmin) {
          toast.error('Access denied. Admin privileges required.');
          router.push('/admin/login');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking access:', error);
        router.push('/admin/login');
      }
    };

    checkAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f1d35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          onViewUsers={(company) => {
            companyHandlers.setSelectedCompany(company);
            modalState.setShowViewUsersModal(true);
          }}
          onDeleteCompany={companyHandlers.handleDeleteCompany}
          onEditFolder={handleEditFolderClick}
          onShowFolderInfo={handleShowFolderInfoClick}
          onDeleteFolder={companyHandlers.handleDeleteFolder}
          onLockFolder={companyHandlers.handleLockFolder}
          onUnlockFolder={companyHandlers.handleUnlockFolder}
          openFolderMenuId={companyHandlers.openFolderMenuId}
          setOpenFolderMenuId={companyHandlers.setOpenFolderMenuId}
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

      <ViewUsersModal
        isOpen={modalState.showViewUsersModal}
        onClose={() => {
          modalState.setShowViewUsersModal(false);
          companyHandlers.setSelectedCompany(null);
          companyHandlers.setUsers([]);
        }}
        selectedCompany={companyHandlers.selectedCompany}
        users={companyHandlers.users}
        onDeleteUser={companyHandlers.handleDeleteUser}
        onUpdateUser={companyHandlers.handleUpdateUser}
        onUpdateUserRole={companyHandlers.handleUpdateUserRole}
        loadUsers={companyHandlers.loadUsers}
      />

      <LockFolderModal
        isOpen={companyHandlers.lockingFolder !== null}
        onClose={() => {
          companyHandlers.setLockingFolder(null);
        }}
        folder={companyHandlers.lockingFolder}
        onSubmit={companyHandlers.handleLockFolderConfirm}
      />

      <UnlockFolderModal
        isOpen={companyHandlers.unlockingFolder !== null}
        onClose={() => {
          companyHandlers.setUnlockingFolder(null);
        }}
        folder={companyHandlers.unlockingFolder}
        onSubmit={companyHandlers.handleUnlockFolderConfirm}
        onUnlocked={companyHandlers.handleUnlocked}
      />
    </div>
  );
}
