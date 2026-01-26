'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockOpen, Loader2 } from 'lucide-react';

interface PasswordFormProps {
  onSubmit: (password: string) => void;
  isProcessing: boolean;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit, isProcessing }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      onSubmit(password);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className="w-full max-w-md mx-auto space-y-8"
      onSubmit={handleSubmit}
    >
      <div className="space-y-6">
        <div className="space-y-2 group">
          <label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-txt-tertiary ml-1 group-focus-within:text-txt-primary transition-colors">
            PDF Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter document password"
            className="w-full px-5 py-4 rounded-2xl bg-element border border-border-main focus:border-txt-primary focus:bg-element-hover focus:ring-4 focus:ring-txt-primary/10 transition-all duration-300 outline-none text-txt-primary placeholder-txt-tertiary text-lg shadow-sm"
            required
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isProcessing || !password}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page shadow-lg transition-all font-bold text-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <LockOpen className="w-5 h-5" />
            <span>Unlock PDF</span>
          </>
        )}
      </motion.button>
    </motion.form>
  );
};
