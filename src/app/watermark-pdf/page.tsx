'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/toast-provider';

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

export default function WatermarkPDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [color, setColor] = useState('#FF0000');
  const [fontSize, setFontSize] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 0, b: 0 };
  };

  const handleFileUpload = (fileOrFiles: File | File[]) => {
    const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      toast('Please upload a valid PDF file.', 'error');
    }
  };

  const processPDF = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const { r, g, b } = hexToRgb(color);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - (fontSize * watermarkText.length / 4), // Rough center approximation
          y: height / 2,
          size: fontSize,
          color: rgb(r, g, b),
          opacity: opacity,
          rotate: degrees(45),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `watermarked-${pdfFile.name}`;
      link.click();
      toast('Watermark applied successfully.', 'success');
    } catch (error) {
      console.error('Error applying watermark:', error);
      toast('Failed to watermark PDF.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-page selection:bg-txt-primary/20">
       
       {/* Background Elements */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-element/20 rounded-full blur-[150px] animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-zinc-800/20 rounded-full blur-[150px] opacity-30" />
       </div>

      <motion.div 
        className="w-full max-w-6xl flex flex-col items-center z-10 pt-20"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <header className="mb-12 text-center space-y-5">
            <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter leading-tight">
                Watermark PDF.
                </h1>
                <p className="text-lg md:text-xl text-txt-secondary max-w-lg mx-auto leading-relaxed font-normal">
                Add secure text overlays to your documents.
                </p>
            </div>
        </header>

      {!pdfFile ? (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-xl"
        >
            <FileUpload 
                onFileSelect={handleFileUpload} 
                accept={{ 'application/pdf': ['.pdf'] }} 
                label="Upload PDF to Watermark"
                subLabel="Drag & drop or click to select"
            />
        </motion.div>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Controls */}
            <div className="md:col-span-1 space-y-6 bg-card/80 backdrop-blur-md p-6 rounded-3xl border border-border-main h-fit shadow-lg">
                <div>
                    <label className="block text-sm font-medium text-txt-secondary mb-2">Watermark Text</label>
                    <input 
                        type="text" 
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full bg-element border border-border-strong rounded-xl px-4 py-3 text-txt-primary focus:outline-none focus:border-txt-primary transition-colors focus:ring-2 focus:ring-txt-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-txt-secondary mb-2">Color</label>
                    <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-12 rounded-xl cursor-pointer bg-element border border-border-strong p-1"
                    />
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-txt-secondary mb-2">Font Size: {fontSize}px</label>
                    <input 
                        type="range" 
                        min="10" 
                        max="200" 
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-txt-primary h-2 bg-element rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-txt-secondary mb-2">Opacity: {Math.round(opacity * 100)}%</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="w-full accent-txt-primary h-2 bg-element rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <button 
                        onClick={processPDF}
                        disabled={isProcessing}
                        className="w-full py-3.5 rounded-xl bg-txt-primary text-page hover:bg-txt-primary/90 transition-all font-bold shadow-lg flex items-center justify-center"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                <span>Apply & Download</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={() => setPdfFile(null)}
                        className="w-full py-3 rounded-xl bg-transparent border border-border-strong hover:border-txt-primary text-txt-secondary hover:text-txt-primary transition-colors text-sm font-medium active:scale-95"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Preview (Simplified placeholder for now) */}
            <div className="md:col-span-2 bg-element/50 rounded-3xl border border-border-main flex items-center justify-center min-h-[400px] relative overflow-hidden">
                <div className="text-center p-10">
                    <p className="text-txt-tertiary mb-4">Preview not available (Static)</p>
                     <div className="w-64 h-80 bg-white shadow-xl mx-auto relative flex items-center justify-center overflow-hidden">
                        <p className="text-black text-xs absolute top-4 left-4">PDF Content...</p>
                        <p 
                            className="font-bold whitespace-nowrap"
                            style={{ 
                                color: color, 
                                opacity: opacity, 
                                fontSize: `${fontSize / 3}px`, // Scaled down for preview box
                                transform: 'rotate(-45deg)' 
                            }}
                        >
                            {watermarkText}
                        </p>
                     </div>
                </div>
            </div>
        </div>
      )}
      </motion.div>
    </main>
  );
}
