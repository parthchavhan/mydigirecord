'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './dashboard/components/Sidebar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/user/login';

  // Don't show sidebar on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}




