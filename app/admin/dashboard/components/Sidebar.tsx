'use client';

import { LayoutDashboard, FileText, Settings, Trash2, History, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { logout } from '@/app/actions/auth';

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage = 'dashboard' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/admin/documents' },
    { id: 'history', label: 'History', icon: History, href: '/admin/history' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
    { id: 'bin', label: 'Bin', icon: Trash2, href: '/admin/bin' },
  ];

  return (
    <aside className="w-64 bg-white border-gray-200 min-h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <Logo variant="default" size="md" className="text-[#9f1d35]" />
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || currentPage === item.id;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#9f1d35] text-white shadow-md'
                      : 'text-gray-600 hover:bg-red-50 hover:text-[#9f1d35]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#9f1d35]'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-[#9f1d35] rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-[#9f1d35]" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

