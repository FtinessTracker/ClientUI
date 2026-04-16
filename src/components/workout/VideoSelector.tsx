import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Check } from 'lucide-react';
import { VideoFile } from '../../services/fileService';

interface VideoSelectorProps {
  videos: VideoFile[];
  onSelect: (videoIds: string[]) => void;
  onCancel: () => void;
  loading?: boolean;
  selectedVideoIds?: string[];
  existingVideoIds?: string[];
}

export function VideoSelector({
  videos,
  onSelect,
  onCancel,
  loading = false,
  selectedVideoIds = [],
  existingVideoIds = [],
}: VideoSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedVideoIds));
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Filter out videos that are already part of the library
  const availableVideos = useMemo(() => {
    return videos.filter(v => !existingVideoIds.includes(v.id));
  }, [videos, existingVideoIds]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(availableVideos.map((v) => v.category || 'GENERAL'))).sort();
  }, [availableVideos]);

  // Filter videos based on search and category
  const filteredVideos = useMemo(() => {
    return availableVideos.filter((video) => {
      const matchesSearch = video.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || (video.category || 'GENERAL') === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [availableVideos, searchQuery, categoryFilter]);

  const toggleVideo = useCallback((videoId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }, []);

  const handleSubmit = () => {
    onSelect(Array.from(selectedIds));
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredVideos.length && filteredVideos.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVideos.map((v) => v.id)));
    }
  };

  const isAllSelected = filteredVideos.length > 0 && selectedIds.size === filteredVideos.length;

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
        className="max-h-[90vh] w-full max-w-3xl flex flex-col rounded-lg bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add Videos to Library</h2>
            <button
              onClick={onCancel}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Show notice if videos are filtered */}
          {existingVideoIds.length > 0 && (
            <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
              <p className="text-sm text-blue-700">
                Showing {availableVideos.length} available videos ({videos.length - availableVideos.length} already added)
              </p>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto">
          {filteredVideos.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              {videos.length === 0
                ? 'No videos available'
                : 'No videos match your search'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Select All Row */}
              <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600"
                />
                <span className="flex-1 text-sm font-medium text-gray-900">
                  {isAllSelected
                    ? `Deselect all (${filteredVideos.length})`
                    : `Select all (${filteredVideos.length})`}
                </span>
              </div>

              {/* Video Items */}
              <AnimatePresence>
                {filteredVideos.map((video) => {
                  const isSelected = selectedIds.has(video.id);
                  return (
                    <motion.div
                      key={video.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => toggleVideo(video.id)}
                      className={`flex cursor-pointer items-center gap-4 px-6 py-4 transition-colors ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="truncate font-medium text-gray-900">
                          {video.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {video.category || 'GENERAL'}
                          </span>
                          <span className="text-xs text-gray-600">
                            {video.durationInSeconds ? Math.round(video.durationInSeconds / 60) : '--'} min
                          </span>
                          <span className="text-xs text-gray-600">
                            {video.resolution || '--'}
                          </span>
                          <span className="text-xs text-gray-600">
                            {video.sizeInBytes ? (video.sizeInBytes / (1024 * 1024)).toFixed(1) : '--'} MB
                          </span>
                        </div>
                      </div>

                      <motion.div
                        initial={false}
                        animate={isSelected ? { scale: 1 } : { scale: 0 }}
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {selectedIds.size} video{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedIds.size === 0 || loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              {loading ? 'Adding...' : `Add ${selectedIds.size} Video${selectedIds.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
