// import { PDFDocument } from 'pdf-lib'; // Removed static import

// Declare global variable provided by the script tag
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

/**
 * Derives the standard Aadhaar password.
 */
export function derivePassword(fullName: string, yob: string): string {
  const cleanName = fullName.trim().replace(/\s+/g, ''); 
  const namePart = cleanName.substring(0, 4).toUpperCase();
  return `${namePart}${yob}`;
}

/**
 * Unlocks a PDF by strictly client-side rasterization.
 */
interface ProcessingOptions {
  scale: number;
  quality: number;
}

// Core generic function to process PDF (Rasterize -> Rebuild).
export async function processPdf(
    fileBuffer: ArrayBuffer, 
    password?: string, 
    options: ProcessingOptions = { scale: 2.0, quality: 0.85 }
): Promise<Uint8Array> {
  if (typeof window === 'undefined' || !window.pdfjsLib) {
    throw new Error('PDF Engine not loaded. Please refresh the page.');
  }

  // Dynamic import to avoid SSR issues
  const { PDFDocument } = await import('pdf-lib');

  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

  try {
    const loadOptions: any = { data: fileBuffer };
    if (password) {
        loadOptions.password = password;
    }

    const loadingTask = pdfjsLib.getDocument(loadOptions);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        
        const scale = options.scale; 
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) throw new Error('Canvas context failed');

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        const imageBytes = await new Promise<Uint8Array>((resolve) => {
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const buffer = await blob.arrayBuffer();
                    resolve(new Uint8Array(buffer));
                }
            }, 'image/jpeg', options.quality);
        });

        const embeddedImage = await newPdfDoc.embedJpg(imageBytes);
        
        // Maintain original visual dimensions
        const { width, height } = embeddedImage.scale(1 / scale);
        
        const newPage = newPdfDoc.addPage([width, height]);
        newPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width,
            height,
        });
        
        page.cleanup();
        canvas.width = 0; 
        canvas.height = 0;
    }
    
    loadingTask.destroy();
    return await newPdfDoc.save();

  } catch (error: any) {
    console.error('Processing failed:', error);
    if (error.name === 'PasswordException' || error.message?.includes('Password')) {
        throw new Error('Incorrect password. Please checking Name and Year of Birth.');
    }
    throw new Error('Could not process PDF. ' + error.message);
  }
}

/**
 * Wrapper for Unlocking (High Quality)
 */
export async function unlockPdf(fileBuffer: ArrayBuffer, password: string): Promise<Uint8Array> {
    return processPdf(fileBuffer, password, { scale: 2.0, quality: 0.85 });
}

/**
 * Wrapper for Compression (Standard Quality)
 */
export async function compressPdf(fileBuffer: ArrayBuffer, qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'): Promise<Uint8Array> {
    const settings = {
        HIGH: { scale: 1.5, quality: 0.7 },
        MEDIUM: { scale: 1.0, quality: 0.5 },
        LOW: { scale: 0.8, quality: 0.3 }
    };
    return processPdf(fileBuffer, undefined, settings[qualityLevel]);
}

export function createMemoryCleaner(references: any[]) {
    return () => {};
}
