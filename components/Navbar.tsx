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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 1024);
      }
    };
    
    checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, []);

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
      const navbarHeight = 80; // Approximate navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    }
  };

  if (isDashboard) {
    return null;
  }

  const navLinks = isLanding ? [
    { label: 'About Us', id: 'about' },
    { label: 'Features', id: 'features' },
    { label: 'Security & Privacy', id: 'security-privacy' },
    { label: 'Contact Us', id: 'contact' },
  ] : [];

  return (
    <nav
      className={`sticky top-0 z-[100] transition-all duration-300 bg-white ${
        isScrolled
          ? 'shadow-lg border-b border-gray-200'
          : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="group flex-shrink-0">
            <Logo 
              variant="default" 
              size="md" 
              className="text-[#9f1d35] group-hover:text-[#b82d4a] transition-colors"
            />
          </Link>

          {/* Desktop Navigation - Visible on lg screens and above (1024px+) */}
          {isLanding && navLinks.length > 0 ? (
            <>
              <div className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-6 flex-1 justify-end ml-4`}>
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.id);
                    }}
                    className="text-gray-800 hover:text-[#9f1d35] font-medium transition-colors relative group py-2 px-3 whitespace-nowrap text-base cursor-pointer"
                    type="button"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#9f1d35] group-hover:w-full transition-all duration-300"></span>
                  </button>
                ))}
                <Link
                  href="/user/login"
                  className="inline-flex items-center space-x-2 bg-[#9f1d35] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#b82d4a] transition-all shadow-md hover:shadow-lg ml-2 flex-shrink-0"
                >
                  <User className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </div>
              
              {/* Mobile Menu Button - ONLY visible below lg screens (< 1024px) */}
              <div className={`${isMobile ? 'flex' : 'hidden'} items-center space-x-3`}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-700 hover:text-[#9f1d35] transition-colors rounded-md hover:bg-gray-100"
                  aria-label="Toggle menu"
                  type="button"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
                <Link
                  href="/user/login"
                  className="inline-flex items-center space-x-1 bg-[#9f1d35] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#b82d4a] transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-6`}>
                <Link
                  href="/user/login"
                  className="inline-flex items-center space-x-2 bg-[#9f1d35] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#b82d4a] transition-all shadow-md hover:shadow-lg"
                >
                  <User className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </div>
              <div className={`${isMobile ? 'flex' : 'hidden'} items-center`}>
                <Link
                  href="/user/login"
                  className="inline-flex items-center space-x-1 bg-[#9f1d35] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#b82d4a] transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isLanding && navLinks.length > 0 && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-t border-gray-200 shadow-lg overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.id);
                    }}
                    className="block w-full text-left text-gray-800 hover:text-[#9f1d35] font-medium py-3 px-3 transition-colors rounded-md hover:bg-gray-50 cursor-pointer"
                    type="button"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

    </nav>
  );
}

