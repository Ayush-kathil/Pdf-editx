'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ui/theme-provider';
import { ChevronLeft, Moon, Sun, ShieldCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isHome = pathname === '/';
  
  const { scrollY } = useScroll();
  const rotate = useTransform(scrollY, [0, 1000], [0, 360]);

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
