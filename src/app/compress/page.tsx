'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Download, RefreshCw, X, ShieldCheck, FileInput, Eye } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { ShareButton } from '@/components/ui/ShareButton';
import { PreviewModal } from '@/components/ui/PreviewModal';
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
  const [step, setStep] = useState<'UPLOAD' | 'SETTINGS' | 'SUCCESS'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [compressedPdf, setCompressedPdf] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionMode, setCompressionMode] = useState<'QUALITY' | 'SIZE'>('QUALITY');
  const [quality, setQuality] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [targetSizeKB, setTargetSizeKB] = useState<number>(100);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File | File[]) => {
    if (Array.isArray(selectedFile)) return;
    setFile(selectedFile);
    setStep('SETTINGS');
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
        const fileBuffer = await file.arrayBuffer();
        let compressedBytes;
        
        if (compressionMode === 'SIZE') {
             compressedBytes = await compressPdf(fileBuffer, 'TARGET', targetSizeKB);
        } else {
             compressedBytes = await compressPdf(fileBuffer, quality);
        }
        
        setCompressedPdf(compressedBytes);
        setStep('SUCCESS');
        toast('PDF compressed successfully!', 'success');
    } catch (err: any) {
        toast(err.message || 'Failed to compress PDF.', 'error');
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

  const handleShare = async () => {
    if (!compressedPdf || !file) return;
    const blob = new Blob([compressedPdf as any], { type: 'application/pdf' });
    const fileName = `compressed_${file.name || 'document.pdf'}`;
    const shareFile = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
      try {
        await navigator.share({
          files: [shareFile],
          title: fileName,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast('Sharing not supported on this device/browser', 'error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setCompressedPdf(null);
    setPreviewModalUrl(null);
    setStep('UPLOAD');
  };

  const handlePreviewOpen = () => {
    if (!compressedPdf) return;
    const blob = new Blob([compressedPdf as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPreviewModalUrl(url);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    if (previewModalUrl) {
      URL.revokeObjectURL(previewModalUrl);
      setPreviewModalUrl(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                 <FileDown className="w-10 h-10 text-orange-500 stroke-[1.5]" />
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
                  <FileUpload onFileSelect={handleFileSelect} accept={{ 'application/pdf': ['.pdf'] }} />
                </motion.div>
              )}

              {step === 'SETTINGS' && (
                <motion.div
                   key="settings"
                   initial={{ opacity: 0, x: 50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -50 }}
                   transition={springTransition}
                   className="bg-card backdrop-blur-2xl border border-border-main shadow-xl p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-txt-primary/5 to-transparent pointer-events-none" />
                    
                    <button 
                        onClick={() => setStep('UPLOAD')}
                        className="absolute top-6 right-6 text-txt-tertiary hover:text-txt-primary transition-colors p-2 hover:bg-element-hover rounded-full z-10"
                        title="Cancel"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl font-bold mb-6 text-txt-primary relative z-10">Compression Settings</h2>
                    
                    <div className="relative z-10">
                        {/* Mode Toggle */}
                        <div className="flex bg-element p-1 rounded-xl mb-8">
                            <button 
                                onClick={() => setCompressionMode('QUALITY')}
                                className={clsx(
                                    "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                                    compressionMode === 'QUALITY' ? "bg-card text-txt-primary shadow-sm" : "text-txt-secondary hover:text-txt-primary"
                                )}
                            >
                                Quality
                            </button>
                            <button 
                                onClick={() => setCompressionMode('SIZE')}
                                className={clsx(
                                    "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                                    compressionMode === 'SIZE' ? "bg-card text-txt-primary shadow-sm" : "text-txt-secondary hover:text-txt-primary"
                                )}
                            >
                                Target Size
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="mb-8 space-y-6">
                            {compressionMode === 'QUALITY' ? (
                                <div className="space-y-4">
                                  <label className="block text-txt-primary font-medium">Compression Level</label>
                                  <div className="flex justify-center gap-4">
                                    {(['HIGH', 'MEDIUM', 'LOW'] as const).map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => setQuality(q)}
                                            className={clsx(
                                                "px-4 py-3 rounded-xl text-sm font-bold transition-all border flex-1",
                                                quality === q 
                                                    ? "bg-txt-primary text-page border-txt-primary" 
                                                    : "bg-element text-txt-secondary border-border-main hover:border-txt-primary"
                                            )}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                  </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="block text-txt-primary font-medium">Max File Size (KB)</label>
                                    <input 
                                        type="number" 
                                        value={targetSizeKB}
                                        onChange={(e) => setTargetSizeKB(parseInt(e.target.value) || 0)}
                                        className="w-full px-5 py-4 rounded-xl bg-element border border-border-main focus:border-txt-primary outline-none text-txt-primary"
                                    />
                                    <p className="text-sm text-txt-secondary">We will repeatedly compress the PDF until it fits this limit.</p>
                                </div>
                            )}
                            
                            <div className="bg-element/50 p-4 rounded-xl border border-border-main flex justify-between items-center text-sm">
                                <span className="text-txt-secondary">Original Size: </span>
                                <span className="text-txt-primary font-bold">{formatSize(file?.size || 0)}</span>
                            </div>
                        </div>

                        <button 
                             onClick={handleCompress}
                             disabled={isProcessing}
                             className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                        >
                             {isProcessing ? "Compressing..." : "Compress PDF"}
                        </button>
                    </div>
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
                     <FileDown className="w-12 h-12 text-orange-500 stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-3 relative z-10 mb-8">
                    <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">Compressed.</h2>
                    <div className="flex items-center justify-center gap-4 text-lg">
                        <span className="text-txt-tertiary line-through">{formatSize(file?.size || 0)}</span>
                        <span>→</span>
                        <span className="text-txt-primary font-bold">{formatSize(compressedPdf?.byteLength || 0)}</span>
                    </div>
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
                    
                    <ShareButton
                      onShare={handleShare}
                      className="w-full py-5 rounded-2xl bg-element border border-border-main hover:border-txt-primary text-txt-primary font-bold text-xl shadow-lg transition-all"
                      label="Share"
                    />
                    
                    <div className="flex gap-4 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "var(--bg-element-hover)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePreviewOpen}
                        className="flex-1 py-4 rounded-2xl bg-element border border-border-main hover:border-txt-primary text-txt-primary font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-5 h-5" />
                        <span>Preview</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "var(--bg-element-hover)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReset}
                        className="flex-1 py-4 rounded-2xl bg-transparent border border-border-strong hover:border-txt-primary text-txt-secondary hover:text-txt-primary font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Compress Another</span>
                      </motion.button>
                    </div>
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

       <PreviewModal
         isOpen={isPreviewModalOpen}
         onClose={closePreviewModal}
         fileSrc={previewModalUrl}
         fileType="pdf"
         fileName={`compressed_${file?.name || 'document.pdf'}`}
       />
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
