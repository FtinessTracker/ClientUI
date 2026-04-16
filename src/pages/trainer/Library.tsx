import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, CheckCircle, Play } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAppUser } from '../../hooks/useAppUser';
import { fileService, FileMetadata, UploadUrlResponse, VideoFile } from '../../services/fileService';
import { cn } from '../../lib/utils';
import VideoUploadModal from './components/VideoUploadModal';
import VideoLibrary from './components/VideoLibrary';
import { LibraryManagement } from '../../components/workout/LibraryManagement';

export default function LibraryPage() {
  const { appUser: user } = useAppUser();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'libraries' | 'videos'>('libraries');

  // Fetch user's videos
  const { data: videos = [], isLoading, refetch } = useQuery({
    queryKey: ['userVideos', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return fileService.getUserUploads(user.id, 'COMPLETED');
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for pending uploads
  });

  /**
   * Handle video upload with multipart support
   * Follows the upload flow: getUploadUrl -> uploadFile -> completeUpload
   */
  const handleVideoUpload = useCallback(
    async (metadata: FileMetadata & { file: File }) => {
      if (!user?.id) {
        setUploadError('User not found');
        return;
      }

      setIsUploading(true);
      setUploadError('');
      setUploadSuccess(false);

      try {
        // Step 1: Get upload URL from backend
        const uploadResponse: UploadUrlResponse = await fileService.getUploadUrl(user.id, {
          fileName: metadata.fileName,
          contentType: metadata.contentType,
          size: metadata.size,
          mediaType: metadata.mediaType,
          resolution: metadata.resolution,
          durationInSeconds: metadata.durationInSeconds,
          visibility: metadata.visibility,
        });

        const fileId = uploadResponse.fileId;

        // Step 2: Upload file to R2 (either single PUT or multipart)
        let eTags: string[] | null = null;

        if (uploadResponse.mode === 'SINGLE_PUT') {
          // Small file: single PUT
          if (!uploadResponse.uploadUrl) {
            throw new Error('No upload URL received');
          }

          console.log('Starting single PUT upload...');
          await fileService.uploadFileSingle(uploadResponse.uploadUrl, metadata.file);
        } else if (uploadResponse.mode === 'MULTIPART') {
          // Large file: multipart upload with chunks
          if (!uploadResponse.partUrls || !uploadResponse.chunkSizeBytes) {
            throw new Error('No part URLs received for multipart upload');
          }

          console.log(
            `Starting multipart upload: ${uploadResponse.totalParts} parts of ${uploadResponse.chunkSizeBytes} bytes each`
          );

          eTags = await fileService.uploadFileMultipart(
            uploadResponse.partUrls,
            metadata.file,
            uploadResponse.chunkSizeBytes,
            (loaded, total) => {
              const percent = Math.round((loaded / total) * 100);
              console.log(`Upload progress: ${percent}%`);
            }
          );
        }

        // Step 3: Complete upload
        console.log('Completing upload...');
        await fileService.completeUpload(user.id, {
          fileId,
          eTags: eTags || undefined,
          durationInSeconds: metadata.durationInSeconds,
          resolution: metadata.resolution,
        });

        setUploadSuccess(true);
        setIsUploadModalOpen(false);

        // Refetch videos to show the newly uploaded one
        setTimeout(() => {
          refetch();
          setUploadSuccess(false);
        }, 1500);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        console.error('Upload error:', err);
        setUploadError(errorMsg);
      } finally {
        setIsUploading(false);
      }
    },
    [user?.id, refetch]
  );

  /**
   * Handle video deletion
   */
  const handleDeleteVideo = useCallback(
    async (videoId: string) => {
      if (!user?.id) return;

      setIsDeletingId(videoId);
      try {
        await fileService.deleteVideo(user.id, videoId);
        refetch();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete video';
        setUploadError(errorMsg);
      } finally {
        setIsDeletingId(null);
      }
    },
    [user?.id, refetch]
  );

  if (!user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-96 rounded-full" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-video rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-end gap-4"
      >
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="rounded-2xl h-11 px-5 font-bold shadow-lg shadow-slate-900/10 text-sm shrink-0"
        >
          <Upload className="mr-2 w-4 h-4" />
          Upload Video
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 border-b border-slate-200"
      >
        <button
          onClick={() => setActiveTab('libraries')}
          className={cn(
            'px-6 py-3 font-bold text-sm transition-all duration-200 border-b-2 -mb-px',
            activeTab === 'libraries'
              ? 'text-accent border-accent'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          )}
        >
          Workout Libraries & Plans
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={cn(
            'px-6 py-3 font-bold text-sm transition-all duration-200 border-b-2 -mb-px',
            activeTab === 'videos'
              ? 'text-accent border-accent'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          )}
        >
          All Videos
        </button>
      </motion.div>

      {/* Success Message */}
      {uploadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-bold text-emerald-700">
            Video uploaded successfully! It will appear in your library shortly.
          </p>
        </motion.div>
      )}

      {/* Error Message */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-bold text-red-700">{uploadError}</p>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'libraries' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {user && (
            <LibraryManagement
              trainerId={user.id}
              trainerName={user.name || 'Trainer'}
            />
          )}
        </motion.div>
      )}

      {activeTab === 'videos' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <VideoLibrary
            videos={videos}
            onDelete={handleDeleteVideo}
            onUpdate={(videoId, updates) => {
              refetch();
              return Promise.resolve();
            }}
            isLoading={isLoading}
            isDeleting={isDeletingId}
            userId={user?.id}
          />
        </motion.div>
      )}

      {/* Upload Modal */}
      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadError('');
        }}
        onSubmit={handleVideoUpload}
        isLoading={isUploading}
      />
    </div>
  );
}
