import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Send, Check } from 'lucide-react';
import clsx from 'clsx';

interface ShareButtonProps {
  onShare: () => Promise<void>;
  className?: string;
  label?: string;
}

export function ShareButton({ onShare, className = "", label = "Share" }: ShareButtonProps) {
  const [status, setStatus] = useState<'IDLE' | 'ANIMATING' | 'SUCCESS'>('IDLE');

  const handleClick = async () => {
    if (status !== 'IDLE') return;
    setStatus('ANIMATING');
    
    try {
      // 1. Let the circle animation run briefly
      await new Promise(res => setTimeout(res, 600)); 
      
      // 2. Open native share dialog
      await onShare();
      
      // 3. Mark as success (circle expands back to rectangle)
      setStatus('SUCCESS');
    } catch (e) {
      console.error(e);
      // Revert if user cancels or error occurs
      setStatus('IDLE'); 
    } finally {
      // Reset back to normal after some time in SUCCESS state
      setTimeout(() => {
        setStatus('IDLE');
      }, 3000);
    }
  };

  const isCircle = status === 'ANIMATING';
  const isSuccess = status === 'SUCCESS';
  
  // Extract width classes so the wrapper handles the space and the button can shrink.
  const isWFull = className.includes('w-full');
  const baseClasses = className.replace(/\bw-full\b/g, '').replace(/\btransition-all\b/g, '');

  return (
    <div className={clsx("flex justify-center", isWFull ? "w-full" : "")} style={{ minHeight: isCircle ? '60px' : 'auto' }}>
      <motion.button
        layout
        whileHover={status === 'IDLE' ? { scale: 1.02 } : {}}
        whileTap={status === 'IDLE' ? { scale: 0.98 } : {}}
        onClick={handleClick}
        initial={false}
        animate={{
          width: isCircle ? 60 : (isWFull ? "100%" : "auto"),
          height: isCircle ? 60 : "auto",
          borderRadius: isCircle ? 30 : (className.includes('rounded-2xl') ? 16 : 12),
        }}
        // Incredibly smooth layout morphing spring
        transition={{ layout: { type: "spring", stiffness: 100, damping: 14, mass: 0.8 } }}
        className={clsx(
          "relative overflow-hidden flex items-center justify-center isolate",
          baseClasses,
          isCircle || isSuccess 
            ? "!bg-green-500 !border-green-500 !text-white hover:!border-green-500" 
            : ""
        )}
        style={{
          padding: isCircle ? 0 : '',
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {status === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, filter: 'blur(4px)', scale: 0.8 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center justify-center space-x-2 whitespace-nowrap px-2"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
              {label && <span>{label}</span>}
            </motion.div>
          )}
          
          {status === 'ANIMATING' && (
            <motion.div
              layout
              key="animating"
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-center text-white"
            >
              <Check className="w-6 h-6 stroke-[3]" />
            </motion.div>
          )}

          {status === 'SUCCESS' && (
            <motion.div
              layout
              key="success"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-center space-x-2 whitespace-nowrap text-white px-2"
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
              {label && <span>Shared</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
