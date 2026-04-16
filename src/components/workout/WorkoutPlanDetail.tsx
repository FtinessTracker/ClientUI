import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { WorkoutLibrary } from '../../services/libraryService';
import { fileService, VideoInfo } from '../../services/fileService';
import { VideoMetadataModal } from './VideoMetadataModal';

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
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  // Fetch video details for all videoIds
  useEffect(() => {
    const fetchVideos = async () => {
      if (!library.videoIds || library.videoIds.length === 0) return;

      setLoadingVideos(true);
      const videoMap = new Map<string, VideoInfo>();

      try {
        const videoPromises = library.videoIds.map(videoId =>
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
  }, [library.videoIds]);

  // Handle delete video
  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setDeletingVideoId(videoId);
    try {
      await fileService.deleteVideo(trainerId, videoId);
      // Remove video from the library state
      const updatedLibrary = {
        ...library,
        videoIds: library.videoIds.filter(id => id !== videoId),
        totalVideos: library.totalVideos - 1,
      };
      onArchive(updatedLibrary); // Using onArchive to update state as a workaround
      // In a real app, you might want a separate callback or refetch the library
      alert('Video deleted successfully');
    } catch (err) {
      console.error('Failed to delete video:', err);
      alert('Failed to delete video. Please try again.');
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
    setEditingVideoId(null);
    alert('Video metadata updated successfully');
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
          <h1 className="text-3xl font-bold text-gray-900">{library.name}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {library.category} • {library.difficulty}
          </p>
        </div>

        {/* Status & Menu */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              library.status === 'PUBLISHED'
                ? 'bg-green-100 text-green-800'
                : library.status === 'DRAFT'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {library.status}
          </span>

          {/* Three Dot Menu */}
          <div className="relative group">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50">
              <button
                onClick={() => {
                  onEdit(library);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
              >
                <Edit className="h-4 w-4" />
                Edit Plan
              </button>

              {library.status === 'DRAFT' && library.totalVideos > 0 && (
                <button
                  onClick={() => {
                    onPublish(library);
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-green-700 hover:bg-green-50 border-b border-gray-100 disabled:opacity-50"
                >
                  <Unlock className="h-4 w-4" />
                  Publish
                </button>
              )}

              {library.status === 'PUBLISHED' && (
                <button
                  onClick={() => {
                    onArchive(library);
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
                  onDelete(library);
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
        {library.thumbnailUrl ? (
          <img
            src={library.thumbnailUrl}
            alt={library.name}
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
              {library.description || 'No description provided'}
            </p>
          </div>

          {/* Videos List */}
          {library.videoIds && library.videoIds.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Workout Videos ({library.totalVideos})
              </h2>
              
              {loadingVideos && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 text-blue-600 animate-spin" />
                  <p className="ml-3 text-gray-600">Loading video details...</p>
                </div>
              )}

              <div className="space-y-4">
                {library.videoIds.map((videoId, idx) => {
                  const videoInfo = videoDetails.get(videoId);
                  const duration = videoInfo?.durationInSeconds
                    ? fileService.formatDuration(videoInfo.durationInSeconds)
                    : 'N/A';

                  return (
                    <div
                      key={videoId}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition flex gap-4 bg-white"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-28 h-28 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {videoInfo?.thumbnailUrl ? (
                          <img
                            src={videoInfo.thumbnailUrl}
                            alt={videoInfo.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Play className="h-8 w-8 text-white opacity-70" />
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
                            title={videoInfo && !videoInfo.active ? 'Cannot edit/delete inactive videos' : 'Delete video'}
                          >
                            {deletingVideoId === videoId ? (
                              <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => setEditingVideoId(videoId)}
                            disabled={videoInfo && !videoInfo.active}
                            className="flex-shrink-0 p-2 hover:bg-blue-50 rounded-lg transition text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:hover:bg-transparent"
                            title={videoInfo && !videoInfo.active ? 'Cannot edit/delete inactive videos' : 'Edit video metadata'}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Edit Modal */}
                      {editingVideoId === videoId && videoInfo && (
                        <VideoMetadataModal
                          isOpen={true}
                          video={videoInfo}
                          trainerId={trainerId}
                          onClose={() => setEditingVideoId(null)}
                          onSuccess={handleUpdateVideoMetadata}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agenda */}
          {library.agenda && library.agenda.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Agenda
              </h2>
              <div className="space-y-3">
                {library.agenda.map((item, idx) => (
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
          {library.guidelines && library.guidelines.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Guidelines</h2>
              <ul className="space-y-2">
                {library.guidelines.map((guideline, idx) => (
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
                {library.prerequisites.map((prerequisite, idx) => (
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
          {library.warnings && library.warnings.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Warnings & Disclaimers
              </h2>
              <div className="space-y-2">
                {library.warnings.map((warning, idx) => (
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
                <p className="font-semibold text-gray-900">{library.totalVideos} Videos</p>
              </div>
              <p className="text-xs text-gray-600">Total content</p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <p className="font-semibold text-gray-900">
                  {Math.round(library.totalDurationSeconds / 60)} Min
                </p>
              </div>
              <p className="text-xs text-gray-600">Total duration</p>
            </div>

            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Price</p>
              <p className="font-bold text-gray-900 text-lg">
                {library.priceInCents > 0
                  ? `$${(library.priceInCents / 100).toFixed(2)}`
                  : 'Free'}
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
            onClick={() => onEdit(library)}
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
