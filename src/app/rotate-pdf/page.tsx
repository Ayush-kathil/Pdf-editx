'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Download, RefreshCw, X } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { rotatePdf } from '@/lib/pdf-utils';
import { useToast } from '@/components/ui/toast-provider';
import clsx from 'clsx';
// import Link from 'next/link'; // Removed

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

export default function RotatePage() {
  const [step, setStep] = useState<'UPLOAD' | 'SUCCESS'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [rotatedPdfBytes, setRotatedPdfBytes] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File | File[]) => {
    if (Array.isArray(selectedFile)) return;
    setFile(selectedFile);
  };

  const handleRotate = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
        const buffer = await file.arrayBuffer();
        const result = await rotatePdf(buffer, rotation);
        setRotatedPdfBytes(result);
        setStep('SUCCESS');
        toast('PDF rotated successfully!', 'success');
    } catch (err: any) {
        toast(err.message || 'Failed to rotate PDF.', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedPdfBytes) return;
    const blob = new Blob([rotatedPdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rotated_${file?.name || 'document.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast('Download started.', 'info');
  };

  const handleReset = () => {
    setFile(null);
    setRotatedPdfBytes(null);
    setStep('UPLOAD');
    setRotation(90);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-page selection:bg-txt-primary/20">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[20%] w-[80vw] h-[80vw] bg-element/20 rounded-full blur-[150px] opacity-40 animate-pulse-slow" />
         <div className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[50vw] bg-zinc-800/20 rounded-full blur-[150px] opacity-30" />
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
                 <RotateCw className="w-10 h-10 text-txt-primary stroke-[1.5]" />
               </div>
            </div>
            
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                Rotate PDF.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Fix orientation instantly. <br/>
                <span className="text-txt-primary">All pages. No quality loss.</span>
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

                          {file && (
                              <div className="bg-card border border-border-main p-6 rounded-2xl space-y-4">
                                  <p className="text-txt-primary font-medium text-center">Rotation Angle (Clockwise)</p>
                                  <div className="flex items-center justify-center gap-4">
                                      {[90, 180, 270].map((deg) => (
                                          <button
                                              key={deg}
                                              onClick={() => setRotation(deg as any)}
                                              className={clsx(
                                                  "px-6 py-3 rounded-xl font-bold transition-all border",
                                                  rotation === deg 
                                                      ? "bg-txt-primary text-page border-txt-primary shadow-lg" 
                                                      : "bg-element text-txt-secondary border-border-main hover:border-txt-primary hover:text-txt-primary"
                                              )}
                                          >
                                              {deg}°
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          )}
                          
                          {file && !isProcessing && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRotate}
                                className="w-full py-4 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-lg shadow-lg transition-all"
                              >
                                Rotate PDF
                              </motion.button>
                          )}

                          {isProcessing && (
                              <div className="text-center text-txt-tertiary text-sm animate-pulse flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Rotating...</span>
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
                             <RotateCw className="w-12 h-12 text-txt-primary stroke-[1.5]" />
                          </div>
                          
                          <div className="space-y-3 relative z-10 mb-10">
                            <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">Rotated.</h2>
                            <p className="text-txt-secondary text-lg">Your PDF is ready.</p>
                          </div>

                          <div className="w-full space-y-4 relative z-10">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleDownload}
                              className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3"
                            >
                              <Download className="w-6 h-6" />
                              <span>Save Rotated PDF</span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.02, backgroundColor: "var(--bg-element-hover)" }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleReset}
                              className="w-full py-4 rounded-2xl bg-transparent border border-border-strong hover:border-txt-primary text-txt-secondary hover:text-txt-primary font-medium transition-colors flex items-center justify-center space-x-2"
                            >
                              <RefreshCw className="w-5 h-5" />
                              <span>Rotate Another</span>
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
