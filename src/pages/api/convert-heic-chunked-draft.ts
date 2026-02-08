import { NextApiRequest, NextApiResponse } from 'next';
import heicConvert from 'heic-convert';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Per chunk limit (we send ~2MB chunks)
    },
  },
};

// Simple in-memory storage for chunks (For production, use Redis/S3/Disk)
// Warning: This is ephemeral and will break if server scales horizontally or restarts.
// For a simple single-instance deployment, it's acceptable for this task.
const chunksStore: Record<string, { chunks: Buffer[], totalChunks: number, receivedChunks: number }> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chunkIndex, totalChunks, fileId } = req.query;
    
    if (!chunkIndex || !totalChunks || !fileId) {
      return res.status(400).json({ error: 'Missing chunk metadata' });
    }

    const index = parseInt(chunkIndex as string);
    const total = parseInt(totalChunks as string);
    const id = fileId as string;

    // Initialize store for fileId if new
    if (!chunksStore[id]) {
        chunksStore[id] = { chunks: new Array(total), totalChunks: total, receivedChunks: 0 };
    }

    // Read chunk data
    // Assuming body is sent as buffer/text or raw. 
    // Actually, Next.js text/plain body parser might be easier or raw.
    // Let's assume client sends raw bytes with octet-stream and we read it.
    // Wait, with bodyParser enabled, we get req.body.
    // But we need raw buffer.
    // Let's disable bodyParser for this route too to be safe and consistent.
  } catch (e) {
      // placeholder for catch
  }
}
