import { useState, useEffect } from 'react';
import type React from 'react';
import toast from 'react-hot-toast';
import { createCompany, deleteCompany, updateCompanyAiChat } from '@/app/actions/company';
import { createFolder, deleteFolder, updateFolder, getFolderStats, lockFolder, unlockFolder } from '@/app/actions/folder';
import { createUser, getUsersByCompany, deleteUser, updateUser, updateUserRole } from '@/app/actions/user';
import { getFoldersByCompany } from '@/app/actions/folder';
import type { Company, Folder } from '../types';

export function useCompanyHandlers(
  loadCompanies: () => Promise<void>,
  setCompanies?: React.Dispatch<React.SetStateAction<Company[]>>,
  companies?: Company[]
) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [folderName, setFolderName] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [infoFolder, setInfoFolder] = useState<Folder | null>(null);
  const [folderStats, setFolderStats] = useState<any | null>(null);
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [lockingFolder, setLockingFolder] = useState<Folder | null>(null);
  const [unlockingFolder, setUnlockingFolder] = useState<Folder | null>(null);
  // Track unlocked folders with their unlock timestamps (for auto-lock after 5 minutes)
  const [unlockedFolders, setUnlockedFolders] = useState<Map<string, { unlockTime: number; password: string }>>(new Map());

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return false;
    }

    if (!companyType) {
      toast.error('Company type is required');
      return false;
    }

    try {
      const result = await createCompany(companyName, companyType);
      if (result.success) {
        toast.success('Company created successfully!');
        setCompanyName('');
        setCompanyType('');
        await loadCompanies();
        return true;
      } else {
        toast.error(result.error || 'Failed to create company');
        return false;
      }
    } catch (error) {
      console.error('Error in handleCreateCompany:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return false;
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || !selectedCompany) {
      toast.error('Folder name is required');
      return false;
    }

    const result = await createFolder(folderName, selectedCompany.id, null);
    if (result.success) {
      toast.success('Folder created successfully!');
      setFolderName('');
      setSelectedCompany(null);
      loadCompanies();
      return true;
    } else {
      toast.error(result.error || 'Failed to create folder');
      return false;
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !userPassword.trim() || !selectedCompany) {
      toast.error('All fields are required');
      return false;
    }

    const result = await createUser(userName, userEmail, userPassword, selectedCompany.id);
    if (result.success) {
      toast.success('User created successfully!');
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setSelectedCompany(null);
      return true;
    } else {
      toast.error(result.error || 'Failed to create user');
      return false;
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This will delete all associated users, folders, and files. This action cannot be undone.`)) {
      return;
    }

    const result = await deleteCompany(companyId);
    if (result.success) {
      toast.success('Company deleted successfully!');
      loadCompanies();
    } else {
      toast.error(result.error || 'Failed to delete company');
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete "${folderName}"? This will delete all subfolders and files inside. This action cannot be undone.`)) {
      return;
    }

    const result = await deleteFolder(folderId);
    if (result.success) {
      toast.success('Folder deleted successfully!');
      setOpenFolderMenuId(null);
      loadCompanies();
    } else {
      toast.error(result.error || 'Failed to delete folder');
    }
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setOpenFolderMenuId(null);
    return true;
  };

  const handleUpdateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFolderName.trim() || !editingFolder) {
      toast.error('Folder name is required');
      return false;
    }

    const result = await updateFolder(editingFolder.id, editFolderName);
    if (result.success) {
      toast.success('Folder renamed successfully!');
      setEditingFolder(null);
      setEditFolderName('');
      loadCompanies();
      return true;
    } else {
      toast.error(result.error || 'Failed to update folder');
      return false;
    }
  };

  const handleShowFolderInfo = async (folder: Folder) => {
    setInfoFolder(folder);
    setOpenFolderMenuId(null);
    
    const result = await getFolderStats(folder.id);
    if (result.success) {
      setFolderStats(result.stats);
      return true;
    } else {
      toast.error(result.error || 'Failed to load folder statistics');
      return false;
    }
  };

  const loadFolders = async (companyId: string) => {
    const result = await getFoldersByCompany(companyId);
    if (result.success) {
      setAvailableFolders(result.folders || []);
    }
  };

  const loadUsers = async (companyId: string) => {
    const result = await getUsersByCompany(companyId);
    if (result.success) {
      setUsers(result.users || []);
    } else {
      toast.error(result.error || 'Failed to load users');
      setUsers([]);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      toast.success('User deleted successfully!');
      if (selectedCompany) {
        await loadUsers(selectedCompany.id);
      }
    } else {
      toast.error(result.error || 'Failed to delete user');
    }
  };

  const handleUpdateUser = async (userId: string, email: string, password: string) => {
    if (!selectedCompany) {
      toast.error('No company selected');
      return false;
    }

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required');
      return false;
    }

    const result = await updateUser(userId, email, password, selectedCompany.id);
    if (result.success) {
      toast.success('User updated successfully!');
      await loadUsers(selectedCompany.id);
      return true;
    } else {
      toast.error(result.error || 'Failed to update user');
      return false;
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    const result = await updateUserRole(userId, role);
    if (result.success) {
      toast.success('User role updated successfully!');
      if (selectedCompany) {
        await loadUsers(selectedCompany.id);
      }
      return true;
    } else {
      toast.error(result.error || 'Failed to update user role');
      return false;
    }
  };

  const handleLockFolder = (folder: Folder) => {
    setLockingFolder(folder);
    setOpenFolderMenuId(null);
  };

  const handleUnlockFolder = (folder: Folder) => {
    setUnlockingFolder(folder);
    setOpenFolderMenuId(null);
  };

  const handleLockFolderConfirm = async (password: string) => {
    if (!lockingFolder) return false;
    const result = await lockFolder(lockingFolder.id, password);
    if (result.success) {
      // Optimistically update UI immediately
      if (setCompanies && companies) {
        setCompanies(prevCompanies =>
          prevCompanies.map(company => ({
            ...company,
            folders: company.folders.map(folder =>
              folder.id === lockingFolder.id
                ? { ...folder, isLocked: true, password }
                : folder
            ),
          }))
        );
      }
      toast.success('Folder locked successfully!');
      setLockingFolder(null);
      loadCompanies();
      return true;
    } else {
      toast.error(result.error || 'Failed to lock folder');
      return false;
    }
  };

  const handleUnlockFolderConfirm = async (password: string) => {
    if (!unlockingFolder) return false;
    const result = await unlockFolder(unlockingFolder.id, password);
    if (result.success) {
      toast.success('Folder unlocked successfully!');
      // Track unlocked folder with timestamp
      setUnlockedFolders(prev => {
        const newMap = new Map(prev);
        newMap.set(unlockingFolder.id, {
          unlockTime: Date.now(),
          password: password,
        });
        return newMap;
      });
      setUnlockingFolder(null);
      loadCompanies();
      return true;
    } else {
      toast.error(result.error || 'Failed to unlock folder');
      return false;
    }
  };

  const handleToggleAiChat = async (company: Company) => {
    const enabled = !company.aiChatEnabled;
    const result = await updateCompanyAiChat(company.id, enabled);
    if (result.success) {
      toast.success(enabled ? 'AI Chat enabled for this company' : 'AI Chat disabled for this company');
      if (setCompanies && companies) {
        setCompanies(prev =>
          prev.map(c => (c.id === company.id ? { ...c, aiChatEnabled: enabled } : c))
        );
      }
      loadCompanies();
    } else {
      toast.error(result.error || 'Failed to update AI Chat setting');
    }
  };

  const handleUnlocked = (folderId: string, password: string) => {
    // Track unlocked folder with timestamp
    setUnlockedFolders(prev => {
      const newMap = new Map(prev);
      newMap.set(folderId, {
        unlockTime: Date.now(),
        password: password,
      });
      return newMap;
    });
  };

  // Auto-lock folders after 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      const foldersToLock: Array<{ folderId: string; password: string }> = [];
      
      setUnlockedFolders(prev => {
        const newMap = new Map(prev);
        
        for (const [folderId, data] of prev.entries()) {
          if (now - data.unlockTime >= fiveMinutes) {
            foldersToLock.push({ folderId, password: data.password });
            newMap.delete(folderId);
          }
        }
        
        return newMap;
      });

      // Lock folders that exceeded 5 minutes
      if (foldersToLock.length > 0) {
        for (const { folderId, password } of foldersToLock) {
          const result = await lockFolder(folderId, password);
          if (result.success) {
            toast.success('Folder automatically locked after 5 minutes');
          }
        }
        loadCompanies();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [loadCompanies]);

  return {
    selectedCompany,
    setSelectedCompany,
    companyName,
    setCompanyName,
    companyType,
    setCompanyType,
    folderName,
    setFolderName,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userPassword,
    setUserPassword,
    openFolderMenuId,
    setOpenFolderMenuId,
    editingFolder,
    setEditingFolder,
    editFolderName,
    setEditFolderName,
    infoFolder,
    setInfoFolder,
    folderStats,
    setFolderStats,
    availableFolders,
    handleCreateCompany,
    handleCreateFolder,
    handleCreateUser,
    handleDeleteCompany,
    handleDeleteFolder,
    handleEditFolder,
    handleUpdateFolder,
    handleShowFolderInfo,
    loadFolders,
    users,
    setUsers,
    loadUsers,
    handleDeleteUser,
    handleUpdateUser,
    handleUpdateUserRole,
    lockingFolder,
    setLockingFolder,
    unlockingFolder,
    setUnlockingFolder,
    handleLockFolder,
    handleUnlockFolder,
    handleLockFolderConfirm,
    handleUnlockFolderConfirm,
    handleUnlocked,
    handleToggleAiChat,
  };
}


