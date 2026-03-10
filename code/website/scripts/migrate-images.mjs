#!/usr/bin/env node
/**
 * Migrate car images from WordPress URLs to Supabase Storage
 *
 * Usage: node scripts/migrate-images.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://asqamsbnrjldkxievcmj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcWFtc2JucmpsZGt4aWV2Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTAsImV4cCI6MjA4ODU1NDQ1MH0.zV1gLqdaBNmwNrZ_DlxbuU6fB4pl5pOJbwzjyazBpGk';

const BUCKET = 'car-images';
const BATCH_SIZE = 5; // Concurrent downloads
const TEMP_DIR = '/tmp/car-images-migration';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in as admin for upload permissions
async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'timlind18@icloud.com',
    password: 'Test123',
  });
  if (error) throw new Error(`Auth failed: ${error.message}`);
  console.log('Signed in as admin');
  return data;
}

// Fetch all car images from DB
async function fetchAllImages() {
  const { data, error } = await supabase
    .from('car_images')
    .select('id, car_id, url, display_order')
    .order('car_id')
    .order('display_order');

  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return data;
}

// Download image from WordPress URL
async function downloadImage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ImageMigration/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}

// Get file extension from URL or content type
function getExtension(url, contentType) {
  // Try from URL first
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext)) {
    return ext;
  }
  // Fallback to content type
  const typeMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
  };
  return typeMap[contentType] || '.jpg';
}

// Upload image to Supabase Storage
async function uploadToStorage(buffer, storagePath, contentType) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

// Update image URL in database
async function updateImageUrl(imageId, newUrl) {
  const { error } = await supabase
    .from('car_images')
    .update({ url: newUrl })
    .eq('id', imageId);

  if (error) throw new Error(`DB update failed for ${imageId}: ${error.message}`);
}

// Process a batch of images
async function processBatch(images, startIdx) {
  const results = await Promise.allSettled(
    images.map(async (img, i) => {
      const idx = startIdx + i;
      try {
        // Skip if already migrated
        if (img.url.includes('supabase.co')) {
          console.log(`  [${idx + 1}] Already migrated, skipping`);
          return { status: 'skipped', id: img.id };
        }

        // Download from WordPress
        const { buffer, contentType } = await downloadImage(img.url);
        const ext = getExtension(img.url, contentType);

        // Create storage path: car_id/display_order_originalname.ext
        const originalName = path.basename(new URL(img.url).pathname, path.extname(new URL(img.url).pathname));
        const storagePath = `${img.car_id}/${img.display_order}_${originalName}${ext}`;

        // Upload to Supabase Storage
        const newUrl = await uploadToStorage(buffer, storagePath, contentType);

        // Update database
        await updateImageUrl(img.id, newUrl);

        console.log(`  [${idx + 1}] OK: ${storagePath} (${(buffer.length / 1024).toFixed(0)} KB)`);
        return { status: 'migrated', id: img.id, size: buffer.length };
      } catch (err) {
        console.error(`  [${idx + 1}] FAIL (${img.id}): ${err.message}`);
        return { status: 'failed', id: img.id, error: err.message };
      }
    })
  );

  return results.map(r => r.status === 'fulfilled' ? r.value : { status: 'failed', error: r.reason?.message });
}

// Main migration function
async function migrate() {
  console.log('=== Car Image Migration: WordPress → Supabase Storage ===\n');

  // Sign in
  await signIn();

  // Fetch all images
  const images = await fetchAllImages();
  console.log(`Found ${images.length} images across ${new Set(images.map(i => i.car_id)).size} cars\n`);

  const stats = { migrated: 0, skipped: 0, failed: 0, totalBytes: 0 };

  // Process in batches
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(images.length / BATCH_SIZE)} (images ${i + 1}-${Math.min(i + BATCH_SIZE, images.length)}):`);

    const results = await processBatch(batch, i);

    for (const r of results) {
      if (r.status === 'migrated') { stats.migrated++; stats.totalBytes += r.size || 0; }
      else if (r.status === 'skipped') stats.skipped++;
      else stats.failed++;
    }

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < images.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Migrated: ${stats.migrated}`);
  console.log(`Skipped:  ${stats.skipped}`);
  console.log(`Failed:   ${stats.failed}`);
  console.log(`Total:    ${(stats.totalBytes / 1024 / 1024).toFixed(1)} MB transferred`);

  if (stats.failed > 0) {
    console.log('\nSome images failed. Run the script again to retry failed images.');
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
