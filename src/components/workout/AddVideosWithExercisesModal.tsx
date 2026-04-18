import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Play, ChevronRight } from 'lucide-react';
import { VideoFile } from '../../services/fileService';
import { ExerciseSetManager, ExerciseSet } from './ExerciseSetManager';

interface VideoEntryWithExercises {
  videoId: string;
  videoName: string;
  exerciseType: 'REPS' | 'TIME';
  sets: ExerciseSet[];
}

interface AddVideosWithExercisesModalProps {
  videos: VideoFile[];
  onAddVideos: (entries: VideoEntryWithExercises[]) => void;
  onCancel: () => void;
  loading?: boolean;
  existingVideoIds?: string[];
}

export function AddVideosWithExercisesModal({
  videos,
  onAddVideos,
  onCancel,
  loading = false,
  existingVideoIds = [],
}: AddVideosWithExercisesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [videoEntries, setVideoEntries] = useState<Map<string, VideoEntryWithExercises>>(
    new Map()
  );

  // Filter out videos that are already part of the library
  const availableVideos = useMemo(() => {
    return videos.filter((v) => !existingVideoIds.includes(v.id));
  }, [videos, existingVideoIds]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(availableVideos.map((v) => v.category || 'GENERAL'))).sort();
  }, [availableVideos]);

  // Filter videos based on search and category
  const filteredVideos = useMemo(() => {
    return availableVideos.filter((video) => {
      const displayName = video.exerciseName || video.name;
      const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !categoryFilter || (video.category || 'GENERAL') === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [availableVideos, searchQuery, categoryFilter]);

  const toggleVideo = useCallback((videoId: string) => {
    setSelectedVideoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedVideoIds.size === filteredVideos.length && filteredVideos.length > 0) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(filteredVideos.map((v) => v.id)));
    }
  };

  const handleProceedToConfiguration = () => {
    // Initialize video entries with default settings
    const entries = new Map<string, VideoEntryWithExercises>();
    selectedVideoIds.forEach((videoId) => {
      const video = availableVideos.find((v) => v.id === videoId);
      if (video) {
        // Default exercise type based on video's exerciseType, fallback to REPS
        const defaultExerciseType = video.exerciseType === 'TIMED' ? 'TIME' : 'REPS';
        entries.set(videoId, {
          videoId,
          videoName: video.exerciseName || video.name,
          exerciseType: defaultExerciseType,
          sets: [{ setNumber: 1, reps: 10, durationSeconds: null, restSeconds: 30 }],
        });
      }
    });
    setVideoEntries(entries);
    setStep('configure');
  };

  const handleUpdateExerciseType = (videoId: string, exerciseType: 'REPS' | 'TIME') => {
    setVideoEntries((prev) => {
      const entry = prev.get(videoId);
      if (entry) {
        const updated = new Map(prev);
        // Reset sets based on exercise type
        const defaultSets: ExerciseSet[] = [
          {
            setNumber: 1,
            reps: exerciseType === 'REPS' ? 10 : null,
            durationSeconds: exerciseType === 'TIME' ? 30 : null,
            restSeconds: 30,
          },
        ];
        updated.set(videoId, {
          ...entry,
          exerciseType,
          sets: defaultSets,
        });
        return updated;
      }
      return prev;
    });
  };

  const handleUpdateSets = (videoId: string, sets: ExerciseSet[]) => {
    setVideoEntries((prev) => {
      const entry = prev.get(videoId);
      if (entry) {
        const updated = new Map(prev);
        updated.set(videoId, { ...entry, sets });
        return updated;
      }
      return prev;
    });
  };

  const handleRemoveVideo = (videoId: string) => {
    setVideoEntries((prev) => {
      const updated = new Map(prev);
      updated.delete(videoId);
      return updated;
    });
  };

  const handleSubmit = () => {
    const entries: VideoEntryWithExercises[] = Array.from(videoEntries.values());
    onAddVideos(entries);
  };

  const isAllSelected =
    filteredVideos.length > 0 && selectedVideoIds.size === filteredVideos.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-4xl flex flex-col rounded-lg bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'select' ? 'Add Videos to Library' : 'Configure Exercise Sets'}
            </h2>
            {step === 'configure' && (
              <p className="text-sm text-gray-600 mt-1">
                Set up exercise parameters for each video
              </p>
            )}
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'select' ? (
            <>
              {/* Search and Filter */}
              <div className="border-b border-gray-200 px-6 py-4 space-y-4 sticky top-0 bg-white z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategoryFilter('')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        categoryFilter === ''
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                          categoryFilter === cat
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos List */}
              <div className="p-6 space-y-2">
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 font-medium">No videos available</p>
                  </div>
                ) : (
                  <>
                    {/* Select All */}
                    <motion.div
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-3"
                    >
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        Select All ({filteredVideos.length})
                      </span>
                    </motion.div>

                    {/* Video Items */}
                    <AnimatePresence mode="popLayout">
                      {filteredVideos.map((video) => {
                        const isSelected = selectedVideoIds.has(video.id);
                        return (
                          <motion.div
                            key={video.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex items-center gap-4 p-4 border rounded-lg transition ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleVideo(video.id)}
                              className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 flex-shrink-0"
                            />

                            {/* Video Thumbnail */}
                            <div
                              className="relative w-20 h-20 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden flex-shrink-0"
                            >
                              {video.s3Url ? (
                                <>
                                  <video
                                    poster={video.thumbnailUrl || undefined}
                                    preload="metadata"
                                    className="w-full h-full object-cover bg-slate-900"
                                  >
                                    <source src={video.s3Url} type="video/mp4" />
                                  </video>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Play className="w-6 h-6 text-white/30" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="truncate font-medium text-gray-900">
                                {video.exerciseName || video.name}
                              </h3>
                              <div className="mt-1 flex flex-wrap gap-2">
                                <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                  {video.category || 'GENERAL'}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {video.durationInSeconds
                                    ? Math.round(video.durationInSeconds / 60)
                                    : '--'}{' '}
                                  min
                                </span>
                                <span className="text-xs text-gray-600">
                                  {video.resolution || '--'}
                                </span>
                              </div>
                            </div>

                            <motion.div
                              initial={false}
                              animate={isSelected ? { scale: 1 } : { scale: 0 }}
                            >
                              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 flex-shrink-0">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </>
          ) : (
            // Configuration Step
            <div className="p-6 space-y-6">
              {Array.from(videoEntries.entries()).map(([videoId, entry]) => (
                <motion.div
                  key={videoId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  {/* Video Header with Exercise Type Selector */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Play className="w-6 h-6 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{entry.videoName}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveVideo(videoId)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Exercise Type Selector */}
                  <div className="mb-6 flex gap-3">
                    {(['REPS', 'TIME'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleUpdateExerciseType(videoId, type)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                          entry.exerciseType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'REPS' ? '🔢 Reps-Based' : '⏱️ Time-Based'}
                      </button>
                    ))}
                  </div>

                  {/* Exercise Set Manager */}
                  <ExerciseSetManager
                    exerciseType={entry.exerciseType}
                    sets={entry.sets}
                    onSetsChange={(sets) => handleUpdateSets(videoId, sets)}
                    videoName={entry.videoName}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
          {step === 'select' ? (
            <>
              <span className="text-sm font-medium text-gray-700">
                {selectedVideoIds.size} video{selectedVideoIds.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToConfiguration}
                  disabled={selectedVideoIds.size === 0}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('select')}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={videoEntries.size === 0 || loading}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  {loading ? 'Adding...' : `Add ${videoEntries.size} Video${videoEntries.size !== 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
