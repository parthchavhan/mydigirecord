'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  // Hide navbar on all admin and user dashboard pages (except login)
  const isDashboard = (pathname?.startsWith('/admin/') || pathname?.startsWith('/user/')) && pathname !== '/user/login' && pathname !== '/admin/login';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  if (isDashboard) {
    return null;
  }

  const navLinks = isLanding ? [
    { label: 'Features', id: 'features' },
    { label: 'Security', id: 'security' },
    { label: 'Contact', id: 'contact' },
  ] : [];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="group">
            <Logo 
              variant="default" 
              size="md" 
              className="text-[#9f1d35] group-hover:text-[#b82d4a] transition-colors"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-gray-700 hover:text-[#9f1d35] font-medium transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#9f1d35] group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
            <Link
              href="/user/login"
              className="inline-flex items-center space-x-2 bg-[#9f1d35] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#b82d4a] transition-all shadow-md hover:shadow-lg"
            >
              <User className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>

          {/* Mobile Menu Button - Only show on mobile/tablet */}
          <div className="lg:hidden flex items-center space-x-4">
            {isLanding && (
              <Link
                href="/user/login"
                className="inline-flex items-center space-x-1 bg-[#9f1d35] text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
           
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && isLanding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block w-full text-left text-gray-700 hover:text-[#9f1d35] font-medium py-2 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

