'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, File, FolderPlus, LogOut, ChevronRight, Home, Upload, Search, Filter, Trash2, MoreVertical, Edit, Info, X, Eye, Copy, Clipboard } from 'lucide-react';
import Link from 'next/link';
import { logout, getAuth } from '@/app/actions/auth';
import { getCompany } from '@/app/actions/company';
import { getFolderWithChildren } from '@/app/actions/dashboard';
import { createFolder, deleteFolder, updateFolder, getFolderStats, getFoldersByCompany } from '@/app/actions/folder';
import { deleteFile, updateFile, getFilesByCompany, copyFile } from '@/app/actions/file';
import toast from 'react-hot-toast';
import AddFileModal from './components/AddFileModal';
import { createFile } from '@/app/actions/file';
import DocumentViewerModal from '../../admin/dashboard/modals/DocumentViewerModal';

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
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const auth = await getAuth();
        if (!auth || auth.role !== 'user' || !auth.companyId) {
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
      } catch (error) {
        console.error('Error loading documents:', error);
        router.push('/user/login');
      }
    };
    loadData();
  }, [router]);

  useEffect(() => {
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
  }, [currentItems, searchTerm, filterType]);

  const navigateToFolder = async (folderId: string) => {
    if (!company) return;

    const result = await getFolderWithChildren(folderId, company.id);
    if (!result.success || !result.folder) {
      toast.error('Folder not found');
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

  const navigateToBreadcrumb = async (index: number) => {
    if (!company) return;

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
      const result = await getFolderWithChildren(folderId, company.id);
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
      const result = await getFolderWithChildren(currentFolderId, company.id);
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
    if (!confirm(`Are you sure you want to delete "${fileName}"? It will be moved to bin and permanently deleted after 5 days.`)) {
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
    }
  };

  const handleViewFile = (file: any) => {
    if (!('other_folders' in file || 'parentId' in file)) {
      setViewingFile(file);
      setOpenMenuId(null);
    }
  };

  const handleEditFile = (file: any) => {
    if (!('other_folders' in file || 'parentId' in file)) {
      handleEditItem(file);
    }
  };

  const handleCopyFile = (file: any) => {
    if (!('other_folders' in file || 'parentId' in file)) {
      setCopiedFile(file);
      toast.success('File copied! Click Paste to duplicate it in another folder.');
      setOpenMenuId(null);
    }
  };

  const loadAvailableFolders = async () => {
    if (!company) return;
    const result = await getFoldersByCompany(company.id);
    if (result.success) {
      setAvailableFolders(result.folders || []);
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
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="w-8 h-8 text-[#9f1d35]" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                  <p className="text-sm text-gray-500">{documentCount} {documentCount === 1 ? 'document' : 'documents'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex items-center space-x-2 flex-wrap">
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

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFolderModal(true)}
                className="flex items-center space-x-2 bg-[#9f1d35] text-white px-4 py-2 rounded-lg hover:bg-[#8a1a2e]"
              >
                <FolderPlus className="w-5 h-5" />
                <span>New Folder</span>
              </button>
              {currentFolderId !== null && (
                <>
                  <button
                    onClick={() => setShowFileModal(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Document</span>
                  </button>
                  {copiedFile && (
                    <button
                      onClick={handlePasteFileClick}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      title={`Paste "${copiedFile.name}"`}
                    >
                      <Clipboard className="w-5 h-5" />
                      <span>Paste</span>
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
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">This folder is empty</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No items found matching your search</p>
              {(searchTerm || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="mt-4 text-[#9f1d35] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isFolder = 'other_folders' in item || 'parentId' in item;
                return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-lg shadow p-4 transition-all relative ${
                        isFolder ? 'hover:shadow-lg hover:border-[#9f1d35] border-2 border-transparent' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => {
                            if (isFolder) {
                              navigateToFolder(item.id);
                            } else {
                              handleViewFile(item);
                            }
                          }}
                          className={`flex items-center space-x-3 flex-1 min-w-0 ${isFolder || !isFolder ? 'cursor-pointer' : ''}`}
                        >
                        {isFolder ? (
                          <Folder className="w-8 h-8 text-[#9f1d35]" />
                        ) : (
                          <File className="w-8 h-8 text-gray-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === item.id ? null : item.id);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              {!isFolder && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewFile(item);
                                    }}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditFile(item);
                                    }}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyFile(item);
                                    }}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Copy className="w-4 h-4" />
                                    <span>Copy</span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowInfo(item);
                                }}
                                className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${!isFolder ? '' : 'rounded-t-lg'}`}
                              >
                                <Info className="w-4 h-4" />
                                <span>Get Info</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditItem(item);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit Name</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isFolder) {
                                    handleDeleteFolder(item.id, item.name);
                                  } else {
                                    handleDeleteFile(item.id, item.name);
                                  }
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
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
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">File Details</p>
                    <p className="text-sm text-gray-700">
                      This is a file. Files cannot contain other items.
                    </p>
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
    </div>
  );
}

