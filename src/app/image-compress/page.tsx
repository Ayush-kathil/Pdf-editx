'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Download, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { compressImage } from '@/lib/image-utils';
import clsx from 'clsx';

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

export default function ImageCompressPage() {
  const [step, setStep] = useState<'UPLOAD' | 'SETTINGS' | 'SUCCESS'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressionMode, setCompressionMode] = useState<'QUALITY' | 'SIZE'>('QUALITY');
  const [quality, setQuality] = useState<number>(0.8);
  const [targetSizeKB, setTargetSizeKB] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Basic validation for image type
    if (!selectedFile.type.startsWith('image/')) {
        setError("Please upload a valid image file (JPG, PNG, WebP).");
        return;
    }
    setFile(selectedFile);
    setStep('SETTINGS');
    setError(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
        const options: any = {};
        if (compressionMode === 'QUALITY') {
            options.quality = quality;
        } else {
            options.targetSizeKB = targetSizeKB;
        }

        const blob = await compressImage(file, options);
        setCompressedBlob(blob);
        setStep('SUCCESS');
    } catch (err: any) {
        setError(err.message || 'Compression failed.');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${file?.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setCompressedBlob(null);
    setStep('UPLOAD');
    setError(null);
  };

  // Helper to format bytes
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
         <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-element/20 rounded-full blur-[150px] opacity-40" />
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
                 <ImageIcon className="w-10 h-10 text-txt-primary stroke-[1.5]" />
               </div>
            </div>
            
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                Compress Image.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Optimize photos securely. <br/>
                <span className="text-txt-primary">Set target size or quality ratio.</span>
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
                >
                  <FileUpload onFileSelect={handleFileSelect} />
                  {error && (
                    <div className="mt-6 text-red-500 text-sm bg-red-500/10 p-4 rounded-xl text-center border border-red-500/20">
                        {error}
                    </div>
                  )}
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

                    <h2 className="text-2xl font-bold mb-6 text-txt-primary">Compression Settings</h2>
                    
                    {/* Mode Toggle */}
                    <div className="flex bg-element p-1 rounded-xl mb-8">
                        <button 
                            onClick={() => setCompressionMode('QUALITY')}
                            className={clsx(
                                "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                                compressionMode === 'QUALITY' ? "bg-card text-txt-primary shadow-sm" : "text-txt-secondary hover:text-txt-primary"
                            )}
                        >
                            Custom Quality
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
                                <div className="flex justify-between text-txt-primary font-medium">
                                    <span>Quality Level</span>
                                    <span>{Math.round(quality * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="1" 
                                    step="0.1" 
                                    value={quality} 
                                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-element rounded-lg appearance-none cursor-pointer accent-txt-primary"
                                />
                                <p className="text-sm text-txt-secondary">Lower quality = Smaller size</p>
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
                                <p className="text-sm text-txt-secondary">We will try to compress under this limit.</p>
                            </div>
                        )}
                        
                        <div className="bg-element/50 p-4 rounded-xl border border-border-main">
                            <span className="text-txt-secondary text-sm">Original Size: </span>
                            <span className="text-txt-primary font-bold">{formatSize(file?.size || 0)}</span>
                        </div>
                    </div>

                    <button 
                         onClick={handleCompress}
                         disabled={isProcessing}
                         className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-bg-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                    >
                         {isProcessing ? "Compressing..." : "Compress Image"}
                    </button>
                </motion.div>
              )}

              {step === 'SUCCESS' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springTransition}
                  className="bg-card backdrop-blur-3xl border border-border-main shadow-2xl p-12 rounded-[3rem] flex flex-col items-center text-center w-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-txt-primary/5 to-transparent pointer-events-none" />

                  <div className="w-24 h-24 bg-gradient-to-tr from-element to-element-hover rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10">
                     <ImageIcon className="w-12 h-12 text-txt-primary stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-2 relative z-10 mb-8">
                    <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">Done.</h2>
                    <div className="flex items-center justify-center gap-4 text-lg">
                        <span className="text-txt-tertiary line-through">{formatSize(file?.size || 0)}</span>
                        <span>→</span>
                        <span className="text-txt-primary font-bold">{formatSize(compressedBlob?.size || 0)}</span>
                    </div>
                  </div>

                  <div className="w-full space-y-4 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-bg-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3"
                    >
                      <Download className="w-6 h-6" />
                      <span>Download Image</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
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
               <a href="/" className="hover:text-txt-primary transition-colors">Back to Home</a>
             </div>
          </motion.footer>

      </motion.div>
    </main>
  );
}
