import { getSupabaseClient } from './supabase';

export type StorageBucket = 'products' | 'campaigns' | 'lookbook' | 'promotions';

export interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  folder?: string;
  maxSizeMB?: number;
}

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/heic', 'image/heif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Uploads a file to Supabase Storage with size and MIME type validation.
 */
export async function uploadMediaToStorage({
  bucket,
  file,
  folder = 'uploads',
  maxSizeMB = 20,
}: UploadOptions): Promise<UploadResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      url: '',
      path: '',
      error: 'Supabase is not configured with environment variables.',
    };
  }

  // Validate MIME type
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      url: '',
      path: '',
      error: `Unsupported file type (${file.type}). Please upload a valid image (JPEG, PNG, WebP, GIF) or video (MP4, WebM).`,
    };
  }

  // Validate File Size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return {
      url: '',
      path: '',
      error: `File size exceeds the ${maxSizeMB}MB limit (actual size: ${fileSizeMB.toFixed(1)}MB).`,
    };
  }

  try {
    // Generate clean unique filename
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error(`Storage upload error to bucket "${bucket}":`, error);
      return {
        url: '',
        path: '',
        error: error.message || 'Storage upload failed.',
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    return {
      url: '',
      path: '',
      error: err.message || 'An unexpected error occurred during file upload.',
    };
  }
}

/**
 * Deletes a file from Supabase Storage given its bucket and path.
 */
export async function deleteMediaFromStorage(bucket: StorageBucket, path: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
