'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Download, ArrowLeft, Type } from 'lucide-react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

export default function WatermarkPDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [color, setColor] = useState('#FF0000');
  const [fontSize, setFontSize] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 0, b: 0 };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a valid PDF file.');
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
    } catch (error) {
      console.error('Error applying watermark:', error);
      alert('Failed to watermak PDF.');
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
          Watermark PDF
        </h1>
        <p className="text-lg text-txt-secondary">Add secure text overlays to your documents.</p>
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
                        className="w-full py-3.5 rounded-xl bg-white dark:bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold shadow-lg shadow-white/10 flex items-center justify-center"
                    >
                        {isProcessing ? 'Processing...' : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                Apply & Download
                            </>
                        )}
                    </button>
                    <button 
                        onClick={() => setPdfFile(null)}
                        className="w-full py-3 rounded-xl bg-element hover:bg-element-hover text-txt-primary transition-colors text-sm font-medium border border-border-color active:scale-95"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Preview (Simplified placeholder for now) */}
            <div className="md:col-span-2 bg-element/50 rounded-3xl border border-border-main flex items-center justify-center min-h-[400px] relative overflow-hidden animate-enter delay-200">
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
    </div>
  );
}
