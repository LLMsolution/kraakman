// Image Service - Centralized image upload and management operations
// Handles all Supabase Storage operations for car images

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface ImageUploadResult {
  url: string;
  path: string;
}

/**
 * Resize an image client-side before upload.
 * Caps at maxWidth (default 2400px) and converts to JPEG at 85% quality.
 * Returns the original file if it's already small enough or not an image.
 */
export async function resizeImage(file: File, maxWidth = 2400): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width <= maxWidth) { resolve(file); return; }

      const scale = maxWidth / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const resized = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
          logger.info(`Resized ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(resized.size / 1024).toFixed(0)}KB (${img.width}→${maxWidth}px)`);
          resolve(resized);
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export class ImageService {
  private readonly BUCKET_NAME = 'car-images';

  /**
   * Upload multiple images to Supabase Storage (resized client-side first)
   */
  async uploadImages(files: File[], carId: string): Promise<{ data: ImageUploadResult[] | null; error: Error | null }> {
    try {
      logger.apiCall('POST', '/storage/upload-images', { fileCount: files.length, carId });

      const uploadPromises = files.map(async (file, index) => {
        const resized = await resizeImage(file);
        const fileExt = resized.name.split('.').pop();
        const fileName = `${carId}/${Date.now()}-${index}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .upload(filePath, resized, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          throw new Error(`Upload failed for ${file.name}: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(filePath);

        return {
          url: publicUrl,
          path: filePath
        };
      });

      const results = await Promise.all(uploadPromises);
      logger.info(`Successfully uploaded ${results.length} images for car ${carId}`);
      return { data: results, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error uploading images');
      logger.apiError('POST', '/storage/upload-images', error, { carId });
      return { data: null, error };
    }
  }

  /**
   * Save image metadata to database
   */
  async saveImageMetadata(carId: string, images: ImageUploadResult[]): Promise<{ error: Error | null }> {
    try {
      logger.apiCall('POST', '/car-images', { carId, imageCount: images.length });

      const imageData = images.map((image, index) => ({
        car_id: carId,
        url: image.url,
        display_order: index
      }));

      const { error } = await supabase
        .from('car_images')
        .insert(imageData);

      if (error) {
        logger.apiError('POST', '/car-images', error, { carId, imageData });
        return { error: new Error(error.message) };
      }

      logger.info(`Saved metadata for ${images.length} images for car ${carId}`);
      return { error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error saving image metadata');
      logger.apiError('POST', '/car-images', error, { carId });
      return { error };
    }
  }

}

// Export singleton instance
export const imageService = new ImageService();