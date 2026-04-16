import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Edit,
  MoreVertical,
  Archive,
  Trash2,
  Unlock,
  Play,
  Clock,
  BookOpen,
  AlertCircle,
  Star,
  TrendingUp,
  Loader,
  Calendar,
} from 'lucide-react';
import { WorkoutLibrary, libraryService } from '../../services/libraryService';
import { fileService, VideoInfo, VideoFile } from '../../services/fileService';
import { formatDate, formatPrice } from '../../lib/utils';
import { VideoSelector } from './VideoSelector';

interface WorkoutPlanDetailProps {
  library: WorkoutLibrary;
  trainerId: string;
  onEdit: (library: WorkoutLibrary) => void;
  onArchive: (library: WorkoutLibrary) => void;
  onDelete: (library: WorkoutLibrary) => void;
  onPublish: (library: WorkoutLibrary) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function WorkoutPlanDetail({
  library,
  trainerId,
  onEdit,
  onArchive,
  onDelete,
  onPublish,
  onClose,
  isLoading = false,
}: WorkoutPlanDetailProps) {
  const [videoDetails, setVideoDetails] = useState<Map<string, VideoInfo>>(new Map());
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [currentLibrary, setCurrentLibrary] = useState<WorkoutLibrary>(library);
  const [showAddVideos, setShowAddVideos] = useState(false);
  const [availableVideos, setAvailableVideos] = useState<VideoInfo[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [addingVideos, setAddingVideos] = useState(false);

  // Sync currentLibrary when prop changes
  useEffect(() => {
    setCurrentLibrary(library);
  }, [library]);

  // Fetch video details for all videoIds
  useEffect(() => {
    const fetchVideos = async () => {
      if (!currentLibrary.videoIds || currentLibrary.videoIds.length === 0) return;

      setLoadingVideos(true);
      const videoMap = new Map<string, VideoInfo>();

      try {
        const videoPromises = currentLibrary.videoIds.map(videoId =>
          fileService.getVideoById(videoId)
            .then(video => {
              videoMap.set(videoId, video);
            })
            .catch(err => {
              console.error(`Failed to fetch video ${videoId}:`, err);
            })
        );

        await Promise.all(videoPromises);
        setVideoDetails(videoMap);
      } catch (err) {
        console.error('Error fetching video details:', err);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [currentLibrary.videoIds]);

  // Handle delete video from this specific plan
  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to remove this video from the plan? The video will remain in your library.')) {
      return;
    }

    setDeletingVideoId(videoId);
    try {
      // Call the endpoint to remove video from this specific library
      const updatedLibrary = await libraryService.removeVideos(trainerId, currentLibrary.id, [videoId]);
      // Update local state only, don't trigger onArchive
      setCurrentLibrary(updatedLibrary);
      alert('Video removed from plan successfully');
    } catch (err) {
      console.error('Failed to remove video from plan:', err);
      alert('Failed to remove video. Please try again.');
    } finally {
      setDeletingVideoId(null);
    }
  };

  // Handle update video metadata
  const handleUpdateVideoMetadata = (updatedVideo: VideoInfo) => {
    // Update local state with new video metadata
    const newMap = new Map(videoDetails);
    newMap.set(updatedVideo.id, updatedVideo);
    setVideoDetails(newMap);
    alert('Video metadata updated successfully');
  };

  // Fetch available videos for adding to library
  const handleShowAddVideos = async () => {
    try {
      const allVideos = await fileService.getUserUploads(trainerId);
      // Filter out videos already in the library
      const available = allVideos.filter(v => !currentLibrary.videoIds.includes(v.id));
      setAvailableVideos(available);
      setShowAddVideos(true);
      setSelectedVideoIds([]);
    } catch (err) {
      console.error('Failed to fetch available videos:', err);
      alert('Failed to load available videos. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full space-y-8"
    >
      {/* Header with Back Button */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <X className="h-5 w-5" />
            Back to Libraries
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{currentLibrary.name}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {currentLibrary.category} • {currentLibrary.difficulty}
          </p>
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Created {formatDate(currentLibrary.createdAt)}
          </p>
        </div>

        {/* Status & Menu */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentLibrary.status === 'PUBLISHED'
                ? 'bg-green-100 text-green-800'
                : currentLibrary.status === 'DRAFT'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {currentLibrary.status}
          </span>

          {/* Three Dot Menu */}
          <div className="relative group">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50">
              <button
                onClick={() => {
                  onEdit(currentLibrary);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
              >
                <Edit className="h-4 w-4" />
                Edit Plan
              </button>

              {currentLibrary.status === 'DRAFT' && currentLibrary.totalVideos > 0 && (
                <button
                  onClick={() => {
                    onPublish(currentLibrary);
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-green-700 hover:bg-green-50 border-b border-gray-100 disabled:opacity-50"
                >
                  <Unlock className="h-4 w-4" />
                  Publish
                </button>
              )}

              {currentLibrary.status === 'PUBLISHED' && (
                <button
                  onClick={() => {
                    onArchive(currentLibrary);
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 disabled:opacity-50"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>
              )}

              <button
                onClick={() => {
                  onDelete(currentLibrary);
                }}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="relative h-80 w-full bg-gray-200 rounded-2xl overflow-hidden">
        {currentLibrary.thumbnailUrl ? (
          <img
            src={currentLibrary.thumbnailUrl}
            alt={currentLibrary.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Play className="h-24 w-24 text-gray-400" />
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-8">
        {/* Main Content - Left 2 cols */}
        <div className="col-span-2 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {currentLibrary.description || 'No description provided'}
            </p>
          </div>

          {/* Videos List */}
          {currentLibrary.videoIds && currentLibrary.videoIds.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Workout Videos ({currentLibrary.totalVideos})
                </h2>
                <button
                  onClick={handleShowAddVideos}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  + Add Videos
                </button>
              </div>
              
              {loadingVideos && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 text-blue-600 animate-spin" />
                  <p className="ml-3 text-gray-600">Loading video details...</p>
                </div>
              )}

              <div className="space-y-4">
                {currentLibrary.videoIds.map((videoId, idx) => {
                  const videoInfo = videoDetails.get(videoId);
                  const duration = videoInfo?.durationInSeconds
                    ? fileService.formatDuration(videoInfo.durationInSeconds)
                    : 'N/A';

                  return (
                    <div
                      key={videoId}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition flex gap-4 bg-white"
                    >
                      {/* Video Screen with Play Button */}
                      <div className="relative w-28 h-28 rounded-lg bg-black flex-shrink-0 overflow-hidden group cursor-pointer">
                        {videoInfo?.url ? (
                          <>
                            <video
                              poster={videoInfo?.thumbnailUrl}
                              className="w-full h-full object-cover"
                            >
                              <source src={videoInfo.url} type="video/mp4" />
                            </video>
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                                <Play className="h-6 w-6 text-blue-600 ml-0.5" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <Play className="h-8 w-8 text-white opacity-70" />
                          </div>
                        )}
                        {/* Duration Badge */}
                        {videoInfo?.durationInSeconds && (
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
                            {duration}
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 line-clamp-2">
                                {videoInfo?.name || `Video ${idx + 1}`}
                              </h3>
                              {videoInfo && !videoInfo.active && (
                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-semibold whitespace-nowrap">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">ID: {videoId}</p>
                            
                            {videoInfo && (
                              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  {duration}
                                </span>
                                {videoInfo.category && (
                                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                                    {videoInfo.category}
                                  </span>
                                )}
                                {videoInfo.resolution && (
                                  <span className="text-xs text-gray-600">
                                    {videoInfo.resolution}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteVideo(videoId)}
                            disabled={deletingVideoId === videoId || (videoInfo && !videoInfo.active)}
                            className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition text-red-600 hover:text-red-700 disabled:opacity-50 disabled:hover:bg-transparent"
                            title={videoInfo && !videoInfo.active ? 'Cannot delete inactive videos' : 'Remove video from plan'}
                          >
                            {deletingVideoId === videoId ? (
                              <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Videos Section */}
          {(!currentLibrary.videoIds || currentLibrary.videoIds.length === 0) && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Added Yet</h3>
              <p className="text-gray-600 mb-6">Start building your workout library by adding videos</p>
              <button
                onClick={handleShowAddVideos}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Add Your First Video
              </button>
            </div>
          )}

          {/* Add Videos Modal - Using VideoSelector */}
          <AnimatePresence>
            {showAddVideos && (
              <VideoSelector
                videos={availableVideos as VideoFile[]}
                onSelect={async (videoIds) => {
                  setAddingVideos(true);
                  try {
                    await libraryService.addVideos(trainerId, currentLibrary.id, videoIds);
                    const updated = await libraryService.getLibrary(trainerId, currentLibrary.id);
                    setCurrentLibrary(updated);
                    setShowAddVideos(false);
                    setSelectedVideoIds([]);
                  } catch (error) {
                    console.error('Failed to add videos:', error);
                  } finally {
                    setAddingVideos(false);
                  }
                }}
                onCancel={() => {
                  setShowAddVideos(false);
                  setSelectedVideoIds([]);
                }}
                loading={addingVideos}
                selectedVideoIds={selectedVideoIds}
                existingVideoIds={currentLibrary.videoIds || []}
              />
            )}
          </AnimatePresence>

          {/* Agenda */}
          {currentLibrary.agenda && currentLibrary.agenda.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Agenda
              </h2>
              <div className="space-y-3">
                {currentLibrary.agenda.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <p className="font-semibold text-gray-900">
                      {item.order}. {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines */}
          {currentLibrary.guidelines && currentLibrary.guidelines.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Guidelines</h2>
              <ul className="space-y-2">
                {currentLibrary.guidelines.map((guideline, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-sm text-gray-600 p-3 rounded bg-blue-50"
                  >
                    <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {library.prerequisites && library.prerequisites.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Prerequisites</h2>
              <ul className="space-y-2">
                {currentLibrary.prerequisites.map((prerequisite, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-sm text-gray-600 p-3 rounded bg-purple-50"
                  >
                    <span className="text-purple-600 font-bold flex-shrink-0">•</span>
                    <span>{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {currentLibrary.warnings && currentLibrary.warnings.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Warnings & Disclaimers
              </h2>
              <div className="space-y-2">
                {currentLibrary.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 text-sm text-gray-700 p-3 rounded bg-yellow-50 border border-yellow-200"
                  >
                    <span className="text-yellow-600 font-bold flex-shrink-0">⚠️</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Right col */}
        <div className="space-y-6">
          {/* Key Stats */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Plan Summary</h3>

            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-5 w-5 text-blue-600" />
                <p className="font-semibold text-gray-900">{currentLibrary.totalVideos} Videos</p>
              </div>
              <p className="text-xs text-gray-600">Total content</p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <p className="font-semibold text-gray-900">
                  {Math.round(currentLibrary.totalDurationSeconds / 60)} Min
                </p>
              </div>
              <p className="text-xs text-gray-600">Total duration</p>
            </div>

            <div className={`rounded-lg p-4 border ${currentLibrary.priceInCents > 0 ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className="text-xs text-gray-600 mb-1">Price</p>
              <p className={`font-bold text-lg ${currentLibrary.priceInCents > 0 ? 'text-blue-900' : 'text-emerald-900'}`}>
                {formatPrice(currentLibrary.priceInCents)}
              </p>
            </div>
          </div>

          {/* Performance Stats (Mock) */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Performance</h3>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">4.7</span>
              </div>
              <p className="text-xs text-gray-600">342 reviews</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">Trending</span>
              </div>
              <p className="text-xs text-gray-600">127+ bought this week</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onEdit(currentLibrary)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <Edit className="h-4 w-4" />
            Edit Plan
          </button>
        </div>
      </div>
    </motion.div>
  );
}
