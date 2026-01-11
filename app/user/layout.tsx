'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Sidebar from './dashboard/components/Sidebar';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/user/login';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Don't show sidebar on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Sidebar - forced visible */}
      <aside className="w-64 min-w-[256px] h-full flex-shrink-0 bg-white border-r border-gray-200 z-20">
        <Sidebar />
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}




