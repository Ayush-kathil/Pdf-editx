'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileVideo, Download, RefreshCw, X, Upload, Loader2, Film } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import Link from 'next/link';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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

export default function VideoConverter() {
  const [step, setStep] = useState<'UPLOAD' | 'SUCCESS'>('UPLOAD');
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<{name: string, blob: Blob}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100 overall
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            if (messageRef.current) messageRef.current.innerHTML = message;
        });

        // 1. Verify files exist before loading
        const jsPath = '/ffmpeg/ffmpeg-core.js';
        const wasmPath = '/ffmpeg/ffmpeg-core.wasm';
        
        try {
            const resp = await fetch(jsPath, { method: 'HEAD' });
            if (!resp.ok) throw new Error(`Global executable not found at ${jsPath} (${resp.status})`);
        } catch (netErr) {
             throw new Error(`Failed to access FFmpeg local files: ${(netErr as Error).message}`);
        }

        // 2. Load locally hosted core
        // We use toBlobURL to ensure correct MIME types are respected and avoid path resolution issues
        const coreBlob = await toBlobURL(jsPath, 'text/javascript');
        const wasmBlob = await toBlobURL(wasmPath, 'application/wasm');

        await ffmpeg.load({
            coreURL: coreBlob,
            wasmURL: wasmBlob,
            // workerURL: coreBlob, // Single threaded usually re-uses the main script or doesn't need explicit worker
        });
        
        setIsLoaded(true);
        console.log("Loaded FFmpeg Locally");
        setError(null);

    } catch (e: any) {
        console.error("FFmpeg local load failed", e);
        const msg = e instanceof Error ? e.message : (typeof e === 'string' ? e : JSON.stringify(e));
        setError(`Failed to load video engine: ${msg}. Check console for details.`);
    }
  };

  const handleFileSelect = (selectedFile: File | File[]) => {
    const newFiles = Array.isArray(selectedFile) ? selectedFile : [selectedFile];
    
    const validFiles = newFiles.filter(f => 
        f.name.toLowerCase().endsWith('.mov') || 
        f.type.includes('quicktime') || 
        f.type.includes('video')
    );

    if (validFiles.length === 0 && newFiles.length > 0) {
        setError('Please select valid video files (MOV).');
        return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (!isLoaded) {
        setError("Converter engine is still loading...");
        return;
    }
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setCurrentFileIndex(0);
    setConvertedFiles([]);

    const ffmpeg = ffmpegRef.current;
    const results: {name: string, blob: Blob}[] = [];

    try {
        for (let i = 0; i < files.length; i++) {
            setCurrentFileIndex(i);
            const file = files[i];
            const inputName = `input_${i}.mov`;
            const outputName = `output_${i}.mp4`;

            // Write file
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            // Run conversion
            // Preset ultrafast for speed, CRF 23 for balance
            await ffmpeg.exec(['-i', inputName, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', outputName]);

            // Read output
            const data = await ffmpeg.readFile(outputName);
            const blob = new Blob([(data as any).buffer], { type: 'video/mp4' });
            
            const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".mp4";
            results.push({ name: newFilename, blob });

            // Cleanup memory
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

            setProgress(Math.round(((i + 1) / files.length) * 100));
        }

        setConvertedFiles(results);
        setStep('SUCCESS');
    } catch (e: any) {
        console.error(e);
        setError("Conversion failed. Please try again with different files.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = (file?: {name: string, blob: Blob}) => {
    if (file) {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a); 
    } else {
        convertedFiles.forEach(f => {
            const url = URL.createObjectURL(f.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = f.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
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
                 <Film className="w-10 h-10 text-txt-primary stroke-[1.5]" />
               </div>
            </div>
            
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                MOV to MP4.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Convert MOV videos to MP4 format. <br/>
                <span className="text-txt-primary">Fast, Secure, Client-Side.</span>
                </p>
            </div>
          </header>

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
                      accept={{ 'video/quicktime': ['.mov'], 'video/mp4': ['.mp4'], 'video/*': [] }} 
                      label="Upload MOV videos"
                      subLabel="Drag & drop or click to select video files"
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

                  {!isLoaded && !error && (
                      <div className="text-center text-xs text-txt-tertiary">
                          Loading video engine...
                      </div>
                  )}

                  {files.length >= 1 && !isProcessing && isLoaded && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConvert}
                        className="w-full py-4 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-lg shadow-lg transition-all"
                      >
                        Convert {files.length} Videos
                      </motion.button>
                  )}

                  {isProcessing && (
                      <div className="space-y-2">
                          <div className="text-center text-txt-tertiary text-sm animate-pulse flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Converting {currentFileIndex + 1}/{files.length}... {progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-element rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-txt-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                              />
                          </div>
                          <p ref={messageRef} className="text-[10px] text-txt-quaternary text-center font-mono h-4 overflow-hidden" />
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
                     <Film className="w-12 h-12 text-txt-primary stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-3 relative z-10 mb-10">
                    <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">Converted.</h2>
                    <p className="text-txt-secondary text-lg">Your videos are ready.</p>
                  </div>

                  <div className="w-full space-y-4 relative z-10">
                    {convertedFiles.length === 1 ? (
                        <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(convertedFiles[0])}
                        className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3"
                        >
                        <Download className="w-6 h-6" />
                        <span>Download Video</span>
                        </motion.button>
                    ) : (
                         <div className="space-y-2 max-h-60 overflow-y-auto">
                            {convertedFiles.map((f, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-element rounded-xl">
                                    <span className="text-sm truncate max-w-[150px]">{f.name}</span>
                                    <button onClick={() => handleDownload(f)} className="text-xs bg-txt-primary text-page px-3 py-1 rounded-lg">Download</button>
                                </div>
                            ))}
                         </div>
                    )}
                    
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
