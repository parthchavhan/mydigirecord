'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, File, FolderPlus, LogOut, ChevronRight, Home, Upload, Search, Filter, Trash2, MoreVertical, Edit, Info, X, Eye, Copy, Clipboard, Move, Share2, CheckSquare, Square, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import { logout, getAuth } from '@/app/actions/auth';
import { getCompany } from '@/app/actions/company';
import { getFolderWithChildren } from '@/app/actions/dashboard';
import { createFolder, deleteFolder, updateFolder, getFolderStats, getFoldersByCompany, lockFolder, unlockFolder, getAllFoldersFlat } from '@/app/actions/folder';
import { deleteFile, updateFile, getFilesByCompany, copyFile, getFileById, moveFile } from '@/app/actions/file';
import { globalSearch } from '@/app/actions/search';
import toast from 'react-hot-toast';
import AddFileModal from './components/AddFileModal';
import { createFile } from '@/app/actions/file';
import DocumentViewerModal from '../../admin/dashboard/modals/DocumentViewerModal';
import EditFileDetailsModal from './components/EditFileDetailsModal';
import LockFolderModal from '../../admin/dashboard/modals/LockFolderModal';
import UnlockFolderModal from '../../admin/dashboard/modals/UnlockFolderModal';
import FolderPasswordModal from './components/FolderPasswordModal';
import { checkIsAdmin } from '@/app/actions/auth';
import { verifyFolderPassword } from '@/app/actions/folder';

interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'company' | 'folder';
}

export default function DocumentsPage() {
  const router = useRouter();
  const [company, setCompany] = useState<any | null>(null);
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([]);
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'folders' | 'files'>('all');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [infoItem, setInfoItem] = useState<any | null>(null);
  const [folderStats, setFolderStats] = useState<any | null>(null);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [documentCount, setDocumentCount] = useState(0);
  const [viewingFile, setViewingFile] = useState<any | null>(null);
  const [copiedFile, setCopiedFile] = useState<any | null>(null);
  const [copiedBulkItems, setCopiedBulkItems] = useState<any[]>([]);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<any[]>([]);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [editingFileDetails, setEditingFileDetails] = useState<any | null>(null);
  const [fileDetails, setFileDetails] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [movedFile, setMovedFile] = useState<any | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileToShare, setFileToShare] = useState<any | null>(null);
  const [lockingFolder, setLockingFolder] = useState<any | null>(null);
  const [unlockingFolder, setUnlockingFolder] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordPromptFolder, setPasswordPromptFolder] = useState<any | null>(null);
  // Store verified folders with their passwords: Map<folderId, password>
  const [verifiedFolders, setVerifiedFolders] = useState<Map<string, string>>(new Map());
  // Track unlocked folders with their unlock timestamps (for auto-lock after 5 minutes)
  const [unlockedFolders, setUnlockedFolders] = useState<Map<string, { unlockTime: number; password: string }>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      try {
        const auth = await getAuth();
        // Allow users with any role (user, admin, super_admin) to access documents
        // But exclude the main admin account (userId === 'admin')
        if (!auth || !auth.companyId || auth.userId === 'admin') {
          router.push('/user/login');
          return;
        }

        const result = await getCompany(auth.companyId);
        if (!result.success || !result.company) {
          toast.error('Company not found');
          router.push('/user/login');
          return;
        }

        const companyData = result.company;
        setCompany(companyData);
        setCurrentPath([{ id: companyData.id, name: companyData.name, type: 'company' }]);
        const items = companyData.folders || [];
        setCurrentItems(items);
        setFilteredItems(items);
        setCurrentFolderId(null);

        // Load all files for the company for document count
        const filesResult = await getFilesByCompany(auth.companyId);
        if (filesResult.success) {
          setAllFiles(filesResult.files || []);
          setDocumentCount(filesResult.files?.length || 0);
        }

        // Check if user is admin
        const adminCheck = await checkIsAdmin();
        setIsAdmin(adminCheck.success && adminCheck.isAdmin);
      } catch (error) {
        console.error('Error loading documents:', error);
        router.push('/user/login');
      }
    };
    loadData();
  }, [router]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm && searchTerm.trim().length > 0 && company) {
        setIsGlobalSearch(true);
        try {
          const result = await globalSearch(company.id, searchTerm.trim());
        if (result.success) {
          setGlobalSearchResults(result.results || []);
          } else {
            console.error('Search error:', result.error);
            setGlobalSearchResults([]);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setIsGlobalSearch(false);
          setGlobalSearchResults([]);
        }
      } else {
        setIsGlobalSearch(false);
        setGlobalSearchResults([]);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
    if (searchTerm && searchTerm.trim().length > 2) {
      performSearch();
    } else {
      setIsGlobalSearch(false);
      setGlobalSearchResults([]);
    }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, company]);

  useEffect(() => {
    if (isGlobalSearch) {
      let filtered = globalSearchResults;
      if (filterType === 'folders') {
        filtered = filtered.filter((item) => item.type === 'folder');
      } else if (filterType === 'files') {
        filtered = filtered.filter((item) => item.type === 'file');
      }
      setFilteredItems(filtered);
    } else {
      let filtered = currentItems;
      if (searchTerm) {
        filtered = filtered.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (filterType === 'folders') {
        filtered = filtered.filter((item) => 'other_folders' in item || 'parentId' in item);
      } else if (filterType === 'files') {
        filtered = filtered.filter((item) => !('other_folders' in item) && !('parentId' in item));
      }
      setFilteredItems(filtered);
    }
  }, [currentItems, searchTerm, filterType, isGlobalSearch, globalSearchResults]);

  const navigateToFolder = async (folderId: string) => {
    if (!company) return;

    // Check if folder is locked and not yet verified
    const folderItem = currentItems.find(item => {
      const isFolder = 'other_folders' in item || 'parentId' in item;
      return isFolder && item.id === folderId;
    });

    // Get password if folder is already verified
    const verifiedPassword = verifiedFolders.get(folderId);
    
    if (folderItem && folderItem.isLocked && !verifiedPassword) {
      // Show password prompt
      setPasswordPromptFolder(folderItem);
      return;
    }

    // Pass password if folder is verified
    const result = await getFolderWithChildren(folderId, company.id, verifiedPassword);
    
    // If password is required and no folder returned, show password prompt
    if (result.requiresPassword && !result.folder) {
      const folder = folderItem || { id: folderId, name: 'Folder' };
      setPasswordPromptFolder(folder);
      return;
    }

    // If password is required but folder structure is returned (nested folders visible)
    if (result.requiresPassword && result.folder) {
      // Show nested folders (they are visible) but still require password for full access
    const folder = result.folder;
      const newPath: BreadcrumbItem[] = [...currentPath, { id: folder.id, name: folder.name, type: 'folder' as const }];
      setCurrentPath(newPath);
      
      // Show nested folders (visible even when locked) but no files without password
      const items: any[] = [
        ...(folder.other_folders || []),
        ...(folder.files || []),
      ];
      setCurrentItems(items);
      setFilteredItems(items);
      setCurrentFolderId(folder.id);
      
      // Don't show password prompt again if we're already showing nested folders
      // User can click nested folders or enter password via the lock icon if needed
      return;
    }

    if (!result.success || !result.folder) {
      toast.error(result.error || 'Folder not found');
      return;
    }

    const folder = result.folder;
    const newPath: BreadcrumbItem[] = [...currentPath, { id: folder.id, name: folder.name, type: 'folder' as const }];
    setCurrentPath(newPath);
    
    const items: any[] = [
      ...(folder.other_folders || []),
      ...(folder.files || []),
    ];
    setCurrentItems(items);
    setFilteredItems(items);
    setCurrentFolderId(folder.id);
  };

  const handleFolderPasswordSubmit = async (password: string) => {
    if (!passwordPromptFolder || !company) return false;

    const result = await verifyFolderPassword(passwordPromptFolder.id, password);
    if (result.success && result.verified) {
      // Store password for verified folder
      setVerifiedFolders((prev: Map<string, string>) => {
        const newMap = new Map<string, string>(prev);
        newMap.set(passwordPromptFolder.id, password);
        return newMap;
      });
      
      // Now navigate to the folder with password
      const folderResult = await getFolderWithChildren(passwordPromptFolder.id, company.id, password);
      if (folderResult.success && folderResult.folder) {
        const folder = folderResult.folder;
        const newPath: BreadcrumbItem[] = [...currentPath, { id: folder.id, name: folder.name, type: 'folder' as const }];
        setCurrentPath(newPath);
        
        const items: any[] = [
          ...(folder.other_folders || []),
          ...(folder.files || []),
        ];
        setCurrentItems(items);
        setFilteredItems(items);
        setCurrentFolderId(folder.id);
        setPasswordPromptFolder(null);
        return true;
      }
      return false;
    } else {
      return false;
    }
  };

  const navigateToBreadcrumb = async (index: number) => {
    if (!company) return;

    // Clear verification for folders we are leaving
    const removedFolders = currentPath.slice(index + 1);
    if (removedFolders.length > 0) {
      setVerifiedFolders(prev => {
        const newMap = new Map(prev);
        removedFolders.forEach(folder => {
          if (folder.type === 'folder') {
            newMap.delete(folder.id);
          }
        });
        return newMap;
      });
      
      // Also clear from unlockedFolders tracking
      setUnlockedFolders(prev => {
        const newMap = new Map(prev);
        removedFolders.forEach(folder => {
          if (folder.type === 'folder') {
            newMap.delete(folder.id);
          }
        });
        return newMap;
      });
    }

    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);

    if (index === 0) {
      const result = await getCompany(company.id);
      if (result.success && result.company) {
        setCompany(result.company);
        const items = result.company.folders || [];
        setCurrentItems(items);
        setFilteredItems(items);
        setCurrentFolderId(null);
      }
    } else {
      const folderId = newPath[newPath.length - 1].id;
      // Get password if folder is verified
      const verifiedPassword = verifiedFolders.get(folderId);
      const result = await getFolderWithChildren(folderId, company.id, verifiedPassword);
      
      // If password is required, show password prompt
      if (result.requiresPassword) {
        toast.error('Password required to access this folder');
        // Reload current view
        refreshView();
        return;
      }
      
      if (result.success && result.folder) {
        const folder = result.folder;
        const items: any[] = [
          ...(folder.other_folders || []),
          ...(folder.files || []),
        ];
        setCurrentItems(items);
        setFilteredItems(items);
        setCurrentFolderId(folder.id);
      }
    }
  };

  const refreshView = async () => {
    if (!company) return;
    
    if (currentFolderId === null) {
      const result = await getCompany(company.id);
      if (result.success && result.company) {
        setCompany(result.company);
        const items = result.company.folders || [];
        setCurrentItems(items);
        setFilteredItems(items);
      }
    } else {
      // Get password if folder is verified
      const verifiedPassword = verifiedFolders.get(currentFolderId);
      const result = await getFolderWithChildren(currentFolderId, company.id, verifiedPassword);
      
      // If password is required but not available, clear the folder view
      if (result.requiresPassword) {
        // Go back to company root if password is required
        const companyResult = await getCompany(company.id);
        if (companyResult.success && companyResult.company) {
          setCompany(companyResult.company);
          const items = companyResult.company.folders || [];
          setCurrentItems(items);
          setFilteredItems(items);
          setCurrentFolderId(null);
          setCurrentPath([{ id: company.id, name: company.name, type: 'company' }]);
          toast.error('Password required to access this folder');
        }
        return;
      }
      
      if (result.success && result.folder) {
        const folder = result.folder;
        const items: any[] = [
          ...(folder.other_folders || []),
          ...(folder.files || []),
        ];
        setCurrentItems(items);
        setFilteredItems(items);
      }
    }

    // Refresh document count
    const auth = await getAuth();
    if (auth?.companyId) {
      const filesResult = await getFilesByCompany(auth.companyId);
      if (filesResult.success) {
        setAllFiles(filesResult.files || []);
        setDocumentCount(filesResult.files?.length || 0);
      }
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || !company || currentFolderId === null) {
      toast.error('Folder name is required and you must be in a folder');
      return;
    }

    const result = await createFolder(folderName, company.id, currentFolderId);
    if (result.success) {
      toast.success('Folder created successfully!');
      setFolderName('');
      setShowFolderModal(false);
      refreshView();
    } else {
      toast.error(result.error || 'Failed to create folder');
    }
  };

  const handleFileUploadComplete = async (res: any, metadata?: any): Promise<boolean> => {
    // This will be handled by the AddFileModal component
    await refreshView();
    return true;
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete "${folderName}"? This will delete all subfolders and files inside. This action cannot be undone.`)) {
      return;
    }

    const result = await deleteFolder(folderId);
    if (result.success) {
      toast.success('Folder deleted successfully!');
      setOpenMenuId(null);
      refreshView();
    } else {
      toast.error(result.error || 'Failed to delete folder');
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? It will be moved to bin and permanently deleted after 30 days.`)) {
      return;
    }

    const result = await deleteFile(fileId, false); // Soft delete
    if (result.success) {
      toast.success('File moved to bin!');
      setOpenMenuId(null);
      refreshView();
    } else {
      toast.error(result.error || 'Failed to delete file');
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditName(item.name);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName.trim()) return;

    const isFolder = 'other_folders' in editingItem || 'parentId' in editingItem;
    const result = isFolder
      ? await updateFolder(editingItem.id, editName)
      : await updateFile(editingItem.id, editName);

    if (result.success) {
      toast.success(`${isFolder ? 'Folder' : 'File'} renamed successfully!`);
      setShowEditModal(false);
      setEditingItem(null);
      setEditName('');
      refreshView();
    } else {
      toast.error(result.error || `Failed to rename ${isFolder ? 'folder' : 'file'}`);
    }
  };

  const handleLockFolder = (folder: any) => {
    setLockingFolder(folder);
    setOpenMenuId(null);
  };

  const handleUnlockFolder = (folder: any) => {
    setUnlockingFolder(folder);
    setOpenMenuId(null);
  };

  const handleLockFolderConfirm = async (password: string) => {
    if (!lockingFolder) return false;
    const result = await lockFolder(lockingFolder.id, password);
    if (result.success) {
      // Optimistically update UI immediately
      setCurrentItems(prevItems => 
        prevItems.map(item => 
          item.id === lockingFolder.id 
            ? { ...item, isLocked: true, password }
            : item
        )
      );
      setFilteredItems(prevItems => 
        prevItems.map(item => 
          item.id === lockingFolder.id 
            ? { ...item, isLocked: true, password }
            : item
        )
      );
      
      // Also update company state if we're at root level
      if (currentFolderId === null && company) {
        setCompany((prevCompany: any) => {
          if (!prevCompany) return prevCompany;
          return {
            ...prevCompany,
            folders: (prevCompany.folders || []).map((folder: any) =>
              folder.id === lockingFolder.id
                ? { ...folder, isLocked: true, password }
                : folder
            ),
          };
        });
      }
      
      // Clear verification for this folder so it's locked immediately
      setVerifiedFolders(prev => {
        const newMap = new Map(prev);
        newMap.delete(lockingFolder.id);
        return newMap;
      });
      
      toast.success('Folder locked successfully!');
      setLockingFolder(null);
      refreshView();
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
      refreshView();
      return true;
    } else {
      toast.error(result.error || 'Failed to unlock folder');
      return false;
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
        refreshView();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleShowInfo = async (item: any) => {
    setInfoItem(item);
    setShowInfoModal(true);
    setOpenMenuId(null);

    const isFolder = 'other_folders' in item || 'parentId' in item;
    if (isFolder) {
      const stats = await getFolderStats(item.id);
      if (stats.success) {
        setFolderStats(stats.stats);
      }
    } else {
      // Fetch full file details for files
      const result = await getFileById(item.id);
      if (result.success && result.file) {
        setFileDetails(result.file);
      } else {
        setFileDetails(null);
      }
    }
  };

  const handleViewFile = (file: any) => {
    if (!('other_folders' in file || 'parentId' in file)) {
      setViewingFile(file);
      setOpenMenuId(null);
    }
  };

  const handleEditFile = async (file: any) => {
    if (!('other_folders' in file || 'parentId' in file)) {
      // Fetch full file details
      const result = await getFileById(file.id);
      if (result.success && result.file) {
        setEditingFileDetails(result.file);
        setShowEditDetailsModal(true);
        setOpenMenuId(null);
      } else {
        toast.error(result.error || 'Failed to load file details');
      }
    }
  };


  const handleCopyFile = (file: any) => {
    if (!('other_folders' in file || 'parentId' in file)) {
      setCopiedFile(file);
      toast.success('File copied! Click Paste to duplicate it in another folder.');
      setOpenMenuId(null);
    }
  };

  const handleMoveFile = (file: any) => {
    if (!('other_folders' in file || 'parentId' in file)) {
      setMovedFile(file);
      setShowMoveModal(true);
      loadAvailableFolders();
      setOpenMenuId(null);
    }
  };

  const handleMoveFileConfirm = async (targetFolderId: string) => {
    if (!movedFile) return;
    const result = await moveFile(movedFile.id, targetFolderId);
    if (result.success) {
      toast.success('File moved successfully!');
      setMovedFile(null);
      setShowMoveModal(false);
      refreshView();
    } else {
      toast.error(result.error || 'Failed to move file');
    }
  };

  const handleShareFile = (file: any) => {
    if (!('other_folders' in file || 'parentId' in file)) {
      setFileToShare(file);
      setShowShareModal(true);
      setOpenMenuId(null);
    }
  };

  const toggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) return;

    const itemsToDelete = Array.from(selectedItems);
    let successCount = 0;
    let failCount = 0;

    for (const itemId of itemsToDelete) {
      const item = currentItems.find(i => i.id === itemId);
      if (!item) continue;
      
      const isFolder = 'other_folders' in item || 'parentId' in item;
      const result = isFolder 
        ? await deleteFolder(itemId)
        : await deleteFile(itemId, false);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} item(s) deleted successfully`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} item(s) failed to delete`);
    }
    
    setSelectedItems(new Set());
    refreshView();
  };

  const handleBulkCopy = () => {
    if (selectedItems.size === 0) return;

    const filesToCopy = Array.from(selectedItems)
      .map(id => {
        const item = currentItems.find(i => i.id === id);
        return item;
      })
      .filter(item => item && !('other_folders' in item || 'parentId' in item));

    if (filesToCopy.length === 0) {
      toast.error('Only files can be copied at this time.');
      return;
    }

    setCopiedBulkItems(filesToCopy);
    setCopiedFile(null); // Clear single copied file
    toast.success(`${filesToCopy.length} file(s) copied! Go to a folder to paste.`);
    setSelectedItems(new Set());
  };

  const handleBulkPaste = async () => {
    if (copiedBulkItems.length === 0 || !currentFolderId) return;

    let successCount = 0;
    for (const file of copiedBulkItems) {
      const result = await copyFile(file.id, currentFolderId);
      if (result.success) successCount++;
    }

    toast.success(`${successCount} file(s) pasted successfully!`);
    setCopiedBulkItems([]);
    refreshView();
  };

  const loadAvailableFolders = async () => {
    if (!company) return;
    try {
      const result = await getAllFoldersFlat(company.id);
      if (result.success && result.folders) {
        const allFolders = result.folders;
        
        // Helper to build full path for a folder
        const getFolderPath = (folder: any): string => {
          let path = folder.name;
          let currentParentId = folder.parentId;
          
          while (currentParentId) {
            const parent = allFolders.find((f: any) => f.id === currentParentId);
            if (parent) {
              path = `${parent.name} / ${path}`;
              currentParentId = parent.parentId;
            } else {
              break;
            }
          }
          return path;
        };

        const foldersWithPaths = allFolders
          .filter((f: any) => f.id !== currentFolderId && f.id !== movedFile?.folderId)
          .map((f: any) => ({
            ...f,
            displayName: getFolderPath(f),
          }))
          .sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));

        setAvailableFolders(foldersWithPaths);
      } else {
        console.error('Failed to load folders:', result.error);
        setAvailableFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setAvailableFolders([]);
    }
  };

  const handlePasteFile = async () => {
    if (!copiedFile || !company) {
      toast.error('No file copied. Please copy a file first.');
      return;
    }

    if (currentFolderId === null) {
      toast.error('Please navigate to a folder to paste the file.');
      return;
    }

    const result = await copyFile(copiedFile.id, currentFolderId);
    if (result.success) {
      toast.success('File pasted successfully!');
      setCopiedFile(null);
      setShowPasteModal(false);
      refreshView();
    } else {
      toast.error(result.error || 'Failed to paste file');
    }
  };

  const handlePasteFileClick = () => {
    if (!copiedFile) {
      toast.error('No file copied. Please copy a file first.');
      return;
    }
    if (currentFolderId === null) {
      toast.error('Please navigate to a folder to paste the file.');
      return;
    }
    handlePasteFile();
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f1d35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b relative">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <File className="w-6 h-6 sm:w-8 sm:h-8 text-[#9f1d35] flex-shrink-0" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Documents</h1>
                  <p className="text-xs sm:text-sm text-gray-500">{documentCount} {documentCount === 1 ? 'document' : 'documents'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/user/documents/all"
                  className="flex items-center space-x-2 text-[#9f1d35] hover:text-[#8a1a2e] px-3 sm:px-4 py-2 rounded-lg hover:bg-red-50 text-sm sm:text-base transition-colors"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>View All Documents</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 p-3 sm:p-4">
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap gap-y-1">
              {currentPath.map((item, index) => (
                <div key={item.id} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                  <button
                    onClick={() => navigateToBreadcrumb(index)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                      index === currentPath.length - 1
                        ? 'bg-[#9f1d35]/10 text-[#9f1d35] font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {index === 0 ? <Home className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {selectedItems.size > 0 && (
            <div className="bg-white border-2 border-[#9f1d35] rounded-xl p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-3">
                <div className="bg-[#9f1d35] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {selectedItems.size}
                </div>
                <span className="text-gray-900 font-semibold text-sm sm:text-base">Items Selected</span>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleBulkCopy}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 text-sm sm:text-base font-medium shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all active:scale-95 text-sm sm:text-base font-medium shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all active:scale-95 text-sm sm:text-base font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFolderModal(true)}
                className="flex items-center space-x-2 bg-[#9f1d35] text-white px-4 py-2.5 rounded-lg hover:bg-[#8a1a2e] text-sm sm:text-base font-medium shadow-sm transition-all active:scale-95"
              >
                <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">New Folder</span>
              </button>
              {currentFolderId !== null && (
                <>
                  <button
                    onClick={() => setShowFileModal(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 text-sm sm:text-base font-medium shadow-sm transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="whitespace-nowrap">Upload</span>
                  </button>
                  {(copiedFile || copiedBulkItems.length > 0) && (
                    <button
                      onClick={copiedFile ? handlePasteFileClick : handleBulkPaste}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm sm:text-base font-medium shadow-sm transition-all animate-pulse"
                      title={copiedFile ? `Paste "${copiedFile.name}"` : `Paste ${copiedBulkItems.length} items`}
                    >
                      <Clipboard className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="whitespace-nowrap">Paste {copiedBulkItems.length > 0 ? `(${copiedBulkItems.length})` : ''}</span>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All</option>
                  <option value="folders">Folders Only</option>
                  <option value="files">Files Only</option>
                </select>
              </div>
            </div>
          </div>

          {currentItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">This folder is empty</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No items found matching your search</p>
              {(searchTerm || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="mt-4 text-[#9f1d35] hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => {
                const isFolder = 'other_folders' in item || 'parentId' in item;
                const isSelected = selectedItems.has(item.id);
                return (
                    <div
                      key={item.id}
                      className={`group relative bg-white rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'border-[#9f1d35] bg-red-50/30 ring-1 ring-[#9f1d35] shadow-md' 
                          : 'border-gray-200 hover:border-[#9f1d35]/30 hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectItem(item.id);
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              isSelected ? 'bg-[#9f1d35] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <CheckSquare className={`w-4 h-4 ${isSelected ? 'block' : 'opacity-0 group-hover:opacity-100'}`} />
                          </button>
                          
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === item.id ? null : item.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {openMenuId === item.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                  {!isFolder && (
                                    <>
                                      <button onClick={(e) => { e.stopPropagation(); handleViewFile(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="w-4 h-4" /><span>View</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); handleEditFile(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit className="w-4 h-4" /><span>Edit Details</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); handleCopyFile(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Copy className="w-4 h-4" /><span>Copy</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); handleMoveFile(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Move className="w-4 h-4" /><span>Move</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); handleShareFile(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Share2 className="w-4 h-4" /><span>Share</span></button>
                                    </>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); handleShowInfo(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Info className="w-4 h-4" /><span>Get Info</span></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleEditItem(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit className="w-4 h-4" /><span>Rename</span></button>
                                  {isFolder && isAdmin && (
                                    item.isLocked ? (
                                      <button onClick={(e) => { e.stopPropagation(); handleUnlockFolder(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"><Unlock className="w-4 h-4" /><span>Unlock Folder</span></button>
                                    ) : (
                                      <button onClick={(e) => { e.stopPropagation(); handleLockFolder(item); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"><Lock className="w-4 h-4" /><span>Lock Folder</span></button>
                                    )
                                  )}
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isFolder) handleDeleteFolder(item.id, item.name);
                                      else handleDeleteFile(item.id, item.name);
                                    }}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          onClick={() => {
                            if (isFolder) navigateToFolder(item.id);
                            else handleViewFile(item);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="relative">
                              {isFolder ? (
                                <div className="relative">
                                  <Folder className={`w-16 h-16 transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'text-[#9f1d35]' : 'text-[#9f1d35]/80'}`} />
                                  {item.isLocked && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full p-1 shadow-sm">
                                      <Lock className="w-3 h-3" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <File className={`w-16 h-16 transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'text-[#9f1d35]' : 'text-gray-400'}`} />
                              )}
                            </div>
                            <div className="w-full">
                              <p className={`text-sm font-semibold truncate px-2 ${isSelected ? 'text-[#9f1d35]' : 'text-gray-900'}`} title={item.name}>
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(item.createdAt || item.data?.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Folder Modal */}
        {showFolderModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowFolderModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Folder</h3>
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                    placeholder="e.g., 2025, Class 10"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFolderModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e]"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add File Modal with UploadThing */}
        <AddFileModal
          isOpen={showFileModal}
          onClose={() => setShowFileModal(false)}
          currentFolderId={currentFolderId}
          onUploadComplete={handleFileUploadComplete}
        />

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowEditModal(false);
              setEditingItem(null);
              setEditName('');
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit {('other_folders' in editingItem || 'parentId' in editingItem) ? 'Folder' : 'File'} Name
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setEditName('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                    placeholder="Enter new name"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                      setEditName('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && infoItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowInfoModal(false);
              setInfoItem(null);
              setFolderStats(null);
              setFileDetails(null);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Information</h3>
                <button
                  onClick={() => {
                    setShowInfoModal(false);
                    setInfoItem(null);
                    setFolderStats(null);
                    setFileDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b">
                  {('other_folders' in infoItem || 'parentId' in infoItem) ? (
                    <Folder className="w-8 h-8 text-[#9f1d35]" />
                  ) : (
                    <File className="w-8 h-8 text-gray-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{infoItem.name}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(infoItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {('other_folders' in infoItem || 'parentId' in infoItem) && folderStats ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Folders</p>
                          <p className="text-2xl font-bold text-[#9f1d35]">{folderStats.folderCount}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {folderStats.directFolderCount} direct
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Files</p>
                          <p className="text-2xl font-bold text-blue-600">{folderStats.fileCount}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {folderStats.directFileCount} direct
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-900 mb-3">File Information</p>
                    {fileDetails ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Size:</p>
                            <p className="font-medium text-gray-900">
                              {(fileDetails.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Type:</p>
                            <p className="font-medium text-gray-900">
                              {fileDetails.mimeType || 'Unknown'}
                            </p>
                          </div>
                          {fileDetails.category && (
                            <div>
                              <p className="text-gray-600">Category:</p>
                              <p className="font-medium text-gray-900">{fileDetails.category}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-600">Created:</p>
                            <p className="font-medium text-gray-900">
                              {new Date(fileDetails.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {(fileDetails.issueDate || fileDetails.expiryDate || fileDetails.renewalDate || fileDetails.placeOfIssue) && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Document Dates</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {fileDetails.issueDate && (
                                <div>
                                  <p className="text-gray-600">Issue Date:</p>
                                  <p className="font-medium text-gray-900">
                                    {new Date(fileDetails.issueDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {fileDetails.expiryDate && (
                                <div>
                                  <p className="text-gray-600">Expiry Date:</p>
                                  <p className="font-medium text-red-600">
                                    {new Date(fileDetails.expiryDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {fileDetails.renewalDate && (
                                <div>
                                  <p className="text-gray-600">Renewal Date:</p>
                                  <p className="font-medium text-gray-900">
                                    {new Date(fileDetails.renewalDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {fileDetails.placeOfIssue && (
                                <div>
                                  <p className="text-gray-600">Place of Issue:</p>
                                  <p className="font-medium text-gray-900">{fileDetails.placeOfIssue}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p>Loading file details...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DocumentViewerModal
          isOpen={viewingFile !== null}
          onClose={() => setViewingFile(null)}
          file={viewingFile}
        />

        {/* Edit File Details Modal */}
        <EditFileDetailsModal
          isOpen={showEditDetailsModal}
          onClose={() => {
            setShowEditDetailsModal(false);
            setEditingFileDetails(null);
          }}
          file={editingFileDetails}
          onSuccess={() => {
            toast.success('File details updated successfully!');
            refreshView();
          }}
        />

        {/* Move File Modal */}
        {showMoveModal && movedFile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowMoveModal(false);
              setMovedFile(null);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Move File</h3>
                <button
                  onClick={() => {
                    setShowMoveModal(false);
                    setMovedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Select destination folder for "{movedFile.name}"</p>
              {availableFolders.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {availableFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleMoveFileConfirm(folder.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                      <Folder className="w-4 h-4 text-[#9f1d35] flex-shrink-0" />
                      <span className="truncate flex-1" title={folder.displayName || folder.name}>
                        {folder.displayName || folder.name}
                      </span>
                      {folder.isLocked && (
                        <Lock className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                      )}
                  </button>
                ))}
              </div>
              ) : (
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No folders available</p>
                  <p className="text-xs text-gray-400 mt-1">Create a folder first to move files</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lock Folder Modal */}
        {lockingFolder && (
          <LockFolderModal
            isOpen={true}
            onClose={() => setLockingFolder(null)}
            folder={lockingFolder}
            onSubmit={handleLockFolderConfirm}
          />
        )}

        {/* Unlock Folder Modal */}
        {unlockingFolder && (
          <UnlockFolderModal
            isOpen={true}
            onClose={() => setUnlockingFolder(null)}
            folder={unlockingFolder}
            onSubmit={handleUnlockFolderConfirm}
            onUnlocked={handleUnlocked}
          />
        )}

        {/* Folder Password Prompt Modal */}
        {passwordPromptFolder && (
          <FolderPasswordModal
            isOpen={true}
            onClose={() => setPasswordPromptFolder(null)}
            folderName={passwordPromptFolder.name}
            onSubmit={handleFolderPasswordSubmit}
          />
        )}

        {/* Share File Modal */}
        {showShareModal && fileToShare && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowShareModal(false);
              setFileToShare(null);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Share File</h3>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setFileToShare(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Share "{fileToShare.name}"</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share Link
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={fileToShare.url || ''}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => {
                        if (fileToShare.url) {
                          navigator.clipboard.writeText(fileToShare.url);
                          toast.success('Link copied to clipboard!');
                        }
                      }}
                      className="px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setFileToShare(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

