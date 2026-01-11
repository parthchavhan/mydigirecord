'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Mail, Github, Linkedin, MapPin } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Footer() {
  const pathname = usePathname();
  // Hide footer on all admin and user dashboard pages (except login)
  const isDashboard = pathname?.includes('/admin/dashboard') || 
                      pathname?.includes('/admin/company') ||
                      pathname?.includes('/admin/bin') ||
                      pathname?.includes('/admin/history') ||
                      pathname?.includes('/user/dashboard') ||
                      pathname?.includes('/user/documents') ||
                      pathname?.includes('/user/notifications') ||
                      pathname?.includes('/user/settings') ||
                      pathname?.includes('/user/logs') ||
                      pathname?.includes('/user/bin') ||
                      pathname?.includes('/user/users');
  
  if (isDashboard) {
    return null;
  }
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Logo variant="default" size="md" className="text-white" />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              An innovative AI-powered document management platform offering secure, emotionally intelligent digital solutions
              for businesses, individuals, and families. Organize, access, and share important personal documents with clarity, control, and care.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#9f1d35] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#9f1d35] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#9f1d35] transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/user/login" className="hover:text-white transition-colors">
                  User Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact & Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hello@mendorabox.com" className="hover:text-white transition-colors flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@mendorabox.com</span>
                </a>
              </li>
              <li className="flex items-start space-x-2 text-gray-400">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} MendoraBox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

