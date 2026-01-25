/**
 * Image Compression Options
 */
export interface ImageCompressionOptions {
    quality?: number; // 0 to 1
    targetSizeKB?: number; // If set, will attempt to compress under this size
    maxWidth?: number;
    maxHeight?: number;
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Compresses an image file securely in the browser using Canvas API.
 */
export async function compressImage(
    file: File, 
    options: ImageCompressionOptions = {}
): Promise<Blob> {
    const { 
        quality = 0.8, 
        targetSizeKB, 
        maxWidth = 1920, 
        maxHeight = 1920, 
        format = 'image/jpeg' 
    } = options;

    // 1. Load image
    const imageBitmap = await createImageBitmap(file);

    // 2. Calculate dimensions (maintain aspect ratio)
    let { width, height } = imageBitmap;
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
    }

    // 3. Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context failed');
    
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // 4. Compress
    // If targetSizeKB is provided, use binary search to find best quality
    if (targetSizeKB) {
        return compressToTargetSize(canvas, format, targetSizeKB * 1024);
    }

    // Simple compression
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
            format,
            quality
        );
    });
}

/**
 * Helper: Binary search to find quality that fits target size
 */
async function compressToTargetSize(
    canvas: HTMLCanvasElement, 
    format: string, 
    maxBytes: number
): Promise<Blob> {
    let minAcc = 0.01;
    let maxAcc = 1.0;
    let bestBlob: Blob | null = null;
    
    // Try max quality first to see if it already fits (if resized small enough)
    // Actually binary search is safer.
    
    let attempts = 0;
    while (minAcc <= maxAcc && attempts < 10) {
        const mid = (minAcc + maxAcc) / 2;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, mid));
        
        if (!blob) break;

        if (blob.size <= maxBytes) {
            bestBlob = blob; // This works, but maybe we can go higher?
            minAcc = mid + 0.05; // Try better quality
        } else {
            maxAcc = mid - 0.05; // Need lower quality
        }
        attempts++;
    }

    if (bestBlob) return bestBlob;
    
    // If we failed to reach target, return lowest quality possible
    const fallback = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, 0.1));
    if (fallback) return fallback;
    
    throw new Error('Could not compress image enough to meet target size.');
}
