import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

interface UploadCredentials {
  uploadUrl: string;
  fields: {
    public_id: string;
    timestamp: number;
    api_key: string;
    signature: string;
  };
  imageUrl: string;
  expiresAt: string;
}

function buildCredentials(fileName: string, mimeType: string): UploadCredentials | null {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  // Build a stable public_id from a uuid + the original file stem
  const stem = (fileName || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .substring(0, 80);
  const publicId = `faflories/email-broadcasts/${crypto.randomUUID().slice(0, 8)}-${stem}`;

  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signature string: sorted params + secret
  const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

  // Derive the extension from mimeType
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  const ext = extMap[mimeType] ?? 'jpg';

  const expiresAt = new Date((timestamp + 15 * 60) * 1000).toISOString();

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    fields: {
      public_id: publicId,
      timestamp,
      api_key: apiKey,
      signature,
    },
    imageUrl: `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.${ext}`,
    expiresAt,
  };
}

export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const credentials = buildCredentials('image', 'image/jpeg');
    if (!credentials) {
      return NextResponse.json(
        { success: false, message: 'Cloudinary credentials are not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.' },
        { status: 503 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Upload credentials generated. Upload your image to uploadUrl using the provided fields, then use imageUrl in your email body.',
      data: credentials,
    });
  } catch (error: any) {
    console.error('[GET broadcast upload-url error]', error);
    return NextResponse.json(
      { success: false, message: 'Upload URL generation failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { fileName = 'image', mimeType = 'image/jpeg' } = body as {
      fileName?: string;
      mimeType?: string;
    };

    // Validate mimeType
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: [
            {
              field: 'body.mimeType',
              message: 'mimeType must be one of: image/jpeg, image/jpg, image/png, image/gif, image/webp',
            },
          ],
        },
        { status: 400 }
      );
    }

    // Validate fileName
    if (!fileName || String(fileName).length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: [{ field: 'body.fileName', message: 'fileName is required and must be at most 255 characters' }],
        },
        { status: 400 }
      );
    }

    const credentials = buildCredentials(fileName, mimeType);
    if (!credentials) {
      return NextResponse.json(
        { success: false, message: 'Cloudinary credentials are not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Upload credentials generated. Upload your image to uploadUrl using the provided fields, then use imageUrl in your email body.',
      data: credentials,
    });
  } catch (error: any) {
    console.error('[POST broadcast upload-url error]', error);
    return NextResponse.json(
      { success: false, message: 'Upload URL generation failed' },
      { status: 500 }
    );
  }
}
