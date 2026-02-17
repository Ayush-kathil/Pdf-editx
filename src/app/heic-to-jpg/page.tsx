'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Download, RefreshCw, X, ArrowUp, ArrowDown, Camera, Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import clsx from 'clsx';
import { useToast } from '@/components/ui/toast-provider';
// import heic2any from 'heic2any'; // Removed for SSR compatibility
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
  const [failedFiles, setFailedFiles] = useState<{name: string, reason: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  /* Removed top-level import to fix SSR error */
  // import heic2any from 'heic2any'; 

  const handleFileSelect = async (selectedFile: File | File[]) => {
    const newFiles = Array.isArray(selectedFile) ? selectedFile : [selectedFile];
    processFiles(newFiles);
  };

  const processFiles = (newFiles: File[]) => {
    // Filter HEIC files
    const validFiles = newFiles.filter(f => 
        f.name.toLowerCase().endsWith('.heic') || 
        f.type === 'image/heic' || 
        f.type === 'image/heif'
    );

    if (validFiles.length === 0) {
        if (newFiles.length > 0) {
             toast('No valid HEIC files found in selection.', 'error');
        }
        return;
    }
    
    if (validFiles.length !== newFiles.length) {
         // Optional: warning about skipped files, but for folder select it might be annoying
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const fileList = Array.from(e.target.files);
          processFiles(fileList);
      }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
        toast('Please upload at least 1 HEIC image.', 'error');
        return;
    }

    setIsProcessing(true);
    setProgress(0);
    setConvertedFiles([]);
    setFailedFiles([]);

    const results: {name: string, blob: Blob}[] = [];
    const failures: {name: string, reason: string}[] = [];

    try {
        // Dynamic import to fix "window is not defined" SSR error
        const heic2any = (await import('heic2any')).default;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                // Add a small delay to allow UI updates and GC
                await new Promise(resolve => setTimeout(resolve, 50));

                // heic2any returns Blob | Blob[]
                const resultBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });

                const blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
                const newName = file.name.replace(/\.heic$/i, '.jpg');
                results.push({ name: newName, blob });
            } catch (e: any) {
                console.warn(`Client-side conversion failed for ${file.name}, trying server fallback...`, e);

                try {
                    // Fallback to server-side conversion with CHUNKED upload to bypass 4.5MB limits
                    console.log(`Falling back to chunked upload for ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
                    
                    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks (safe for Vercel/proxies)
                    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                    const fileId = Math.random().toString(36).substring(7) + Date.now(); // Simple ID
                    
                    let response;
                    
                    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                        const start = chunkIndex * CHUNK_SIZE;
                        const end = Math.min(start + CHUNK_SIZE, file.size);
                        const chunk = file.slice(start, end);
                        
                        // Last chunk?
                        const isLast = chunkIndex === totalChunks - 1;
                        
                        // Send chunk
                        // We use query params for metadata to keep body raw
                        const url = `/api/convert-heic-chunked?fileId=${fileId}&chunkIndex=${chunkIndex}&totalChunks=${totalChunks}`;
                        
                        response = await fetch(url, {
                            method: 'POST',
                            body: chunk,
                            headers: {
                                'Content-Type': 'application/octet-stream',
                            }
                        });

                        if (!response.ok) {
                             throw new Error(`Chunk ${chunkIndex} failed: ${response.statusText}`);
                        }
                    }

                    // The last response contains the converted image
                    if (!response) throw new Error("No response from server");
                    
                    const blob = await response.blob();
                    // Check if it's actually an image (sometimes error pages return 200 OK HTML)
                    if (blob.type.includes('text') || blob.type.includes('html') || blob.size < 100) {
                         // Potentially an error disguised as success if not handled right
                         // But we'll assume success if response.ok was true for now, 
                         // or we could check header.
                    }

                    const newName = file.name.replace(/\.heic$/i, '.jpg');
                    results.push({ name: newName, blob });

                } catch (serverError: any) {
                    console.error(`Server chunked conversion also failed for ${file.name}`, serverError);
                    
                    let reason = "Conversion failed";
                    if (serverError instanceof Error) {
                        reason = serverError.message;
                    } else if (typeof serverError === 'string') {
                        reason = serverError;
                    }

                    failures.push({ 
                        name: file.name, 
                        reason: `Client & Server: ${reason}`
                    });
                }
            }
            
            // Update progress
            setProgress(Math.round(((i + 1) / files.length) * 100));
        }

        if (results.length === 0 && failures.length > 0) {
            throw new Error(`Failed to convert all files. ${failures[0].reason}`);
        }
        
        setConvertedFiles(results);
        setFailedFiles(failures);
        setStep('SUCCESS');
        toast(`Converted ${results.length} images.`, 'success');
        if (failures.length > 0) {
             toast(`${failures.length} images failed to convert.`, 'error');
        }
    } catch (err: any) {
        toast(err.message || 'Failed to convert images.', 'error');
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
    toast('Download started.', 'info');
  };

  const handleReset = () => {
    setFiles([]);
    setConvertedFiles([]);
    setFailedFiles([]);
    setStep('UPLOAD');
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
                  <FileUpload 
                      onFileSelect={handleFileSelect} 
                      accept={{ 'image/heic': ['.heic'], 'image/heif': ['.heif'] }} 
                      label="Upload HEIC images"
                      subLabel="Select multiple HEIC files or use the button below for folders."
                      multiple={true}
                  />

                  <div className="flex justify-center">
                    <label className="cursor-pointer px-6 py-3 rounded-xl bg-element border border-border-main hover:border-txt-primary hover:bg-element-hover text-txt-secondary hover:text-txt-primary transition-all font-medium flex items-center space-x-2">
                        <ImageIcon className="w-5 h-5" />
                        <span>Select Folder (Album)</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            {...({ webkitdirectory: "", directory: "" } as any)}
                            onChange={handleFolderSelect}
                            multiple
                        />
                    </label>
                  </div>

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
                    <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">
                        {convertedFiles.length > 0 ? 'Converted!' : 'Failed'}
                    </h2>
                    <p className="text-txt-secondary text-lg">
                        Successfully converted {convertedFiles.length} images.
                        {failedFiles.length > 0 && (
                            <span className="text-red-400 block mt-1">
                                {failedFiles.length} images failed.
                            </span>
                        )}
                    </p>
                  </div>
                  
                  {failedFiles.length > 0 && (
                      <div className="w-full max-w-md bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-left max-h-40 overflow-y-auto">
                          <p className="text-red-400 font-medium text-sm mb-2">Failed Files:</p>
                          <ul className="space-y-1">
                              {failedFiles.map((f, i) => (
                                  <li key={i} className="text-xs text-red-300 flex justify-between">
                                      <span className="truncate flex-1 pr-2">{f.name}</span>
                                      <span className="opacity-70">{f.reason}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}

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
