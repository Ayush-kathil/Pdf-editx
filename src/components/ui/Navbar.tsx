'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ui/theme-provider';
import { ChevronLeft, Moon, Sun } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isHome = pathname === '/';
  
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-center pointer-events-none"
    >
      {/* Dynamic Glass Container */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between pointer-events-auto relative">
        
        {/* Left Side: Back Button */}
        <div className="flex items-center w-24">
          {!isHome && (
            <Link 
              href="/"
              className="p-3 rounded-full bg-card/80 backdrop-blur-xl border border-border-main text-txt-secondary hover:text-txt-primary hover:bg-card transition-all shadow-sm"
              title="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center items-center">
            <Link href="/" className="relative w-40 h-16 hover:scale-105 transition-transform duration-300 flex items-center justify-center">
               <Image 
                 src="/logo.png" 
                 alt="App Logo" 
                 fill 
                 className="object-contain" 
                 priority 
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
            </Link>
        </div>

        {/* Right Side: Theme Toggle */}
        <div className="flex items-center justify-end w-24">
            <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-card/80 backdrop-blur-xl border border-border-main text-txt-primary hover:bg-card transition-all group shadow-sm"
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
