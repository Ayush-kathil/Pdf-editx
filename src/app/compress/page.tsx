'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Download, RefreshCw, X, ShieldCheck, FileInput } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { compressPdf } from '@/lib/pdf-utils';
import clsx from 'clsx';
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

export default function CompressPage() {
  const [step, setStep] = useState<'UPLOAD' | 'SUCCESS'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [compressedPdf, setCompressedPdf] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const { toast } = useToast();

  // File selection handler
  const handleFileSelect = async (selectedFile: File | File[]) => {
    if (Array.isArray(selectedFile)) return;
    setFile(selectedFile);
    setIsProcessing(true);
    
    // Process immediately for compression logic after short delay for UI
    try {
        const fileBuffer = await selectedFile.arrayBuffer();
        const compressedBytes = await compressPdf(fileBuffer, quality);
        setCompressedPdf(compressedBytes);
        setStep('SUCCESS');
        toast('PDF compressed successfully!', 'success');
    } catch (err: any) {
        toast(err.message || 'Failed to compress PDF.', 'error');
        setStep('UPLOAD');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedPdf) return;
    const blob = new Blob([compressedPdf as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${file?.name || 'document.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast('Download started.', 'info');
  };

  const handleReset = () => {
    setFile(null);
    setCompressedPdf(null);
    setStep('UPLOAD');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-page selection:bg-txt-primary/20">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-element/20 rounded-full blur-[150px] opacity-40 animate-pulse-slow" />
         <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-zinc-800/20 rounded-full blur-[150px] opacity-30" />
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
                 <FileDown className="w-10 h-10 text-txt-primary stroke-[1.5]" />
               </div>
            </div>
            
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                Compress PDF.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Reduce file size securely. <br/>
                <span className="text-txt-primary">Local processing. No quality loss.</span>
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
                  <FileUpload onFileSelect={handleFileSelect} />
                  
                  {/* Simple Quality Selector */}
                  <div className="flex justify-center gap-4">
                     {(['HIGH', 'MEDIUM', 'LOW'] as const).map((q) => (
                        <button
                            key={q}
                            onClick={() => setQuality(q)}
                            className={clsx(
                                "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                quality === q 
                                    ? "bg-txt-primary text-page border-txt-primary" 
                                    : "bg-element text-txt-secondary border-border-main hover:border-txt-primary"
                            )}
                        >
                            {q} QUALITY
                        </button>
                     ))}
                  </div>

                  {isProcessing && (
                      <div className="text-center text-txt-tertiary text-sm animate-pulse flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Compressing...</span>
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
                     <FileDown className="w-12 h-12 text-txt-primary stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-3 relative z-10 mb-10">
                    <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">Compressed.</h2>
                    <p className="text-txt-secondary text-lg">Your file is ready.</p>
                  </div>

                  <div className="w-full space-y-4 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3"
                    >
                      <Download className="w-6 h-6" />
                      <span>Save Compressed PDF</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "var(--bg-element-hover)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="w-full py-4 rounded-2xl bg-transparent border border-border-strong hover:border-txt-primary text-txt-secondary hover:text-txt-primary font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Compress Another</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            
            </AnimatePresence>
          </div>
          
           {/* Footer / Legal */}
           <motion.footer variants={fadeInUp} className="mt-16 text-center text-xs text-txt-tertiary space-y-4 pb-8">
             <div className="flex justify-center space-x-8">
               <span className="opacity-50">Secure Local Processing</span>
             </div>
          </motion.footer>

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
