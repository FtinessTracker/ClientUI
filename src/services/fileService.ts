import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/file`;

// Types for file operations
export interface FileMetadata {
  fileName: string;
  contentType: string;
  size: number;
  mediaType?: 'VIDEO' | 'AUDIO' | 'IMAGE';
  resolution?: string;
  durationInSeconds?: number;
  visibility?: 'PUBLIC' | 'PRIVATE';
  category?: string;
}

export interface UploadUrlResponse {
  mode: 'SINGLE_PUT' | 'MULTIPART';
  uploadUrl?: string;
  filePath: string;
  fileId: string;
  s3Url: string;
  uploadId?: string;
  partUrls?: string[];
  chunkSizeBytes?: number;
  totalParts?: number;
}

export interface CompleteUploadRequest {
  fileId: string;
  eTags?: string[];
  thumbnailUrl?: string;
  actualSizeInBytes?: number;
  durationInSeconds?: number;
  resolution?: string;
}

export interface VideoFile {
  id: string;
  name: string;
  path: string;
  s3Url: string;
  contentType: string;
  sizeInBytes: number;
  mediaType: 'VIDEO' | 'AUDIO' | 'IMAGE';
  resolution?: string;
  thumbnailUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  category?: string; // Video category (YOGA, HIIT, STRENGTH, CARDIO, STRETCHING, NUTRITION, MEDITATION, GENERAL, OTHER)
  uploadedBy: string;
  uploadId?: string;
  durationInSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoInfo {
  id: string;
  name: string;
  durationInSeconds?: number;
  url: string;
  thumbnailUrl?: string | null;
  category?: string;
  active: boolean;
  uploadedAt?: string;
}

export const fileService = {
  /**
   * Get upload URL for starting a new file upload
   * Backend auto-selects mode based on file size:
   * - < 100 MB → SINGLE_PUT
   * - ≥ 100 MB → MULTIPART
   */
  async getUploadUrl(userId: string, metadata: FileMetadata): Promise<UploadUrlResponse> {
    const response = await fetch(`${API_URL}/${userId}/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get upload URL' }));
      throw new Error(error.message || 'Failed to get upload URL');
    }

    return response.json();
  },

  /**
   * Upload single file to R2 (for files < 100 MB)
   * Direct upload to Cloudflare R2, not through backend
   * Note: Requires CORS to be configured on R2 bucket
   */
  async uploadFileSingle(
    uploadUrl: string,
    file: File,
    metadata?: {
      originalFilename?: string;
      mediaType?: string;
      uploadedBy?: string;
      visibility?: string;
      appName?: string;
    }
  ): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': file.type || 'application/octet-stream',
    };

    // Note: Only send headers that are in the SignedHeaders of the URL
    // The backend controls which headers are signed, so we only send Content-Type
    // Don't send x-amz-meta-* headers unless they're explicitly in the SignedHeaders

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      });

      if (!response.ok) {
        // If CORS error (403 or preflight failed), try proxy method
        if (response.status === 403 || response.type === 'opaque') {
          console.warn('Direct R2 upload failed with CORS, using backend proxy...');
          return await this.uploadFileSingleProxy(uploadUrl, file);
        }
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      return response.headers.get('ETag') || '';
    } catch (error) {
      // CORS errors don't get a proper response, so fallback to proxy
      if (error instanceof Error && error.message.includes('CORS')) {
        console.warn('CORS error on direct upload, using backend proxy...');
        return await this.uploadFileSingleProxy(uploadUrl, file);
      }
      throw error;
    }
  },

  /**
   * Proxy upload through backend (fallback for CORS issues)
   * Backend will handle the PUT to R2
   */
  async uploadFileSingleProxy(uploadUrl: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadUrl', uploadUrl);

    const response = await fetch(`${API_BASE_URL}/api/file/upload-proxy`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Proxy upload failed' }));
      throw new Error(error.message || 'Proxy upload failed');
    }

    const result = await response.json();
    return result.eTag || '';
  },

  /**
   * Upload file in chunks to R2 (for files ≥ 100 MB)
   * Direct upload to Cloudflare R2, not through backend
   * Returns array of ETags for complete-upload API
   */
  async uploadFileMultipart(
    partUrls: string[],
    file: File,
    chunkSizeBytes: number,
    onProgress?: (loaded: number, total: number) => void,
    metadata?: {
      originalFilename?: string;
      mediaType?: string;
      uploadedBy?: string;
      visibility?: string;
      appName?: string;
    }
  ): Promise<string[]> {
    const eTags: string[] = [];
    let uploadedBytes = 0;

    for (let i = 0; i < partUrls.length; i++) {
      const start = i * chunkSizeBytes;
      const end = Math.min(start + chunkSizeBytes, file.size);
      const chunk = file.slice(start, end);

      const headers: Record<string, string> = {
        'Content-Type': file.type || 'application/octet-stream',
      };

      // Note: Only send headers that are in the SignedHeaders of the URL
      // The backend controls which headers are signed, so we only send Content-Type

      const response = await fetch(partUrls[i], {
        method: 'PUT',
        headers,
        body: chunk,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload chunk ${i + 1}: ${response.statusText}`);
      }

      const eTag = response.headers.get('ETag');
      if (!eTag) {
        throw new Error(`No ETag returned for chunk ${i + 1}`);
      }

      eTags.push(eTag);
      uploadedBytes += end - start;

      if (onProgress) {
        onProgress(uploadedBytes, file.size);
      }
    }

    return eTags;
  },

  /**
   * Complete the file upload after all chunks are uploaded
   * Marks file as COMPLETED in backend
   */
  async completeUpload(
    userId: string,
    request: CompleteUploadRequest
  ): Promise<VideoFile> {
    const response = await fetch(`${API_URL}/${userId}/complete-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to complete upload' }));
      throw new Error(error.message || 'Failed to complete upload');
    }

    return response.json();
  },

  /**
   * Abort an ongoing upload
   * Cleans up partial chunks on R2 for multipart uploads
   */
  async abortUpload(userId: string, fileId: string): Promise<void> {
    const response = await fetch(`${API_URL}/${userId}/abort-upload?fileId=${fileId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to abort upload' }));
      throw new Error(error.message || 'Failed to abort upload');
    }
  },

  /**
   * Get list of all uploads for a user
   * Can filter by status: COMPLETED, PENDING, FAILED
   */
  async getUserUploads(userId: string, status?: 'COMPLETED' | 'PENDING' | 'FAILED'): Promise<VideoFile[]> {
    let url = `${API_URL}/${userId}/uploads`;

    if (status) {
      url += `?status=${status}`;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch uploads: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Ensure we always return an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array response:', data);
        throw new Error('Invalid response format from server');
      }

      return data as VideoFile[];
    } catch (error) {
      console.error('Error in getUserUploads:', error);
      throw error;
    }
  },

  /**
   * Get a single video by ID
   * Endpoint: /api/file/video/{videoId}
   * Returns: { id, name, durationInSeconds, url, thumbnailUrl, category, uploadedAt }
   */
  async getVideoById(videoId: string): Promise<VideoInfo> {
    const response = await fetch(`${API_URL}/video/${videoId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch video' }));
      throw new Error(error.message || 'Failed to fetch video');
    }

    return response.json();
  },

  /**
   * Update video metadata (name, visibility, category)
   * Endpoint: PATCH /api/file/{userId}/video/{videoId}
   * Only send fields you want to update (all fields are optional)
   */
  async updateVideoMetadata(
    userId: string,
    videoId: string,
    updates: {
      name?: string;
      visibility?: 'PUBLIC' | 'PRIVATE';
      category?: 'YOGA' | 'HIIT' | 'STRENGTH' | 'CARDIO' | 'STRETCHING' | 'NUTRITION' | 'MEDITATION' | 'GENERAL' | 'OTHER';
    }
  ): Promise<VideoFile> {
    const response = await fetch(`${API_URL}/${userId}/video/${videoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update video' }));
      throw new Error(error.message || 'Failed to update video');
    }

    return response.json();
  },

  /**
   * Delete a video file (soft delete - marks as inactive, removes from R2 storage)
   * Endpoint: DELETE /api/file/{userId}/uploads/{fileId}
   */
  async deleteVideo(userId: string, fileId: string): Promise<void> {
    const response = await fetch(`${API_URL}/${userId}/uploads/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete video' }));
      throw new Error(error.message || 'Failed to delete video');
    }
  },

  /**
   * Get MIME type from file extension
   * Returns 'application/octet-stream' if unknown
   */
  getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();

    const mimeMap: Record<string, string> = {
      // Video
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      webm: 'video/webm',
      'm4v': 'video/x-m4v',
      flv: 'video/x-flv',
      wmv: 'video/x-ms-wmv',
      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      flac: 'audio/flac',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      // Image
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      heic: 'image/heic',
      svg: 'image/svg+xml',
    };

    return mimeMap[ext || ''] || 'application/octet-stream';
  },

  /**
   * Detect media type from file MIME type
   */
  getMediaType(mimeType: string): 'VIDEO' | 'AUDIO' | 'IMAGE' | undefined {
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.startsWith('image/')) return 'IMAGE';
    return undefined;
  },

  /**
   * Format file size to human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Format duration in seconds to readable format (mm:ss or hh:mm:ss)
   */
  formatDuration(seconds?: number): string {
    if (!seconds) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
};
