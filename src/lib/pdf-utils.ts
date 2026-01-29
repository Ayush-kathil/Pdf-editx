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

// --- New Tools Implementation ---

/**
 * Merge multiple PDFs into one
 */
export async function mergePdfs(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
    const { PDFDocument } = await import('pdf-lib');
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
}

/**
 * Split PDF - extracts a range of pages
 * @param startPage 1-based start index
 * @param endPage 1-based end index
 */
export async function splitPdf(pdfBuffer: ArrayBuffer, startPage: number, endPage: number): Promise<Uint8Array> {
    const { PDFDocument } = await import('pdf-lib');
    const srcPdf = await PDFDocument.load(pdfBuffer);
    const newPdf = await PDFDocument.create();

    // Convert 1-based to 0-based, ensure bounds
    const totalPages = srcPdf.getPageCount();
    const start = Math.max(0, startPage - 1);
    const end = Math.min(totalPages - 1, endPage - 1);

    if (start > end) throw new Error("Invalid page range");

    const pageIndices = [];
    for (let i = start; i <= end; i++) {
        pageIndices.push(i);
    }

    const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    return await newPdf.save();
}

/**
 * Rotate PDF pages
 * @param rotation Degrees to rotate (must be multiple of 90)
 */
export async function rotatePdf(pdfBuffer: ArrayBuffer, rotation: number): Promise<Uint8Array> {
    const { PDFDocument, degrees } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
    });

    return await pdfDoc.save();
}

/**
 * Convert Images to PDF with optional compression
 */
interface ImageToPdfOptions {
    scale: number; // 0 to 1, currently unused for scaling but kept for API consistency
    quality?: number; // 0 to 1, if present triggers re-encoding/compression
}

export async function imagesToPdf(
    imageBuffers: ArrayBuffer[], 
    options: ImageToPdfOptions = { scale: 1.0 }
): Promise<Uint8Array> {
    const { PDFDocument } = await import('pdf-lib');
    const newPdf = await PDFDocument.create();

    for (const buffer of imageBuffers) {
        let finalBuffer = buffer;

        // Apply compression if quality is specified
        if (options.quality !== undefined && options.quality < 1.0) {
             finalBuffer = await compressImageBuffer(buffer, options.quality);
        }

        let image;
        try {
            image = await newPdf.embedJpg(finalBuffer);
        } catch (e) {
            // Fallback to PNG if JPG fails (or if it was a PNG)
            try {
                image = await newPdf.embedPng(finalBuffer);
            } catch (e2) {
                 // If embedding fails (e.g. invalid format), try converting/compressing it first (if not already done)
                 // This handles cases where input might be other formats or purely raw
                 if (options.quality === undefined) {
                      const compressed = await compressImageBuffer(buffer, 0.9); // Default high quality conversion
                      image = await newPdf.embedJpg(compressed);
                 } else {
                     throw new Error('Unsupported image format or corruption.');
                 }
            }
        }

        const page = newPdf.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }

    return await newPdf.save();
}

// Helper to compress/convert image buffer using Canvas
async function compressImageBuffer(buffer: ArrayBuffer, quality: number): Promise<ArrayBuffer> {
    if (typeof window === 'undefined') throw new Error('Browser environment required');
    
    const blob = new Blob([buffer]);
    const bitmap = await createImageBitmap(blob);
    
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context failed');
    
    ctx.drawImage(bitmap, 0, 0);
    
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                blob.arrayBuffer().then(resolve).catch(reject);
            } else {
                reject(new Error('Compression failed'));
            }
        }, 'image/jpeg', quality);
    });
}
