/**
 * Handles the two-step image upload process for broadcast emails:
 * Step 1: Ask the backend for signed Cloudinary upload credentials.
 * Step 2: Upload the file directly to Cloudinary using those credentials.
 *
 * The returned `imageUrl` is a permanent CDN URL you embed in the email
 * body as <img src="imageUrl" />.
 *
 * Usage:
 *   const result = await uploadBroadcastImage(file, authToken);
 *   if (result.success) {
 *     console.log(result.imageUrl); // use this in the email
 *   } else {
 *     console.error(result.error); // show this to the admin
 *   }
 */

export interface UploadBroadcastImageResult {
  success: true;
  imageUrl: string;
  uploadUrl: string;
}

export interface UploadBroadcastImageError {
  success: false;
  error: string;
}

export type UploadBroadcastImageOutcome =
  | UploadBroadcastImageResult
  | UploadBroadcastImageError;

/**
 * This 5 MB limit is a FRONTEND-ONLY convention for a good user experience.
 * The backend does not currently enforce a file size limit itself, so this
 * check exists purely to stop the admin from accidentally choosing a huge
 * file and waiting a long time for nothing.
 */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export async function uploadBroadcastImage(
  file: File,
  authToken: string,
  apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL ?? ''
): Promise<UploadBroadcastImageOutcome> {
  // ── Step 0: Client-side validation ──────────────────────────────────────
  if (!file) {
    return { success: false, error: 'No file selected.' };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      success: false,
      error: `Unsupported file type "${file.type}". Please upload a JPEG, PNG, GIF, or WebP image.`,
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return {
      success: false,
      error: `Image is too large (${sizeMB} MB). Please use an image under 5 MB.`,
    };
  }

  // ── Step 1: Ask our backend for upload credentials ──────────────────────
  let uploadUrl: string;
  let fields: Record<string, string | number>;
  let imageUrl: string;

  try {
    const credentialResponse = await fetch(
      `${apiBaseUrl}/waitlist/broadcast/upload-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
        }),
      }
    );

    const credentialData = await credentialResponse.json();

    if (!credentialResponse.ok) {
      const message =
        credentialData?.message ?? `Server error (${credentialResponse.status})`;
      return { success: false, error: message };
    }

    uploadUrl = credentialData.data.uploadUrl;
    fields = credentialData.data.fields;
    imageUrl = credentialData.data.imageUrl;

    if (!uploadUrl || !fields || !imageUrl) {
      return {
        success: false,
        error: 'Received an incomplete response from the server. Please try again.',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Could not reach the server. Please check your connection and try again.',
    };
  }

  // ── Step 2: Upload the actual file straight to Cloudinary ───────────────
  try {
    const formData = new FormData();

    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, String(value));
    }

    // The file MUST be appended last.
    formData.append('file', file);

    const cloudinaryResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // ⚠️  Do NOT add a Content-Type header here.
      // The browser sets multipart/form-data with the correct boundary automatically.
      // Setting it manually breaks the upload.
    });

    if (!cloudinaryResponse.ok) {
      let cloudinaryError = `Image upload failed (${cloudinaryResponse.status}).`;
      try {
        const errorBody = await cloudinaryResponse.json();
        if (errorBody?.error?.message) {
          cloudinaryError = `Image upload failed: ${errorBody.error.message}`;
        }
      } catch {
        // Cloudinary's response wasn't JSON — keep the generic message above
      }
      return { success: false, error: cloudinaryError };
    }

    // Use the imageUrl from our own backend (Step 1), not Cloudinary's own
    // response — this keeps things consistent with our backend's expectations.
    return { success: true, imageUrl, uploadUrl };
  } catch {
    return {
      success: false,
      error: 'Could not upload the image to the CDN. Please check your connection and try again.',
    };
  }
}

/**
 * Quick helper to confirm a URL really is a Cloudinary URL before you
 * send it to the backend. Mirrors the same check the backend performs,
 * so you can catch mistakes before making a network request.
 */
export function isCloudinaryUrl(url: string): boolean {
  try {
    return new URL(url).hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}
