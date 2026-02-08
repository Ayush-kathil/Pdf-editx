'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Download, RefreshCw, X, ArrowUp, ArrowDown, Camera, Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import clsx from 'clsx';
import Link from 'next/link';
import heic2any from 'heic2any';
import JSZip from 'jszip';

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

export default function HeicToJpgPage() {
  const [step, setStep] = useState<'UPLOAD' | 'SUCCESS'>('UPLOAD');
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<{name: string, blob: Blob}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File | File[]) => {
    const newFiles = Array.isArray(selectedFile) ? selectedFile : [selectedFile];
    
    // Filter HEIC files
    const validFiles = newFiles.filter(f => 
        f.name.toLowerCase().endsWith('.heic') || 
        f.type === 'image/heic' || 
        f.type === 'image/heif'
    );

    if (validFiles.length === 0) {
        setError('Please select valid HEIC files.');
        return;
    }
    
    if (validFiles.length !== newFiles.length) {
         setError('Some files were ignored because they were not HEIC images.');
    } else {
         setError(null);
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
        setError('Please upload at least 1 HEIC image.');
        return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setConvertedFiles([]);

    const results: {name: string, blob: Blob}[] = [];

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                // heic2any returns Blob | Blob[]
                const resultBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });

                const blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
                const newName = file.name.replace(/\.heic$/i, '.jpg');
                results.push({ name: newName, blob });
            } catch (e) {
                console.error(`Failed to convert ${file.name}`, e);
            }
            
            // Update progress
            setProgress(Math.round(((i + 1) / files.length) * 100));
        }

        if (results.length === 0) {
            throw new Error("Failed to convert files.");
        }
        
        setConvertedFiles(results);
        setStep('SUCCESS');
    } catch (err: any) {
        setError(err.message || 'Failed to convert images.');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (convertedFiles.length === 0) return;

    if (convertedFiles.length === 1) {
        // Download single file
        const file = convertedFiles[0];
        const url = URL.createObjectURL(file.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        // Download ZIP
        const zip = new JSZip();
        convertedFiles.forEach(file => {
            zip.file(file.name, file.blob);
        });
        
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = "converted_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setConvertedFiles([]);
    setStep('UPLOAD');
    setError(null);
    setProgress(0);
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
                 <Camera className="w-10 h-10 text-txt-primary stroke-[1.5]" />
               </div>
            </div>
            
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                HEIC to JPG.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Convert your iPhone photos to JPG. <br/>
                <span className="text-txt-primary">Fast, Secure, Local.</span>
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
                    <Link 
                        href="/"
                        className="absolute -top-12 left-0 text-xs font-medium text-txt-tertiary hover:text-txt-primary transition-colors flex items-center space-x-1"
                    >
                        <span>← Back</span>
                    </Link>

                  <FileUpload 
                      onFileSelect={handleFileSelect} 
                      accept={{ 'image/heic': ['.heic'], 'image/heif': ['.heif'] }} 
                      label="Upload HEIC images"
                      subLabel="Select multiple HEIC files to convert."
                      multiple={true}
                  />

                  {/* File List */}
                  {files.length > 0 && (
                      <div className="space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-card border border-border-main p-3 rounded-xl">
                                <span className="text-sm text-txt-secondary truncate max-w-[200px]">{file.name}</span>
                                <button onClick={() => removeFile(index)} className="p-1 text-red-500/70 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                      </div>
                  )}

                  {files.length >= 1 && !isProcessing && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConvert}
                        className="w-full py-4 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-lg shadow-lg transition-all"
                      >
                        Convert {files.length} Images
                      </motion.button>
                  )}

                  {isProcessing && (
                      <div className="space-y-2">
                          <div className="text-center text-txt-tertiary text-sm animate-pulse flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Converting... {progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-element rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-txt-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                              />
                          </div>
                      </div>
                  )}

                  {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm bg-red-500/10 p-4 rounded-2xl text-center border border-red-500/20"
                    >
                        {error}
                    </motion.div>
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
                     <Camera className="w-12 h-12 text-txt-primary stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-3 relative z-10 mb-10">
                    <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">Converted.</h2>
                    <p className="text-txt-secondary text-lg">Your images are ready.</p>
                  </div>

                  <div className="w-full space-y-4 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3"
                    >
                      <Download className="w-6 h-6" />
                      <span>{convertedFiles.length > 1 ? 'Download All (ZIP)' : 'Save Image'}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "var(--bg-element-hover)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="w-full py-4 rounded-2xl bg-transparent border border-border-strong hover:border-txt-primary text-txt-secondary hover:text-txt-primary font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Convert More</span>
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
