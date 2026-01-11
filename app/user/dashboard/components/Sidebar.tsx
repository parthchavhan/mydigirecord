'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, Trash2, History, Bell, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import { checkIsAdmin, getAuth } from '@/app/actions/auth';
import { getUnreadCount } from '@/app/actions/notification';

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const initSidebar = async () => {
      const [adminCheck, auth] = await Promise.all([
        checkIsAdmin(),
        getAuth()
      ]);
      
      setIsAdmin(adminCheck.success && adminCheck.isAdmin);
      
      if (auth?.userId) {
        const countRes = await getUnreadCount(auth.userId);
        if (countRes.success) {
          setUnreadCount(countRes.count);
        }
      }
    };
    initSidebar();
  }, [pathname]);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/user/dashboard' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/user/notifications', badge: unreadCount > 0 ? unreadCount : null },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/user/documents' },
    ...(isAdmin ? [
      { id: 'users', label: 'Users', icon: Users, href: '/user/users' },
      { id: 'logs', label: 'Logs', icon: History, href: '/user/logs' }
    ] : []),
    { id: 'settings', label: 'Settings', icon: Settings, href: '/user/settings' },
    { id: 'bin', label: 'Bin', icon: Trash2, href: '/user/bin' },
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
            const isActive = pathname === item.href;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#8b6f47] text-white shadow-lg'
                      : 'text-white/80 hover:bg-[#2a4a6f] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

