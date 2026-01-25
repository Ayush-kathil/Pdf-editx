'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ui/theme-provider';
import { ChevronLeft, Moon, Sun, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isHome = pathname === '/';

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-center pointer-events-none"
    >
      {/* Dynamic Glass Container */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between pointer-events-auto relative">
        
        {/* Left Side: Back Button */}
        <div className="flex items-center w-20">
          {!isHome && (
            <Link 
              href="/"
              className="p-2.5 rounded-full bg-card/50 backdrop-blur-xl border border-border-main text-txt-secondary hover:text-txt-primary hover:bg-card transition-all"
              title="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Center: Brand (Floating Pill) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-3xl px-6 py-3 rounded-full border border-border-main shadow-lg hover:scale-105 transition-transform duration-500 cursor-default">
                <ShieldCheck className="w-5 h-5 text-txt-primary" />
                <span className="font-semibold text-lg tracking-tight text-txt-primary">Ayush PDF Editx</span>
             </div>
        </div>

        {/* Right Side: Theme Toggle */}
        <div className="flex items-center justify-end w-20">
            <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-card/50 backdrop-blur-xl border border-border-main text-txt-primary hover:bg-card transition-all group"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
            {theme === 'dark' ? (
                <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
            ) : (
                <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            )}
            </button>
        </div>

      </div>
    </motion.nav>
  );
}
