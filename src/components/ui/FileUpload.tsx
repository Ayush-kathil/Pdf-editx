'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileLock2, ShieldCheck, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface FileUploadProps {
  onFileSelect: (file: File | File[]) => void;
  accept?: Record<string, string[]>;
  label?: string;
  subLabel?: string;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
    onFileSelect, 
    accept = { 'application/pdf': ['.pdf'] },
    label = "Upload your PDF",
    subLabel = "Files up to 10MB. Processed entirely on your device.",
    multiple = false
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      if (multiple) {
          onFileSelect(acceptedFiles);
      } else {
        const file = acceptedFiles[0];
        onFileSelect(file);
      }
    }
  }, [onFileSelect, accept, multiple]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    multiple,
    onDropRejected: () => setError("Invalid file type. Please upload a supported file.")
  });

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...getRootProps() as any}
        className={clsx(
          "relative group cursor-pointer rounded-[2rem] border transition-all duration-500 p-12 flex flex-col items-center justify-center text-center overflow-hidden backdrop-blur-2xl",
          isDragActive 
            ? "border-txt-primary bg-element/80 shadow-[0_0_50px_-10px_var(--accent-glow)] outline-none" 
            : "border-border-main bg-card hover:border-border-strong"
        )}
      >
        <input {...getInputProps()} />

        {/* Dynamic Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-txt-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="z-10 flex flex-col items-center space-y-6">
          <motion.div 
            className={clsx(
                "p-5 rounded-2xl border shadow-xl transition-all duration-300",
                isDragActive ? "bg-page border-txt-primary scale-110" : "bg-element border-border-main group-hover:bg-element-hover group-hover:border-border-strong"
            )}
            whileHover={{ rotate: 5 }}
          >
            {isDragActive ? (
              <Upload className="w-8 h-8 text-txt-primary" />
            ) : (
              <FileLock2 className="w-8 h-8 text-txt-secondary group-hover:text-txt-primary transition-colors duration-300" />
            )}
          </motion.div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-txt-primary font-sans tracking-tight">
              {isDragActive ? "Drop File" : label}
            </h3>
            <p className="text-sm text-txt-secondary max-w-xs mx-auto font-medium">
              {subLabel}
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-red-500 text-sm flex items-center justify-center space-x-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center space-x-6 text-[10px] uppercase tracking-widest text-txt-tertiary pt-4 font-medium">
        <div className="flex items-center space-x-1.5 ">
          <ShieldCheck className="w-3 h-3" />
          <span>Local Encryption</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3 h-3" />
          <span>Zero Knowledge</span>
        </div>
      </div>
    </div>
  );
};
