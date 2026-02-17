'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, RotateCw, Loader2 } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
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

export default function OrganizePDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ originalIndex: number; image: string; rotation: number; id: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Load PDF and render thumbnails
  const handleFileUpload = async (fileOrFiles: File | File[]) => {
    const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast('Please upload a valid PDF file.', 'error');
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      const newPages = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 }); // Thumbnail scale
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            newPages.push({
            originalIndex: i - 1, // 0-based index for pdf-lib
            image: canvas.toDataURL(),
            rotation: 0,
            id: crypto.randomUUID(),
            });
        }
      }
      setPages(newPages);
      toast('PDF pages loaded successfully.', 'success');
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast('Failed to load PDF. Please try another file.', 'error');
      setPdfFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newPages = [...pages];
    const draggedItem = newPages[draggedItemIndex];
    newPages.splice(draggedItemIndex, 1);
    newPages.splice(index, 0, draggedItem);
    setPages(newPages);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const rotatePage = (index: number) => {
    const newPages = [...pages];
    newPages[index].rotation = (newPages[index].rotation + 90) % 360;
    setPages(newPages);
  };

  const removePage = (index: number) => {
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
  };

  const downloadPDF = async () => {
    if (!pdfFile || pages.length === 0) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (const pageItem of pages) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageItem.originalIndex]);
        
        // Add existing rotation logic if needed, simplify here
        const existingRotation = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees(existingRotation + pageItem.rotation));
        
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `organized-${pdfFile.name}`;
      link.click();
      toast('PDF saved successfully.', 'success');
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast('Failed to save PDF.', 'error');
    } finally {
      setIsProcessing(false);
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
        className={clsx("w-full z-10 pt-20", pdfFile ? "max-w-6xl" : "max-w-2xl")}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
          {/* Header */}
          {!pdfFile && (
              <header className="mb-12 text-center space-y-5">
                <div className="space-y-3">
                    <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                    Organize PDF.
                    </h1>
                    <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                    Reorder, rotate, or remove pages.
                    </p>
                </div>
              </header>
          )}

      {!pdfFile ? (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full relative"
        >
            <FileUpload 
                onFileSelect={handleFileUpload} 
                accept={{ 'application/pdf': ['.pdf'] }} 
                label="Upload PDF to Organize"
                subLabel="Drag & drop or click to select"
            />
        </motion.div>
      ) : (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-card/50 p-6 rounded-3xl border border-border-main backdrop-blur-md">
                <h3 className="text-xl font-bold text-txt-primary truncate max-w-xs">{pdfFile.name}</h3>
                <div className="flex space-x-3 w-full md:w-auto">
                     <button 
                        onClick={() => { setPdfFile(null); setPages([]); }}
                        className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-transparent border border-border-strong text-txt-secondary hover:text-txt-primary hover:border-txt-primary transition-all font-medium"
                     >
                        Cancel
                    </button>
                    <button 
                        onClick={downloadPDF}
                        disabled={isProcessing}
                        className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-txt-primary text-page hover:bg-txt-primary/90 transition-all font-bold shadow-lg flex items-center justify-center space-x-2"
                    >
                        {isProcessing ? 'Processing...' : (
                            <>
                                <Download className="w-5 h-5" />
                                <span>Save PDF</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isProcessing && pages.length === 0 && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-txt-primary" />
                    <span className="ml-2 text-txt-secondary">Loading pages...</span>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-enter">
                <AnimatePresence>
                    {pages.map((page, index) => (
                        <motion.div
                            key={page.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={clsx(
                                "relative aspect-[3/4] bg-white rounded-xl shadow-lg overflow-hidden group cursor-grab active:cursor-grabbing border-2 transition-all",
                                draggedItemIndex === index ? 'border-txt-primary opacity-50' : 'border-transparent hover:border-txt-tertiary'
                            )}
                        >
                            <img 
                                src={page.image} 
                                alt={`Page ${index + 1}`} 
                                className="w-full h-full object-contain"
                                style={{ transform: `rotate(${page.rotation}deg)` }}
                            />
                            
                            <div className="absolute top-2 right-2 flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg p-1">
                                <button 
                                    onClick={() => rotatePage(index)}
                                    className="p-1.5 rounded-md hover:bg-white/20 text-white transition-colors"
                                    title="Rotate"
                                >
                                    <RotateCw className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => removePage(index)}
                                    className="p-1.5 rounded-md hover:bg-red-500/80 text-white transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-mono">
                                {index + 1}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
             {!isProcessing && pages.length === 0 && (
                <div className="text-center py-20 text-txt-tertiary bg-card/30 rounded-3xl border border-dashed border-border-main">
                    No pages left! Upload a new document?
                </div>
            )}
        </div>
      )}
      </motion.div>
    </main>
  );
}
