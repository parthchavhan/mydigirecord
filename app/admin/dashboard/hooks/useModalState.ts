import { useState } from 'react';

export function useModalState() {
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [showFolderInfoModal, setShowFolderInfoModal] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showRenameFileModal, setShowRenameFileModal] = useState(false);
  const [showUpdateDetailsModal, setShowUpdateDetailsModal] = useState(false);
  const [showShareFileModal, setShowShareFileModal] = useState(false);
  const [showPasteFileModal, setShowPasteFileModal] = useState(false);

  return {
    showCompanyModal,
    setShowCompanyModal,
    showFolderModal,
    setShowFolderModal,
    showUserModal,
    setShowUserModal,
    showEditFolderModal,
    setShowEditFolderModal,
    showFolderInfoModal,
    setShowFolderInfoModal,
    showAddFileModal,
    setShowAddFileModal,
    showRenameFileModal,
    setShowRenameFileModal,
    showUpdateDetailsModal,
    setShowUpdateDetailsModal,
    showShareFileModal,
    setShowShareFileModal,
    showPasteFileModal,
    setShowPasteFileModal,
  };
}

