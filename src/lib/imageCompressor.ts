/**
 * Image compression and validation utility for Jem Luiqa Eyewear
 * Handles client-side WebP compression, HEIC conversion, and prescription file validation.
 */

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
  targetType?: 'image/webp' | 'image/jpeg';
}

export const PRESCRIPTION_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ADMIN_MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/**
 * Checks if a file is a supported image type (JPG, JPEG, PNG, WEBP, HEIC, HEIF)
 */
export function isAllowedImage(file: File): boolean {
  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = ALLOWED_IMAGE_MIMES.includes(file.type.toLowerCase()) || file.type === '';
  return hasValidExt || hasValidMime;
}

/**
 * Validates prescription upload file against the 5MB limit and allowed image types.
 */
export function validatePrescriptionFile(
  file: File,
  language: 'id' | 'en' = 'id'
): { valid: boolean; error?: string } {
  // 1. Check file size <= 5MB
  if (file.size > PRESCRIPTION_MAX_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error:
        language === 'id'
          ? `Ukuran file melebihi batas maksimal 5MB (file Anda: ${sizeInMB}MB). Silakan gunakan foto yang lebih kecil.`
          : `File size exceeds the 5MB limit (your file: ${sizeInMB}MB). Please choose a smaller photo.`,
    };
  }

  // 2. Check file format (strictly images: jpg, jpeg, png, webp, heic)
  if (!isAllowedImage(file)) {
    return {
      valid: false,
      error:
        language === 'id'
          ? 'Format file tidak didukung. Hanya file gambar (JPG, JPEG, PNG, WEBP, HEIC) yang diperbolehkan.'
          : 'Unsupported file format. Only image files (JPG, JPEG, PNG, WEBP, HEIC) are allowed.',
    };
  }

  return { valid: true };
}

/**
 * Converts HEIC/HEIF file or blob into a standard JPEG blob using heic2any.
 */
async function convertHeicToJpeg(file: File | Blob): Promise<Blob> {
  try {
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default || heic2anyModule;
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    return Array.isArray(result) ? result[0] : result;
  } catch (err) {
    console.error('Failed to convert HEIC with heic2any:', err);
    throw new Error('Gagal mengonversi file HEIC. Pastikan file tidak rusak.');
  }
}

/**
 * Checks if a file is HEIC format.
 */
function isHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

/**
 * Compresses an image file in the browser:
 * - Scales down dimensions if larger than maxDimension while preserving aspect ratio.
 * - Converts to optimized WebP (or JPEG fallback) at specified quality.
 * - Converts HEIC photos to standard format.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxDimension = 1920,
    quality = 0.82,
    targetType = 'image/webp',
  } = options;

  // If file is not an image (e.g. video), return as-is
  if (!isAllowedImage(file) && !file.type.startsWith('image/')) {
    return file;
  }

  let sourceBlob: Blob = file;

  // Convert HEIC if needed
  if (isHeic(file)) {
    sourceBlob = await convertHeicToJpeg(file);
  }

  // Load into HTMLImageElement
  const objectUrl = URL.createObjectURL(sourceBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Gagal membaca data gambar.'));
      image.src = objectUrl;
    });

    // Calculate scaled dimensions
    let { width, height } = img;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    // Draw on Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context tidak tersedia.');
    }

    // High quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Export to WebP blob (fallback to jpeg if webp unsupported)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            // Fallback to jpeg
            canvas.toBlob((fallbackBlob) => resolve(fallbackBlob), 'image/jpeg', quality);
          }
        },
        targetType,
        quality
      );
    });

    if (!blob) {
      throw new Error('Gagal menghasilkan file kompresi dari canvas.');
    }

    // Generate output file name with .webp extension
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const extension = blob.type === 'image/webp' ? '.webp' : '.jpg';
    const outputFileName = `${cleanBaseName}${extension}`;

    return new File([blob], outputFileName, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
