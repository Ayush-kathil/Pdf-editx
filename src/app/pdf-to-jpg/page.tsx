'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Download, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';


export default function PdfToJpg() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a valid PDF file.');
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

    } catch (error) {
      console.error('Error converting PDF:', error);
      alert('Failed to convert PDF.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-page text-txt-primary flex flex-col items-center pt-24 px-6 md:px-12 pb-20 transition-all">
       <a href="/" className="absolute top-6 left-6 p-3 rounded-full bg-element/50 backdrop-blur-md hover:bg-element hover:scale-110 active:scale-95 transition-all z-20 shadow-sm border border-border-color">
        <ArrowLeft className="w-6 h-6" />
      </a>

      <div className="w-full max-w-6xl text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-txt-primary to-txt-secondary animate-fade-in-up">
          PDF to JPG
        </h1>
        <p className="text-lg text-txt-secondary">Convert high-quality images from your PDF documents.</p>
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
        <div className="w-full max-w-md bg-card/80 backdrop-blur-md p-8 rounded-3xl border border-border-main text-center shadow-xl animate-enter">
            <div className="w-24 h-24 bg-element border border-border-strong rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ImageIcon className="w-12 h-12 text-txt-primary" />
            </div>
            <h3 className="text-xl font-bold text-txt-primary mb-2 line-clamp-1">{pdfFile.name}</h3>
            <p className="text-txt-secondary mb-8">Ready to convert to JPG</p>

            {isProcessing && (
                <div className="w-full bg-element rounded-full h-2 mb-6 overflow-hidden">
                    <motion.div 
                        className="bg-txt-primary h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="flex flex-col gap-3">
                <button 
                    onClick={convertToImages}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-white dark:bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold shadow-lg shadow-white/10 flex items-center justify-center"
                >
                    {isProcessing ? 'Converting...' : (
                        <>
                            <Download className="w-5 h-5 mr-2" />
                            Download ZIP
                        </>
                    )}
                </button>
                <button 
                    onClick={() => { setPdfFile(null); setProgress(0); }}
                    className="w-full py-3 rounded-xl bg-element hover:bg-element-hover text-txt-primary transition-all active:scale-95 font-medium border border-border-color"
                >
                    Cancel
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
