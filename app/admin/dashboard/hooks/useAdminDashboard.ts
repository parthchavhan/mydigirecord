import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanies } from '@/app/actions/company';
import type { Company } from '../types';

export function useAdminDashboard() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');

  useEffect(() => {
    loadCompanies();
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

  return {
    router,
    companies,
    setCompanies,
    filteredCompanies,
    setFilteredCompanies,
    companySearchTerm,
    setCompanySearchTerm,
    loadCompanies,
  };
}


