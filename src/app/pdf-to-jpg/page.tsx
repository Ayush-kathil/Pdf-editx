'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/toast-provider';
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

export default function PdfToJpg() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = (fileOrFiles: File | File[]) => {
    const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      toast('Please upload a valid PDF file.', 'error');
    }
  };

  const convertToImages = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      const zip = new JSZip();

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // High quality 2x scale
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
            if (blob) {
                zip.file(`page-${i}.jpg`, blob);
            }
        }
        setProgress(Math.round((i / numPages) * 100));
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = `${pdfFile.name.replace('.pdf', '')}-images.zip`;
      link.click();
      toast('Images downloaded successfully.', 'success');

    } catch (error) {
      console.error('Error converting PDF:', error);
      toast('Failed to convert PDF.', 'error');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
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
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                PDF to JPG.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Convert high-quality images from your PDF documents.
                </p>
            </div>
          </header>

          <AnimatePresence mode="wait">
          {!pdfFile ? (
            <motion.div
               key="upload"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="w-full"
            >
                <FileUpload 
                    onFileSelect={handleFileUpload} 
                    accept={{ 'application/pdf': ['.pdf'] }} 
                    label="Upload PDF"
                    subLabel="Drag & drop or click to select"
                />
            </motion.div>
          ) : (
            <motion.div 
                key="convert"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-card/80 backdrop-blur-md p-8 rounded-[3rem] border border-border-main text-center shadow-2xl"
            >
                <div className="w-24 h-24 bg-gradient-to-tr from-element to-element-hover border border-border-strong rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <ImageIcon className="w-10 h-10 text-txt-primary" />
                </div>
                <h3 className="text-xl font-bold text-txt-primary mb-2 line-clamp-1">{pdfFile.name}</h3>
                <p className="text-txt-secondary mb-8">Ready to convert to JPG</p>

                {isProcessing && (
                    <div className="w-full space-y-2 mb-6">
                        <div className="flex justify-between text-xs text-txt-tertiary">
                             <span>Converting...</span>
                             <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-element rounded-full h-2 overflow-hidden">
                            <motion.div 
                                className="bg-txt-primary h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={convertToImages}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-2xl bg-txt-primary text-page hover:bg-txt-primary/90 transition-all font-bold shadow-lg flex items-center justify-center space-x-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Converting...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                <span>Download ZIP</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={() => { setPdfFile(null); setProgress(0); }}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-2xl bg-transparent border border-border-strong hover:border-txt-primary text-txt-secondary hover:text-txt-primary transition-all font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
          )}
          </AnimatePresence>
      </motion.div>
    </main>
  );
}
