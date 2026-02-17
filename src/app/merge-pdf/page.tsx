'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Download, RefreshCw, Layers, ArrowUp, ArrowDown, X } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { mergePdfs } from '@/lib/pdf-utils';
import { useToast } from '@/components/ui/toast-provider';

const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: springTransition
  },
};

export default function MergePage() {
  const [step, setStep] = useState<'UPLOAD' | 'SUCCESS'>('UPLOAD');
  const [files, setFiles] = useState<File[]>([]);
  const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File | File[]) => {
    const newFiles = Array.isArray(selectedFile) ? selectedFile : [selectedFile];
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) return;
    
    setFiles(prev => {
        const newFiles = [...prev];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newFiles[index], newFiles[swapIndex]] = [newFiles[swapIndex], newFiles[index]];
        return newFiles;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
        toast('Please upload at least 2 PDF files to merge.', 'error');
        return;
    }

    setIsProcessing(true);

    try {
        const buffers = await Promise.all(files.map(f => f.arrayBuffer()));
        const merged = await mergePdfs(buffers);
        setMergedPdf(merged);
        setStep('SUCCESS');
        toast('PDFs merged successfully!', 'success');
    } catch (err: any) {
        toast(err.message || 'Failed to merge PDFs.', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdf) return;
    const blob = new Blob([mergedPdf as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `merged_document.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast('Download started.', 'info');
  };

  const handleReset = () => {
    setFiles([]);
    setMergedPdf(null);
    setStep('UPLOAD');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-page selection:bg-txt-primary/20">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-element/20 rounded-full blur-[150px] opacity-40 animate-pulse-slow" />
         <div className="absolute bottom-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-zinc-800/20 rounded-full blur-[150px] opacity-30" />
      </div>

      <motion.div 
        className="w-full max-w-2xl flex flex-col items-center z-10 pt-20"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
          {/* Header */}
          <header className="mb-12 text-center space-y-5">
            <div className="inline-flex items-center justify-center mb-2">
               <div className="p-4 bg-card rounded-[2rem] border border-border-main shadow-2xl backdrop-blur-xl">
                 <Layers className="w-10 h-10 text-txt-primary stroke-[1.5]" />
               </div>
            </div>
            
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                Merge PDF.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Combine multiple files into one. <br/>
                <span className="text-txt-primary">Simple. Fast. Local.</span>
                </p>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              
              {step === 'UPLOAD' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' }}
                  transition={springTransition}
                  className="space-y-8 relative"
                >
                  <FileUpload 
                      onFileSelect={handleFileSelect} 
                      label="Upload your PDFs"
                      subLabel="Select multiple PDFs to merge."
                      multiple={true}
                  />

                  {/* File List */}
                  {files.length > 0 && (
                      <div className="space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-card border border-border-main p-3 rounded-xl">
                                <span className="text-sm text-txt-secondary truncate max-w-[200px]">{file.name}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => moveFile(index, 'up')} disabled={index === 0} className="p-1 text-txt-tertiary hover:text-txt-primary disabled:opacity-30">
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="p-1 text-txt-tertiary hover:text-txt-primary disabled:opacity-30">
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeFile(index)} className="p-1 text-red-500/70 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                      </div>
                  )}
                  
                  {files.length >= 2 && !isProcessing && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleMerge}
                        className="w-full py-4 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-lg shadow-lg transition-all"
                      >
                        Merge {files.length} Files
                      </motion.button>
                  )}

                  {isProcessing && (
                      <div className="text-center text-txt-tertiary text-sm animate-pulse flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Merging...</span>
                      </div>
                  )}
                </motion.div>
              )}

              {step === 'SUCCESS' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={springTransition}
                  className="bg-card backdrop-blur-3xl border border-border-main shadow-2xl p-12 rounded-[3rem] flex flex-col items-center text-center w-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-txt-primary/5 to-transparent pointer-events-none" />

                  <div className="w-24 h-24 bg-gradient-to-tr from-element to-element-hover rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10">
                     <Layers className="w-12 h-12 text-txt-primary stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-3 relative z-10 mb-10">
                    <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">Merged.</h2>
                    <p className="text-txt-secondary text-lg">Your combined file is ready.</p>
                  </div>

                  <div className="w-full space-y-4 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3"
                    >
                      <Download className="w-6 h-6" />
                      <span>Save Merged PDF</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "var(--bg-element-hover)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="w-full py-4 rounded-2xl bg-transparent border border-border-strong hover:border-txt-primary text-txt-secondary hover:text-txt-primary font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Merge More</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            
            </AnimatePresence>
          </div>
          
      </motion.div>
    </main>
  );
}

function Loader2(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
