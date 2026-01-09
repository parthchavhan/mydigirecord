'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoProps {
  variant?: 'default' | 'icon-only' | 'text-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export default function Logo({ 
  variant = 'default', 
  size = 'md',
  className = '',
  showText = true 
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  if (variant === 'icon-only') {
    return (
      <div className={`${sizeClasses[size]} ${className} relative`}>
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          className="w-full h-full object-contain"
          style={{ 
            filter: 'contrast(1.2) brightness(1.05)',
            mixBlendMode: 'darken'
          }}
          unoptimized
        />
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <span className={`font-bold ${textSizeClasses[size]} ${className || 'text-[#9f1d35]'}`}>
        Mendorabox
      </span>
    );
  }

  const textColorClass = className.includes('text-white') ? 'text-white' : 'text-[#9f1d35]';
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${sizeClasses[size]} flex-shrink-0 relative`}
      >
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          className="w-full h-full object-contain"
          style={{ 
            filter: 'contrast(1.2) brightness(1.05)',
            mixBlendMode: 'darken'
          }}
          unoptimized
        />
      </motion.div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} ${textColorClass}`}>
          Mendorabox
        </span>
      )}
    </div>
  );
}
