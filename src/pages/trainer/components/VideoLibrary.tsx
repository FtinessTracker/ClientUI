import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Trash2, Lock, Eye, X, AlertCircle, CheckCircle, Edit2, Grid3x3, List, Clock, Maximize2, Database
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import { fileService, VideoFile } from '../../../services/fileService';

interface VideoLibraryProps {
  videos: VideoFile[];
  onDelete?: (videoId: string) => Promise<void>;
  onUpdate?: (videoId: string, updates: any) => Promise<void>;
  isLoading?: boolean;
  isDeleting?: string | null;
  userId?: string;
}

export default function VideoLibrary({
  videos,
  onDelete,
  onUpdate,
  isLoading = false,
  isDeleting = null,
  userId,
}: VideoLibraryProps) {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoFile | null>(null);
  const [editForm, setEditForm] = useState({ name: '', visibility: 'PRIVATE' as const });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDelete = async (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await onDelete?.(videoId);
      } catch (err) {
        console.error('Failed to delete video:', err);
      }
    }
  };

  const handleEditClick = (video: VideoFile) => {
    setEditingVideo(video);
    setEditForm({
      name: video.name,
      visibility: video.visibility as 'PUBLIC' | 'PRIVATE',
    });
    setUpdateMessage(null);
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo || !userId) return;

    setIsUpdating(true);
    try {
      await fileService.updateVideoMetadata(userId, editingVideo.id, {
        name: editForm.name,
        visibility: editForm.visibility,
      });

      setUpdateMessage({ type: 'success', text: 'Video updated successfully!' });
      setTimeout(() => {
        setEditingVideo(null);
        setUpdateMessage(null);
        onUpdate?.(editingVideo.id, editForm);
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update video';
      setUpdateMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl aspect-[9/16] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-end gap-2 border-l border-slate-200 pl-2"
        >
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-all',
              viewMode === 'grid'
                ? 'bg-accent/10 text-accent'
                : 'text-slate-400 hover:text-slate-600'
            )}
            title="Grid view"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-all',
              viewMode === 'list'
                ? 'bg-accent/10 text-accent'
                : 'text-slate-400 hover:text-slate-600'
            )}
            title="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Videos Grid View */}
      {viewMode === 'grid' && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col aspect-[9/16]">
                {/* Thumbnail Container */}
                <div 
                  className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden flex-1 cursor-pointer"
                  onClick={() => setPlayingVideoId(video.id)}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                      <Play className="w-12 h-12 text-white/30" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-slate-900 ml-0.5" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    {video.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                        Ready
                      </span>
                    ) : video.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
                        Uploading
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Visibility Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold',
                        video.visibility === 'PRIVATE'
                          ? 'bg-slate-900/90 text-white'
                          : 'bg-white/90 text-slate-900'
                      )}
                    >
                      {video.visibility === 'PRIVATE' ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-3 bg-white space-y-3 text-center">
                  <h3 className="font-black text-slate-900 line-clamp-2 text-sm">
                    {video.name}
                  </h3>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditClick(video)}
                      className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    {onDelete && (
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={isDeleting === video.id}
                        className="flex-1 px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"
                        title="Delete"
                      >
                        {isDeleting === video.id ? (
                          <span className="inline-block w-3 h-3 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Videos List View */}
      {viewMode === 'list' && videos.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-accent/50 hover:shadow-lg transition-all duration-300 flex items-center gap-4"
              >
                {/* Thumbnail */}
                <div 
                  className="w-32 h-24 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex-shrink-0 overflow-hidden relative group cursor-pointer"
                  onClick={() => setPlayingVideoId(video.id)}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="font-black text-slate-900 line-clamp-1">{video.name}</h3>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap',
                        video.visibility === 'PRIVATE'
                          ? 'bg-slate-900/10 text-slate-900'
                          : 'bg-emerald-100 text-emerald-700'
                      )}
                    >
                      {video.visibility === 'PRIVATE' ? (
                        <>
                          <Lock className="w-3 h-3" />
                          Private
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          Public
                        </>
                      )}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                    {video.durationInSeconds && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {fileService.formatDuration(video.durationInSeconds)}
                      </div>
                    )}
                    {video.resolution && (
                      <div className="flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                        {video.resolution}
                      </div>
                    )}
                    {video.sizeInBytes && (
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        {fileService.formatFileSize(video.sizeInBytes)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEditClick(video)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(video.id)}
                      disabled={isDeleting === video.id}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      {isDeleting === video.id ? (
                        <span className="inline-block w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Empty State */}
      {videos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200">
            <CardContent className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No videos yet</h3>
              <p className="text-sm text-slate-400 font-medium">
                Upload your first video to get started
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <AnimatePresence>
        {playingVideoId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-40"
              onClick={() => setPlayingVideoId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setPlayingVideoId(null);
                }
              }}
            >
              <div className="relative w-full max-w-2xl">
                {/* Close Button */}
                <button
                  onClick={() => setPlayingVideoId(null)}
                  className="absolute -top-10 right-0 p-2 hover:bg-white/10 rounded-lg transition-colors text-white z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Video Player */}
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                  {(() => {
                    const video = videos.find(v => v.id === playingVideoId);
                    const videoUrl = video?.s3Url;
                    
                    return (
                      <video
                        key={playingVideoId}
                        controls
                        autoPlay
                        className="w-full h-auto max-h-[80vh] object-contain"
                        onError={(e) => console.error('Video playback error:', e)}
                      >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    );
                  })()}
                </div>

                {/* Video Info */}
                {(() => {
                  const video = videos.find(v => v.id === playingVideoId);
                  return video ? (
                    <div className="mt-4 text-white">
                      <h2 className="text-xl font-black mb-1">{video.name}</h2>
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          {video.visibility === 'PRIVATE' ? (
                            <>
                              <Lock className="w-4 h-4" />
                              Private
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Public
                            </>
                          )}
                        </span>
                        {video.durationInSeconds && (
                          <span>{fileService.formatDuration(video.durationInSeconds)}</span>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Video Modal */}
      <AnimatePresence>
        {editingVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
              onClick={() => setEditingVideo(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setEditingVideo(null);
                }
              }}
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-7 border-b border-slate-200">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Video</h2>
                  <button
                    onClick={() => setEditingVideo(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-7 space-y-5">
                  {/* Message */}
                  {updateMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl',
                        updateMessage.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'bg-red-50 border border-red-200'
                      )}
                    >
                      {updateMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <p
                        className={cn(
                          'text-sm font-bold',
                          updateMessage.type === 'success'
                            ? 'text-emerald-700'
                            : 'text-red-700'
                        )}
                      >
                        {updateMessage.text}
                      </p>
                    </motion.div>
                  )}

                  {/* Video Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Video Name
                    </label>
                    <Input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="h-10 rounded-xl border-slate-200"
                      placeholder="Enter video name"
                    />
                  </div>

                  {/* Privacy Toggle */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Privacy
                    </label>
                    <div className="flex gap-3">
                      {['PRIVATE', 'PUBLIC'].map((visibility) => (
                        <button
                          key={visibility}
                          onClick={() => setEditForm({ ...editForm, visibility: visibility as 'PRIVATE' | 'PUBLIC' })}
                          className={cn(
                            'flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200',
                            editForm.visibility === visibility
                              ? 'bg-accent text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          )}
                        >
                          {visibility === 'PRIVATE' ? (
                            <>
                              <Lock className="w-4 h-4 inline mr-1.5" />
                              Private
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 inline mr-1.5" />
                              Public
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-7 border-t border-slate-200 bg-slate-50">
                  <Button
                    variant="outline"
                    onClick={() => setEditingVideo(null)}
                    className="rounded-xl font-bold h-11 border-slate-200"
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateVideo}
                    disabled={isUpdating || !editForm.name.trim()}
                    isLoading={isUpdating}
                    className="flex-1 rounded-xl font-bold h-11"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
