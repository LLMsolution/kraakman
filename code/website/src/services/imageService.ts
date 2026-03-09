// Image Service - Centralized image upload and management operations
// Handles all Supabase Storage operations for car images

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface ImageUploadResult {
  url: string;
  path: string;
}

export class ImageService {
  private readonly BUCKET_NAME = 'car-images';

  /**
   * Upload multiple images to Supabase Storage
   */
  async uploadImages(files: File[], carId: string): Promise<{ data: ImageUploadResult[] | null; error: Error | null }> {
    try {
      logger.apiCall('POST', '/storage/upload-images', { fileCount: files.length, carId });

      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${carId}/${Date.now()}-${index}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .upload(filePath, file, {
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