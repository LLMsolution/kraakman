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
   * Delete an image from Supabase Storage
   */
  async deleteImage(filePath: string): Promise<{ error: Error | null }> {
    try {
      logger.apiCall('DELETE', '/storage/image', { filePath });

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        logger.apiError('DELETE', '/storage/image', error, { filePath });
        return { error: new Error(error.message) };
      }

      logger.info(`Successfully deleted image: ${filePath}`);
      return { error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Unknown error deleting image ${filePath}`);
      logger.apiError('DELETE', '/storage/image', error, { filePath });
      return { error };
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

  /**
   * Delete all images associated with a car
   */
  async deleteCarImages(carId: string): Promise<{ error: Error | null }> {
    try {
      logger.apiCall('DELETE', '/car-images/bulk', { carId });

      // First get all image records for this car
      const { data: imageRecords, error: fetchError } = await supabase
        .from('car_images')
        .select('url')
        .eq('car_id', carId);

      if (fetchError) {
        logger.apiError('GET', '/car-images', fetchError, { carId });
        return { error: new Error(fetchError.message) };
      }

      // Extract file paths from URLs
      const filePaths = imageRecords?.map(record => {
        // Extract path from URL: https://.../storage/v1/object/public/car-images/path
        const url = record.url;
        const pathMatch = url.match(/\/car-images\/(.+)$/);
        return pathMatch ? pathMatch[1] : null;
      }).filter(Boolean) as string[];

      // Delete from storage
      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filePaths);

        if (storageError) {
          logger.apiError('DELETE', '/storage/bulk', storageError, { filePaths });
          return { error: new Error(storageError.message) };
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('car_images')
        .delete()
        .eq('car_id', carId);

      if (dbError) {
        logger.apiError('DELETE', '/car-images', dbError, { carId });
        return { error: new Error(dbError.message) };
      }

      logger.info(`Deleted all images for car ${carId}`);
      return { error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Unknown error deleting images for car ${carId}`);
      logger.apiError('DELETE', '/car-images/bulk', error, { carId });
      return { error };
    }
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }

    // Check file name length
    if (file.name.length > 255) {
      return {
        isValid: false,
        error: 'File name too long. Maximum 255 characters.'
      };
    }

    return { isValid: true };
  }

  /**
   * Generate optimized image variants if needed
   */
  async generateOptimizedImages(originalFile: File, carId: string): Promise<{ data: File[] | null; error: Error | null }> {
    try {
      logger.info('Generating optimized image variants', { originalSize: originalFile.size });

      // For now, just return the original file
      // In the future, we could implement client-side resizing/compression
      const optimizedFiles = [originalFile];

      logger.info(`Generated ${optimizedFiles.length} image variants`);
      return { data: optimizedFiles, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error generating optimized images');
      logger.apiError('POST', '/images/optimize', error, { carId });
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();