'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, FolderPlus, Plus, Search, Eye, UserPlus, Trash2, MoreVertical, Edit, Info } from 'lucide-react';
import Link from 'next/link';
import type { Company } from '../types';

interface CompaniesSectionProps {
  companies: Company[];
  filteredCompanies: Company[];
  companySearchTerm: string;
  setCompanySearchTerm: (term: string) => void;
  onShowCompanyModal: () => void;
  onSelectCompany: (company: Company) => void;
  onShowUserModal: (company: Company) => void;
  onShowFolderModal: (company: Company) => void;
  onDeleteCompany: (id: string, name: string) => void;
  onEditFolder: (folder: any) => void;
  onShowFolderInfo: (folder: any) => void;
  onDeleteFolder: (id: string, name: string) => void;
  openFolderMenuId: string | null;
  setOpenFolderMenuId: (id: string | null) => void;
}

export default function CompaniesSection({
  companies,
  filteredCompanies,
  companySearchTerm,
  setCompanySearchTerm,
  onShowCompanyModal,
  onSelectCompany,
  onShowUserModal,
  onShowFolderModal,
  onDeleteCompany,
  onEditFolder,
  onShowFolderInfo,
  onDeleteFolder,
  openFolderMenuId,
  setOpenFolderMenuId,
}: CompaniesSectionProps) {
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Companies</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowCompanyModal}
          className="flex items-center space-x-2 bg-[#9f1d35] text-white px-4 py-2 rounded-lg hover:bg-[#8a1a2e]"
        >
          <Plus className="w-5 h-5" />
          <span>Create Company</span>
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search companies by name..."
            value={companySearchTerm}
            onChange={(e) => setCompanySearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
          />
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No companies yet. Create your first company!</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No companies found matching "{companySearchTerm}"</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-500">
                    {company.folders.length} folder{company.folders.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/company/${company.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => onShowUserModal(company)}
                    className="p-2 text-[#9f1d35] hover:bg-[#9f1d35]/10 rounded-lg"
                    title="Add User"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onShowFolderModal(company)}
                    className="p-2 text-[#9f1d35] hover:bg-[#9f1d35]/10 rounded-lg"
                    title="Add Folder"
                  >
                    <FolderPlus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteCompany(company.id, company.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Company"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {company.folders.length === 0 ? (
                  <p className="text-sm text-gray-400">No folders yet</p>
                ) : (
                  company.folders.map((folder: any) => (
                    <div key={folder.id} className="flex items-center justify-between text-sm group">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FolderPlus className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 truncate">{folder.name}</span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFolderMenuId(openFolderMenuId === folder.id ? null : folder.id);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="More options"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                        {openFolderMenuId === folder.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenFolderMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShowFolderInfo(folder);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                              >
                                <Info className="w-4 h-4" />
                                <span>Get Info</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditFolder(folder);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit Name</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteFolder(folder.id, folder.name);
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
                  ))
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}





