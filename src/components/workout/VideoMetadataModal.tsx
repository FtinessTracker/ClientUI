import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader } from 'lucide-react';
import { fileService, VideoInfo } from '../../services/fileService';

interface VideoMetadataModalProps {
  isOpen: boolean;
  video: VideoInfo;
  trainerId: string;
  onClose: () => void;
  onSuccess: (updatedVideo: VideoInfo) => void;
}

const VIDEO_CATEGORIES = [
  'YOGA',
  'HIIT',
  'STRENGTH',
  'CARDIO',
  'STRETCHING',
  'NUTRITION',
  'MEDITATION',
  'GENERAL',
  'OTHER',
];

export function VideoMetadataModal({
  isOpen,
  video,
  trainerId,
  onClose,
  onSuccess,
}: VideoMetadataModalProps) {
  const [formData, setFormData] = useState({
    name: video.name,
    category: video.category || 'GENERAL',
    visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await fileService.updateVideoMetadata(trainerId, video.id, {
        name: formData.name,
        category: formData.category as any,
        visibility: formData.visibility,
      });

      // Update the video info with new data
      const updatedVideo: VideoInfo = {
        ...video,
        name: result.name,
        category: result.category,
      };

      onSuccess(updatedVideo);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update video metadata';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Edit Video Metadata</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Video Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter video name"
                  disabled={isLoading}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {VIDEO_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <div className="flex gap-4">
                  {(['PRIVATE', 'PUBLIC'] as const).map((visibility) => (
                    <label key={visibility} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        value={visibility}
                        checked={formData.visibility === visibility}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            visibility: e.target.value as 'PUBLIC' | 'PRIVATE',
                          })
                        }
                        disabled={isLoading}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{visibility}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
