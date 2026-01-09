'use client';

import { LayoutDashboard, FileText, Settings, Trash2, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage = 'dashboard' }: SidebarProps) {
  const pathname = usePathname();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/admin/documents' },
    { id: 'history', label: 'History', icon: History, href: '/admin/history' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
    { id: 'bin', label: 'Bin', icon: Trash2, href: '/admin/bin' },
  ];

  return (
    <aside className="w-64 bg-[#1e3a5f] min-h-screen flex flex-col">
      <div className="p-6 border-b border-[#2a4a6f]">
        <Logo variant="text-only" size="md" className="text-white" />
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || currentPage === item.id;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#8b6f47] text-white shadow-lg'
                      : 'text-white/80 hover:bg-[#2a4a6f] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

