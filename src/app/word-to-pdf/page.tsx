'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Download, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-provider';
import { FileUpload } from '@/components/ui/FileUpload';
import { PreviewModal } from '@/components/ui/PreviewModal';
import * as mammoth from 'mammoth';

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'SUCCESS'>('UPLOAD');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { toast } = useToast();
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (fileData: File | File[]) => {
    const selectedFile = Array.isArray(fileData) ? fileData[0] : fileData;
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        selectedFile.name.toLowerCase().endsWith('.docx')
      ) {
        setFile(selectedFile);
        processFile(selectedFile);
      } else {
        toast('Please upload a valid DOCX file', 'error');
      }
    }
  };

  const processFile = async (docFile: File) => {
    setStep('PROCESSING');
    try {
      // 1. Extract HTML from DOCX using mammoth
      const arrayBuffer = await docFile.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;

      if (!htmlContent) {
        throw new Error('Could not extract content from the document.');
      }

      // 2. Put HTML into the hidden container so html2pdf can read it
      if (hiddenContainerRef.current) {
        hiddenContainerRef.current.innerHTML = `
          <div style="padding: 40px; font-family: sans-serif; color: #000; background: #fff; min-height: 100%;">
            ${htmlContent}
          </div>
        `;
      }

      // 3. Import html2pdf dynamically and generate PDF
      const html2pdf = (await import('html2pdf.js')).default;
      const element = hiddenContainerRef.current;
      if (!element) throw new Error("Render container missing");
      
      const opt = {
        margin:       0,
        filename:     `converted-${docFile.name.replace('.docx', '.pdf')}`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      // Generate the PDF blob
      const pdfBuffer = await html2pdf().set(opt).from(element).outputPdf('arraybuffer');
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      
      setPdfBlob(blob);
      setStep('SUCCESS');
      toast('Converted to PDF successfully', 'success');
      
      // Clean up the DOM
      if (hiddenContainerRef.current) {
        hiddenContainerRef.current.innerHTML = '';
      }

    } catch (error) {
      console.error('Conversion error:', error);
      toast('Failed to convert document', 'error');
      setStep('UPLOAD');
      setFile(null);
    }
  };

  const handleDownload = () => {
    if (pdfBlob && file) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted-${file.name.replace('.docx', '.pdf')}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden bg-page">
      {/* Hidden container for rendering HTML to PDF */}
      <div className="hidden">
        <div ref={hiddenContainerRef} id="pdf-render-container"></div>
      </div>

      <div className="w-full max-w-4xl flex justify-start pt-20 mb-8 z-10">
        <Link href="/word" className="inline-flex items-center text-txt-secondary hover:text-txt-primary transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Word Suite</span>
        </Link>
      </div>

      <motion.div 
        className="w-full max-w-2xl bg-card border border-border-main rounded-3xl p-8 z-10 shadow-xl relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-txt-primary mb-2">Word to PDF</h1>
          <p className="text-txt-secondary">Securely convert your DOCX files to PDF directly in the browser.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'UPLOAD' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <FileUpload
                onFileSelect={handleFileUpload}
                accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
                label="Drop your Word document here"
              />
            </motion.div>
          )}

          {step === 'PROCESSING' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-txt-primary">Converting to PDF...</h2>
              <p className="text-txt-secondary mt-2">Extracting contents and generating layout</p>
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-txt-primary mb-2">Conversion Complete!</h2>
              <p className="text-txt-secondary mb-8">{file?.name} has been converted.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-6 py-3 rounded-xl bg-element border border-border-main hover:border-txt-primary text-txt-primary transition-all font-bold shadow-sm flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold shadow-lg flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </button>
              </div>
              
              <button
                onClick={() => {
                  setStep('UPLOAD');
                  setFile(null);
                  setPdfBlob(null);
                }}
                className="mt-8 text-txt-secondary hover:text-txt-primary text-sm font-medium transition-colors"
              >
                Convert another document
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {pdfBlob && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileSrc={URL.createObjectURL(pdfBlob)}
          fileType="pdf"
          fileName={`converted-${file?.name.replace('.docx', '.pdf')}`}
        />
      )}
    </main>
  );
}
