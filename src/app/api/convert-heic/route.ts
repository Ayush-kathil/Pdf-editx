import { NextRequest, NextResponse } from 'next/server';
import heicConvert from 'heic-convert';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.8  
    });

    // Create a new response with the image data
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.heic$/i, '.jpg')}"`,
      },
    });

  } catch (error: any) {
    console.error('HEIC conversion error:', error);
    return NextResponse.json(
      { error: 'Conversion failed', details: error.message },
      { status: 500 }
    );
  }
}
