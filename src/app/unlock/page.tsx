'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Download, RefreshCw, X, FileText, Lock } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { DetailsForm } from '@/components/ui/DetailsForm';
import { PasswordForm } from '@/components/ui/PasswordForm';
import { unlockPdf, derivePassword } from '@/lib/pdf-utils';

const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
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

type UnlockMode = 'AADHAR' | 'NORMAL';
type Step = 'MODE_SELECTION' | 'UPLOAD' | 'DETAILS' | 'SUCCESS';

export default function Home() {
  const [step, setStep] = useState<Step>('MODE_SELECTION');
  const [mode, setMode] = useState<UnlockMode>('AADHAR');
  const [file, setFile] = useState<File | null>(null);
  const [unlockedPdf, setUnlockedPdf] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // specific handlers
  const handleModeSelect = (selectedMode: UnlockMode) => {
    setMode(selectedMode);
    setStep('UPLOAD');
    setError(null);
  };

  // File selection handler
  const handleFileSelect = (selectedFile: File | File[]) => {
    if (Array.isArray(selectedFile)) return;
    setFile(selectedFile);
    setStep('DETAILS');
    setError(null);
  };

  // Processing handler for Aadhar
  const handleAadharUnlock = async (name: string, yob: string) => {
    if (!file) return;
    performUnlock(() => derivePassword(name, yob));
  };

  // Processing handler for Normal PDF
  const handleNormalUnlock = async (password: string) => {
    if (!file) return;
    performUnlock(async () => password); // Password is direct
  };

  const performUnlock = async (getPassword: () => Promise<string> | string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const password = await getPassword();
      const fileBuffer = await file!.arrayBuffer();
      const unlockedBytes = await unlockPdf(fileBuffer, password);
      
      setUnlockedPdf(unlockedBytes);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to unlock PDF. Please check the details/password.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset/Cleanup handler
  const handleReset = () => {
    setFile(null);
    setUnlockedPdf(null);
    setStep('MODE_SELECTION');
    setError(null);
  };

  // Download handler
  const handleDownload = () => {
    if (!unlockedPdf) return;
    const blob = new Blob([unlockedPdf as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unlocked_${file?.name || 'document.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-page selection:bg-txt-primary/20">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-element/20 rounded-full blur-[150px] animate-pulse-slow" />
         <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-zinc-800/20 rounded-full blur-[150px] opacity-30" />
      </div>

      <motion.div 
        className="w-full max-w-2xl flex flex-col items-center z-10 pt-20"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
          {/* Header */}
          <motion.header variants={fadeInUp} className="mb-12 text-center space-y-5">
            <div className="inline-flex items-center justify-center mb-2">
               <div className="p-4 bg-card rounded-[2rem] border border-border-main shadow-2xl backdrop-blur-xl">
                 <ShieldCheck className="w-10 h-10 text-txt-primary stroke-[1.5]" />
               </div>
            </div>
            
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                Secure Unlock.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Unlock your PDF locally. <br/>
                <span className="text-txt-primary">Zero data upload. 100% Client-side.</span>
                </p>
            </div>

            {/* External Link Section - Only display if initially desired or relevant */}
            {step === 'MODE_SELECTION' && (
                <motion.div 
                    className="pt-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <a 
                        href="https://myaadhaar.uidai.gov.in/genricDownloadAadhaar/en" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-element border border-border-main hover:bg-element-hover hover:border-txt-primary transition-all group"
                    >
                        <span className="text-xs font-medium text-txt-secondary group-hover:text-txt-primary transition-colors">Download e-Aadhaar from UIDAI</span>
                        <span className="text-[10px] text-txt-tertiary group-hover:text-txt-secondary">↗</span>
                    </a>
                </motion.div>
            )}
          </motion.header>

          {/* Main Content Area */}
          <motion.div 
            variants={fadeInUp}
            className="w-full"
          >
            <AnimatePresence mode="wait">
              
              {step === 'MODE_SELECTION' && (
                <motion.div
                  key="mode"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={springTransition}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeSelect('AADHAR')}
                        className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-card border border-border-main shadow-xl hover:border-txt-primary hover:shadow-2xl transition-all group"
                    >
                        <div className="p-4 rounded-2xl bg-element group-hover:bg-element-hover transition-colors mb-6">
                            <ShieldCheck className="w-8 h-8 text-txt-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-txt-primary mb-2">Aadhaar</h3>
                        <p className="text-sm text-txt-secondary text-center px-4">
                            Unlock e-Aadhaar using Name & Year of Birth.
                        </p>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeSelect('NORMAL')}
                        className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-card border border-border-main shadow-xl hover:border-txt-primary hover:shadow-2xl transition-all group"
                    >
                        <div className="p-4 rounded-2xl bg-element group-hover:bg-element-hover transition-colors mb-6">
                            <Lock className="w-8 h-8 text-txt-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-txt-primary mb-2">PDF</h3>
                        <p className="text-sm text-txt-secondary text-center px-4">
                            Unlock standard PDFs using your password.
                        </p>
                    </motion.button>
                </motion.div>
              )}

              {step === 'UPLOAD' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' }}
                  transition={springTransition}
                  className="relative"
                >
                  <button 
                        onClick={() => setStep('MODE_SELECTION')}
                        className="absolute -top-12 left-0 text-xs font-medium text-txt-tertiary hover:text-txt-primary transition-colors flex items-center space-x-1"
                    >
                        <span>← Back</span>
                    </button>
                  <FileUpload 
                    onFileSelect={handleFileSelect} 
                    label={mode === 'AADHAR' ? "Upload e-Aadhaar" : "Upload Locked PDF"}
                    subLabel={mode === 'AADHAR' ? "Upload your password-protected e-Aadhaar PDF" : "Upload any password-protected PDF file"}
                  />
                </motion.div>
              )}

              {step === 'DETAILS' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                  transition={springTransition}
                  className="bg-card backdrop-blur-2xl border border-border-main shadow-xl p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden"
                >
                    {/* Glossy gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-txt-primary/5 to-transparent pointer-events-none" />
                    
                    <button 
                        onClick={() => setStep('UPLOAD')}
                        className="absolute top-6 right-6 text-txt-tertiary hover:text-txt-primary transition-colors p-2 hover:bg-element-hover rounded-full z-10"
                        title="Cancel"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-8 text-txt-primary tracking-tight">
                            {mode === 'AADHAR' ? 'Enter Details' : 'Enter Password'}
                        </h2>
                        
                        {mode === 'AADHAR' && (
                            <div className="bg-element/50 border border-border-main p-4 rounded-2xl mb-8 flex gap-4 items-start">
                                <div className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-txt-primary shadow-sm" />
                                <p className="text-sm text-txt-secondary leading-relaxed">
                                    We derive the password from your <span className="text-txt-primary font-medium">Name</span> and <span className="text-txt-primary font-medium">Year of Birth</span>. 
                                    This happens strictly on your device.
                                </p>
                            </div>
                        )}
                        
                        {mode === 'AADHAR' ? (
                            <DetailsForm onSubmit={handleAadharUnlock} isProcessing={isProcessing} />
                        ) : (
                            <PasswordForm onSubmit={handleNormalUnlock} isProcessing={isProcessing} />
                        )}
                        
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 text-red-500 text-sm bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
              )}

              {step === 'SUCCESS' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={springTransition}
                  className="bg-card backdrop-blur-3xl border border-border-main shadow-2xl p-12 rounded-[3rem] flex flex-col items-center text-center relative overflow-hidden"
                >
                   {/* Background Glow */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-txt-primary/5 to-transparent pointer-events-none" />

                  <div className="w-24 h-24 bg-gradient-to-tr from-element to-element-hover rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10">
                     <ShieldCheck className="w-12 h-12 text-txt-primary stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-3 relative z-10 mb-10">
                    <h2 className="text-4xl font-bold text-txt-primary tracking-tighter">Unlocked.</h2>
                    <p className="text-txt-secondary text-lg">Your document is ready.</p>
                  </div>

                  <div className="w-full space-y-4 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="w-full py-5 rounded-2xl bg-txt-primary hover:bg-txt-primary/90 text-page font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-3"
                    >
                      <Download className="w-6 h-6" />
                      <span>Save PDF</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "var(--bg-element-hover)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="w-full py-4 rounded-2xl bg-transparent border border-border-strong hover:border-txt-primary text-txt-secondary hover:text-txt-primary font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Start Over</span>
                    </motion.button>
                  </div>
                  
                  <p className="text-[10px] uppercase tracking-widest text-txt-tertiary mt-8 relative z-10">
                    Memory cleared instantly
                  </p>
                </motion.div>
              )}
            
            </AnimatePresence>
          </motion.div>

          {/* Footer / Legal */}
          <motion.footer variants={fadeInUp} className="mt-16 text-center text-xs text-txt-tertiary space-y-4 pb-8">
             <p className="opacity-70">Not affiliated with UIDAI. Processed locally.</p>
             <div className="flex justify-center space-x-8">
               <a href="#" className="hover:text-txt-secondary transition-colors">Privacy</a>
               <a href="#" className="hover:text-txt-secondary transition-colors">Terms</a>
             </div>
          </motion.footer>
      </motion.div>
    </main>
  );
}
