'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, Trash2, History, Bell, Users, LogOut, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { checkIsAdmin, getAuth, logout } from '@/app/actions/auth';
import { getUnreadCount } from '@/app/actions/notification';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
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

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    router.push('/user/login');
  };
  
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
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Logo variant="default" size="md" className="text-[#9f1d35]" />
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#9f1d35] text-white shadow-md'
                      : 'text-gray-600 hover:bg-red-50 hover:text-[#9f1d35]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#9f1d35]'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                      isActive ? 'bg-white text-[#9f1d35]' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
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

