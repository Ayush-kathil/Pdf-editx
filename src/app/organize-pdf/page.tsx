'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Download, Trash2, ArrowLeft, Move, RotateCw, X } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';


export default function OrganizePDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ originalIndex: number; image: string; rotation: number; id: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Load PDF and render thumbnails
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
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
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please try another file.');
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
        copiedPage.setRotation(degrees(pageItem.rotation)); // Add rotation if any (simplified, might need accumulative logic)
        // Note: original page might have rotation. pdf-lib setRotation sets absolute rotation.
        // Usually we want to add to existing. But for simplicity here assume base 0 or absolute set.
        // Better approach: Read existing rotation and add.
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
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Failed to save PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-page text-txt-primary flex flex-col items-center pt-24 px-6 md:px-12 pb-20 transition-all">
       <a href="/" className="absolute top-6 left-6 p-3 rounded-full bg-element/50 backdrop-blur-md hover:bg-element hover:scale-110 active:scale-95 transition-all z-20 shadow-sm border border-border-color">
        <ArrowLeft className="w-6 h-6" />
      </a>

      <div className="w-full max-w-6xl text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-txt-primary to-txt-secondary animate-fade-in-up">
          Organize PDF
        </h1>
        <p className="text-lg text-txt-secondary">Reorder, rotate, or remove pages.</p>
      </div>

      {!pdfFile ? (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-xl"
        >
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border-strong rounded-3xl bg-card hover:bg-element/50 hover:border-txt-primary/50 transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-glow to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                    <FileUp className="w-16 h-16 text-txt-tertiary group-hover:text-txt-primary group-hover:scale-110 transition-all duration-300 mb-4" />
                    <p className="mb-2 text-lg text-txt-secondary"><span className="font-semibold text-txt-primary">Click to upload</span> or drag and drop</p>
                    <p className="text-sm text-txt-tertiary">PDF files only</p>
                </div>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
            </label>
        </motion.div>
      ) : (
        <div className="w-full max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-xl font-semibold text-txt-primary truncate max-w-xs">{pdfFile.name}</h3>
                <div className="flex space-x-3 w-full md:w-auto">
                     <button 
                        onClick={() => { setPdfFile(null); setPages([]); }}
                        className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-element hover:bg-element-hover text-txt-primary transition-all active:scale-95 text-sm font-medium border border-border-color"
                     >
                        Cancel
                    </button>
                    <button 
                        onClick={downloadPDF}
                        disabled={isProcessing}
                        className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-white dark:bg-white text-black hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all text-sm font-bold flex items-center justify-center shadow-lg hover:shadow-white/20"
                    >
                        {isProcessing ? 'Processing...' : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-enter delay-100">
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
                            className={`relative aspect-[3/4] bg-white rounded-xl shadow-md overflow-hidden group cursor-grab active:cursor-grabbing border-2 ${draggedItemIndex === index ? 'border-blue-500 opacity-50' : 'border-transparent hover:border-txt-tertiary'}`}
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
                            
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                                {index + 1}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
             {pages.length === 0 && (
                <div className="text-center py-20 text-txt-tertiary">
                    No pages left! Upload a new document?
                </div>
            )}
        </div>
      )}
    </div>
  );
}
