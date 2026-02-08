import { NextApiRequest, NextApiResponse } from 'next';
import heicConvert from 'heic-convert';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle raw stream
  },
};

// Helper: Read stream to buffer
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

  try {
    // Read raw body (file content) directly from stream
    const inputBuffer = await readStream(req);

    if (!inputBuffer || inputBuffer.length === 0) {
      return res.status(400).json({ error: 'No file data received' });
    }

    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.8  
    });

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.jpg"');
    res.send(outputBuffer);

  } catch (error: any) {
    console.error('HEIC conversion error:', error);
    res.status(500).json({ error: 'Conversion failed', details: error.message });
  }
}
