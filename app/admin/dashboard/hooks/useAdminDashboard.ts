import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanies } from '@/app/actions/company';
import { getAllFiles } from '@/app/actions/file';
import type { Company, File } from '../types';

export function useAdminDashboard() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<File[]>([]);
  const [fileSearchTerm, setFileSearchTerm] = useState('');

  useEffect(() => {
    loadCompanies();
    loadFiles();
  }, []);

  useEffect(() => {
    if (companySearchTerm.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((company) =>
        company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [companySearchTerm, companies]);

  useEffect(() => {
    if (fileSearchTerm.trim() === '') {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter((file) =>
        file.name.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
        file.folder?.name.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
        file.folder?.company?.name.toLowerCase().includes(fileSearchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [fileSearchTerm, files]);

  const loadCompanies = async () => {
    const result = await getCompanies();
    if (result.success) {
      const companiesList = (result.companies || []).map((company: any) => ({
        ...company,
        createdAt: company.createdAt instanceof Date ? company.createdAt.toISOString() : company.createdAt,
        updatedAt: company.updatedAt instanceof Date ? company.updatedAt.toISOString() : company.updatedAt,
        folders: (company.folders || []).map((folder: any) => ({
          ...folder,
          createdAt: folder.createdAt instanceof Date ? folder.createdAt.toISOString() : folder.createdAt,
          updatedAt: folder.updatedAt instanceof Date ? folder.updatedAt.toISOString() : folder.updatedAt,
        })),
      }));
      setCompanies(companiesList);
      setFilteredCompanies(companiesList);
    }
  };

  const loadFiles = async () => {
    const result = await getAllFiles();
    if (result.success) {
      const filesList = (result.files || []).map((file: any) => ({
        ...file,
        createdAt: file.createdAt instanceof Date ? file.createdAt.toISOString() : file.createdAt,
        updatedAt: file.updatedAt instanceof Date ? file.updatedAt.toISOString() : file.updatedAt,
      }));
      setFiles(filesList);
      setFilteredFiles(filesList);
    }
  };

  return {
    router,
    companies,
    setCompanies,
    filteredCompanies,
    setFilteredCompanies,
    companySearchTerm,
    setCompanySearchTerm,
    files,
    setFiles,
    filteredFiles,
    fileSearchTerm,
    setFileSearchTerm,
    loadCompanies,
    loadFiles,
  };
}


