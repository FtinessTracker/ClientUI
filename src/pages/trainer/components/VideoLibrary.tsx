import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Trash2, Lock, Eye, X, AlertCircle, CheckCircle, Edit2, Grid3x3, List, Clock, Maximize2, Database, Info, Plus
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';
import { cn, formatDate } from '../../../lib/utils';
import { useSnackbar } from '../../../components/ui/Snackbar';
import { useConfirmDialog } from '../../../components/ui/ConfirmDialog';
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
  const { error: showError, success: showSuccess } = useSnackbar();
  const { confirm: showConfirm } = useConfirmDialog();
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoFile | null>(null);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    visibility: 'PRIVATE' as const, 
    category: 'GENERAL',
    exerciseName: '',
    muscleGroups: [] as string[],
    movementPattern: '',
    modality: '',
    exerciseType: '',
    instructions: [] as string[],
    equipment: [] as string[],
    difficulty: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [infoPopupVideoId, setInfoPopupVideoId] = useState<string | null>(null);
  const [newInstruction, setNewInstruction] = useState('');

  const handleDelete = async (videoId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Video',
      message: 'Are you sure you want to delete this video? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
    });

    if (!confirmed) return;

    try {
      await onDelete?.(videoId);
      showSuccess('Video deleted successfully');
    } catch (err) {
      console.error('Failed to delete video:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete video';
      showError(errorMsg);
    }
  };

  const handleEditClick = (video: VideoFile) => {
    setEditingVideo(video);
    setEditForm({
      name: video.name,
      visibility: video.visibility as 'PUBLIC' | 'PRIVATE',
      category: video.category || 'GENERAL',
      exerciseName: video.exerciseName || '',
      muscleGroups: video.muscleGroups || [],
      movementPattern: video.movementPattern || '',
      modality: video.modality || '',
      exerciseType: video.exerciseType || '',
      instructions: video.instructions || [],
      equipment: video.equipment || [],
      difficulty: video.difficulty || '',
    });
    setNewInstruction('');
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo || !userId) return;

    setIsUpdating(true);
    try {
      await fileService.updateVideoMetadata(userId, editingVideo.id, {
        name: editForm.name,
        visibility: editForm.visibility,
        category: editForm.category as any,
        exerciseName: editForm.exerciseName || undefined,
        muscleGroups: editForm.muscleGroups.length > 0 ? editForm.muscleGroups : undefined,
        movementPattern: editForm.movementPattern || undefined,
        modality: editForm.modality || undefined,
        exerciseType: editForm.exerciseType || undefined,
        instructions: editForm.instructions.length > 0 ? editForm.instructions : undefined,
        equipment: editForm.equipment.length > 0 ? editForm.equipment : undefined,
        difficulty: editForm.difficulty || undefined,
      });

      showSuccess('Video updated successfully');
      setTimeout(() => {
        setEditingVideo(null);
        onUpdate?.(editingVideo.id, editForm);
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update video';
      showError(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Sort and group videos
  const processedVideos = useMemo(() => {
    let filtered = [...videos];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((video) => video.name.toLowerCase().includes(query));
    }

    let sorted = filtered;

    // Sort
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Group by category if enabled
    if (groupByCategory) {
      const grouped: { [key: string]: VideoFile[] } = {};
      sorted.forEach((video) => {
        const cat = video.category || 'GENERAL';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(video);
      });
      return grouped;
    }

    return { all: sorted };
  }, [videos, sortBy, groupByCategory, searchQuery]);

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
      {/* Search and Filters */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-3"
        >
          {/* Search Input */}
          <Input
            placeholder="Search videos by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border-gray-300 px-4 py-2.5 text-sm"
          />

          {/* Filters and View Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="date">Sort by Date (Newest)</option>
                <option value="name">Sort by Name</option>
              </select>

              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={groupByCategory}
                  onChange={(e) => setGroupByCategory(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Group by Category</span>
              </label>
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-600 hover:bg-gray-50"
            >
              {viewMode === 'grid' ? (
                <List className="h-5 w-5" />
              ) : (
                <Grid3x3 className="h-5 w-5" />
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Videos Grid View */}
      {viewMode === 'grid' && videos.length > 0 && (
        <div className={groupByCategory ? 'space-y-6' : 'space-y-8'}>
          {Object.entries(groupByCategory ? processedVideos : { 'All Videos': processedVideos['all'] || [] }).map(([category, categoryVideos]) => (
            <div key={category}>
              {groupByCategory && <h3 className="text-base font-bold text-gray-900 mb-3">{category}</h3>}
              <div className={groupByCategory ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}>
                {(categoryVideos as VideoFile[]).map((video) => (
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
                  {video.s3Url ? (
                    <video
                      poster={video.thumbnailUrl || undefined}
                      preload="metadata"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 bg-slate-900"
                    >
                      <source src={video.s3Url} type="video/mp4" />
                    </video>
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
                <div className={groupByCategory ? 'p-2 bg-white space-y-2 text-center' : 'p-3 bg-white space-y-3 text-center'}>
                  <div className="relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 text-left">
                        <h3 className={groupByCategory ? 'font-bold text-slate-900 line-clamp-2 text-xs' : 'font-black text-slate-900 line-clamp-2 text-sm'}>
                          {video.exerciseName || video.name}
                        </h3>
                        {!groupByCategory && (
                          <p className="text-xs text-gray-600 mt-1">
                            {video.category || 'GENERAL'} • {formatDate(video.createdAt)}
                          </p>
                        )}
                      </div>
                      <button
                        onMouseEnter={() => setHoveredVideoId(video.id)}
                        onClick={() => setInfoPopupVideoId(infoPopupVideoId === video.id ? null : video.id)}
                        className="flex-shrink-0 p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-600"
                        title="View details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info Popup */}
                    {infoPopupVideoId === video.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        onMouseLeave={() => setInfoPopupVideoId(null)}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3 text-left text-xs max-w-xs"
                      >
                        {video.exerciseName && (
                          <div className="mb-2 pb-2 border-b border-slate-100">
                            <p className="text-slate-500 font-semibold">Exercise</p>
                            <p className="text-slate-900 font-bold">{video.exerciseName}</p>
                          </div>
                        )}
                        {video.durationInSeconds && (
                          <div className="mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-700">{Math.round(video.durationInSeconds / 60)} min</span>
                          </div>
                        )}
                        {video.difficulty && (
                          <div className="mb-2 pb-2 border-b border-slate-100">
                            <p className="text-slate-500 font-semibold">Difficulty</p>
                            <p className="text-slate-900 font-bold">{video.difficulty}</p>
                          </div>
                        )}
                        {video.modality && (
                          <div className="mb-2 pb-2 border-b border-slate-100">
                            <p className="text-slate-500 font-semibold">Modality</p>
                            <p className="text-slate-900 font-bold">{video.modality}</p>
                          </div>
                        )}
                        {video.muscleGroups && video.muscleGroups.length > 0 && (
                          <div className="mb-2 pb-2 border-b border-slate-100">
                            <p className="text-slate-500 font-semibold">Muscle Groups</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {video.muscleGroups.map((muscle) => (
                                <span key={muscle} className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                  {muscle}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {video.equipment && video.equipment.length > 0 && (
                          <div>
                            <p className="text-slate-500 font-semibold">Equipment</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {video.equipment.map((equip) => (
                                <span key={equip} className="inline-block px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs font-semibold">
                                  {equip}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!groupByCategory && (
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
                  )}
                  
                  {groupByCategory && (
                    <div className="flex gap-1 justify-center pt-1">
                      <button
                        onClick={() => handleEditClick(video)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {onDelete && (
                        <button
                          onClick={() => handleDelete(video.id)}
                          disabled={isDeleting === video.id}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          {isDeleting === video.id ? (
                            <span className="inline-block w-3 h-3 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Videos List View */}
      {viewMode === 'list' && videos.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className={groupByCategory ? 'space-y-6' : 'space-y-3'}>
            {Object.entries(groupByCategory ? processedVideos : { 'All Videos': processedVideos['all'] || [] }).map(([category, categoryVideos]) => (
              <div key={category}>
                {groupByCategory && <h3 className="text-lg font-bold text-gray-900 mb-4">{category}</h3>}
                <div className="space-y-3">
                  {(categoryVideos as VideoFile[]).map((video) => (
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
                  {video.s3Url ? (
                    <video
                      poster={video.thumbnailUrl || undefined}
                      preload="metadata"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform bg-slate-900"
                    >
                      <source src={video.s3Url} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
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
                    <div>
                      <h3 className="font-black text-slate-900 line-clamp-1">{video.name}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {video.category || 'GENERAL'} • {formatDate(video.createdAt)}
                      </p>
                    </div>
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
              </div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* No Search Results */}
      {videos.length > 0 && searchQuery && Object.values(processedVideos).every((v: any) => !Array.isArray(v) || v.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200">
            <CardContent className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No videos found</h3>
              <p className="text-sm text-slate-400 font-medium">
                No videos match "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        </motion.div>
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
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-7 border-b border-slate-200 flex-shrink-0">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Video</h2>
                  <button
                    onClick={() => setEditingVideo(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-7 space-y-5 overflow-y-auto flex-1">

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

                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Category
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {['YOGA', 'HIIT', 'STRENGTH', 'CARDIO', 'STRETCHING', 'NUTRITION', 'MEDITATION', 'GENERAL', 'OTHER'].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
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

                  {/* Exercise Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Exercise Name
                    </label>
                    <Input
                      type="text"
                      value={editForm.exerciseName}
                      onChange={(e) => setEditForm({ ...editForm, exerciseName: e.target.value })}
                      placeholder="e.g., Barbell Bench Press"
                      className="h-10 rounded-xl border-slate-200"
                      disabled={isUpdating}
                    />
                  </div>

                  {/* Modality */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Modality</label>
                    <select
                      value={editForm.modality}
                      onChange={(e) => setEditForm({ ...editForm, modality: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isUpdating}
                    >
                      <option value="">Select Modality</option>
                      <option value="STRENGTH">Strength</option>
                      <option value="MOBILITY">Mobility</option>
                      <option value="FLEXIBILITY">Flexibility</option>
                      <option value="CARDIO">Cardio</option>
                      <option value="PLYOMETRIC">Plyometric</option>
                      <option value="BALANCE">Balance</option>
                      <option value="ENDURANCE">Endurance</option>
                      <option value="REHAB">Rehab</option>
                    </select>
                  </div>

                  {/* Movement Pattern */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Movement Pattern</label>
                    <select
                      value={editForm.movementPattern}
                      onChange={(e) => setEditForm({ ...editForm, movementPattern: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isUpdating}
                    >
                      <option value="">Select Movement Pattern</option>
                      <option value="PUSH">Push</option>
                      <option value="PULL">Pull</option>
                      <option value="SQUAT">Squat</option>
                      <option value="HINGE">Hinge</option>
                      <option value="LUNGE">Lunge</option>
                      <option value="CARRY">Carry</option>
                      <option value="ROTATION">Rotation</option>
                      <option value="FULL_BODY">Full Body</option>
                      <option value="CARDIO">Cardio</option>
                      <option value="ISOMETRIC">Isometric</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Difficulty</label>
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isUpdating}
                    >
                      <option value="">Select Difficulty</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  {/* Exercise Type */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Exercise Type</label>
                    <div className="flex gap-3">
                      {['REPS', 'TIMED'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setEditForm({ ...editForm, exerciseType: type })}
                          disabled={isUpdating}
                          className={cn(
                            'flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200',
                            editForm.exerciseType === type
                              ? 'bg-accent text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Muscle Groups */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Muscle Groups</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['CHEST', 'TRICEPS', 'QUADS', 'GLUTES', 'HAMSTRINGS', 'BACK', 'BICEPS', 'SHOULDERS', 'CORE', 'CALVES', 'HIP_GROIN', 'FOREARMS', 'FULL_BODY'].map((muscle) => (
                        <button
                          key={muscle}
                          onClick={() => {
                            const updated = editForm.muscleGroups.includes(muscle)
                              ? editForm.muscleGroups.filter((m) => m !== muscle)
                              : [...editForm.muscleGroups, muscle];
                            setEditForm({ ...editForm, muscleGroups: updated });
                          }}
                          disabled={isUpdating}
                          className={cn(
                            'px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 text-center',
                            editForm.muscleGroups.includes(muscle)
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          )}
                        >
                          {muscle.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Equipment</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['DUMBBELL', 'BARBELL', 'KETTLEBELL', 'RESISTANCE_BAND', 'CABLE', 'MACHINE', 'BODYWEIGHT', 'FOAM_ROLLER', 'MEDICINE_BALL'].map((equip) => (
                        <button
                          key={equip}
                          onClick={() => {
                            const updated = editForm.equipment.includes(equip)
                              ? editForm.equipment.filter((e) => e !== equip)
                              : [...editForm.equipment, equip];
                            setEditForm({ ...editForm, equipment: updated });
                          }}
                          disabled={isUpdating}
                          className={cn(
                            'px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 text-center',
                            editForm.equipment.includes(equip)
                              ? 'bg-cyan-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          )}
                        >
                          {equip.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Instructions</label>
                    <div className="space-y-2">
                      {editForm.instructions.length > 0 && (
                        <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          {editForm.instructions.map((instruction, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2">
                              <span className="text-sm text-slate-700">{idx + 1}. {instruction}</span>
                              <button
                                onClick={() => {
                                  const updated = editForm.instructions.filter((_, i) => i !== idx);
                                  setEditForm({ ...editForm, instructions: updated });
                                }}
                                disabled={isUpdating}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={newInstruction}
                          onChange={(e) => setNewInstruction(e.target.value)}
                          placeholder="Add instruction step..."
                          className="h-10 rounded-xl border-slate-200"
                          disabled={isUpdating}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newInstruction.trim()) {
                              setEditForm({
                                ...editForm,
                                instructions: [...editForm.instructions, newInstruction],
                              });
                              setNewInstruction('');
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (newInstruction.trim()) {
                              setEditForm({
                                ...editForm,
                                instructions: [...editForm.instructions, newInstruction],
                              });
                              setNewInstruction('');
                            }
                          }}
                          disabled={isUpdating || !newInstruction.trim()}
                          className="px-4 py-2 bg-accent text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-7 border-t border-slate-200 bg-slate-50 flex-shrink-0">
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
