import { NextApiRequest, NextApiResponse } from 'next';
import heicConvert from 'heic-convert';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const config = {
  api: {
    bodyParser: false, // Handle raw stream
  },
};

// Helper: Read request stream to buffer
const readStream = (req: NextApiRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileId, chunkIndex, totalChunks } = req.query;

  if (!fileId || !chunkIndex || !totalChunks) {
    return res.status(400).json({ error: 'Missing metadata' });
  }

  const id = Array.isArray(fileId) ? fileId[0] : fileId;
  const index = parseInt(Array.isArray(chunkIndex) ? chunkIndex[0] : chunkIndex);
  const total = parseInt(Array.isArray(totalChunks) ? totalChunks[0] : totalChunks);
  
  // Use OS temp directory
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, `heic-${id}.tmp`);

  try {
    const chunkData = await readStream(req);
    
    // Append logic:
    // If index 0, write new file (or truncate).
    // Else append.
    // WARNING: Parallel chunks might race condition if not strictly sequential.
    // But our frontend will be sequential.
    
    if (index === 0) {
        fs.writeFileSync(filePath, chunkData);
    } else {
        fs.appendFileSync(filePath, chunkData);
    }
    
    // If last chunk, process
    if (index === total - 1) {
        console.log(`Processing assembled file ${id} (${total} chunks)`);
        const fullBuffer = fs.readFileSync(filePath);
        
        // Convert
        const outputBuffer = await heicConvert({
            buffer: fullBuffer,
            format: 'JPEG',
            quality: 0.8
        });
        
        // Cleanup temp file
        try { fs.unlinkSync(filePath); } catch {}
        
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="converted.jpg"');
        return res.send(outputBuffer);
    }
    
    return res.status(200).json({ status: 'ok', chunk: index });

  } catch (error: any) {
    console.error('Chunked upload error:', error);
    // Cleanup if possible
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    return res.status(500).json({ error: error.message || 'Processing failed' });
  }
}
