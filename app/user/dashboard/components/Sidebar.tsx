'use client';

import { LayoutDashboard, FileText, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/user/dashboard' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/user/documents' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/user/settings' },
    { id: 'bin', label: 'Bin', icon: Trash2, href: '/user/bin' },
  ];

  return (
    <aside className="w-64 bg-[#1e3a5f] min-h-screen flex flex-col">
      <div className="p-6 border-b border-[#2a4a6f]">
        <h2 className="text-white text-xl font-bold">MyDigiRecord</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
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

