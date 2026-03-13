'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Download, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-provider';
import { FileUpload } from '@/components/ui/FileUpload';
import * as XLSX from 'xlsx';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'SUCCESS'>('UPLOAD');
  const [excelBlob, setExcelBlob] = useState<Blob | null>(null);
  
  const { toast } = useToast();

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setFile(selectedFile);
        processFile(selectedFile);
      } else {
        toast('Please upload a valid PDF file', 'error');
      }
    }
  };

  const processFile = async (pdfFile: File) => {
    setStep('PROCESSING');
    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF library failed to load.');
      }
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let allRows: string[][] = [];

      // Basic linear extraction of text lines into rows to form an Excel column layout.
      // High-complexity tabular extraction is naturally limited client-side without OCR server APIs,
      // but this heuristic aggregates text elements on the same Y coordinates into rows.
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY = -1;
        let currentRow: string[] = [];

        for (const item of textContent.items) {
          const y = Math.round(item.transform[5]); // Round Y to group items on same line
          
          if (lastY !== -1 && Math.abs(lastY - y) > 5) { // Threshold for new line
             if (currentRow.length > 0) {
                 allRows.push([...currentRow]);
                 currentRow = [];
             }
          }
          currentRow.push(item.str);
          lastY = y;
        }
        if (currentRow.length > 0) {
          allRows.push([...currentRow]);
        }
        allRows.push([]); // Empty row as a separator between pages
      }

      // Convert the nested array into a SheetJS workbook
      const ws = XLSX.utils.aoa_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PDF Extracted Data");
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      setExcelBlob(blob);
      setStep('SUCCESS');
      toast('Pdf data extracted to Excel seamlessly', 'success');

    } catch (error) {
      console.error('Conversion error:', error);
      toast('Failed to generate Excel from PDF.', 'error');
      setStep('UPLOAD');
      setFile(null);
    }
  };

  const handleDownload = () => {
    if (excelBlob && file) {
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extracted-${file.name.replace('.pdf', '.xlsx')}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden bg-page">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-green-500/5 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <div className="w-full max-w-4xl flex justify-start pt-20 mb-8 z-10">
        <Link href="/excel" className="inline-flex items-center text-txt-secondary hover:text-txt-primary transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Excel Suite</span>
        </Link>
      </div>

      <motion.div 
        className="w-full max-w-2xl bg-card border border-border-main rounded-3xl p-8 z-10 shadow-xl relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <FileDown className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-txt-primary mb-2">PDF to Excel</h1>
          <p className="text-txt-secondary">Extract text structure from PDF into Excel rows and columns.</p>
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
                onFilesSelected={handleFileUpload}
                accept="application/pdf,.pdf"
                maxFiles={1}
                title="Drop your PDF here"
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
              <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-txt-primary">Extracting PDF Data...</h2>
              <p className="text-txt-secondary mt-2">Computing text layout coordinates implicitly into rows...</p>
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
                <FileDown className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-txt-primary mb-2">Extraction Complete!</h2>
              <p className="text-txt-secondary mb-8">{file?.name} grids have been computed.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all font-bold shadow-lg flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download XLSX format</span>
                </button>
              </div>
              
              <button
                onClick={() => {
                  setStep('UPLOAD');
                  setFile(null);
                  setExcelBlob(null);
                }}
                className="mt-8 text-txt-secondary hover:text-txt-primary text-sm font-medium transition-colors"
              >
                Convert another PDF
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
