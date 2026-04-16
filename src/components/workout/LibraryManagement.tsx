import { useState, useEffect, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Unlock,
  Archive,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  Grid3x3,
  List,
  MoreVertical,
} from 'lucide-react';
import { libraryService, WorkoutLibrary } from '../../services/libraryService';
import { fileService, VideoFile } from '../../services/fileService';
import { LibraryCreationForm } from './LibraryCreationForm';
import { VideoSelector } from './VideoSelector';
import { WorkoutPlanDetail } from './WorkoutPlanDetail';


type ViewMode = 'list' | 'creation' | 'videoselector' | 'detail';
type DisplayMode = 'grid' | 'list';

// Card Menu Component
function CardMenu({
  library,
  onPublish,
  onArchive,
  onDelete,
  isLoading,
}: {
  library: WorkoutLibrary;
  onPublish: (lib: WorkoutLibrary) => Promise<void>;
  onArchive: (lib: WorkoutLibrary) => Promise<void>;
  onDelete: (lib: WorkoutLibrary) => Promise<void>;
  isLoading: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const isPublished = library.status === 'PUBLISHED';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left - 150, // Adjust based on menu width (w-44 = 176px)
      });
    }
    
    setShowMenu(!showMenu);
  };

  return (
    <div ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={handleMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
            className="w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            {!isPublished && library.totalVideos > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(library);
                  setShowMenu(false);
                }}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-green-700 hover:bg-green-50 border-b border-gray-100 disabled:opacity-50"
              >
                <Unlock className="h-4 w-4" />
                Publish
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(library);
                setShowMenu(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LibraryManagement({ trainerId, trainerName }: { trainerId: string; trainerName: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [libraries, setLibraries] = useState<WorkoutLibrary[]>([]);
  const [filteredLibraries, setFilteredLibraries] = useState<WorkoutLibrary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedLibrary, setSelectedLibrary] = useState<WorkoutLibrary | null>(null);
  const [allVideos, setAllVideos] = useState<VideoFile[]>([]);
  const [detailLibrary, setDetailLibrary] = useState<WorkoutLibrary | null>(null);

  // Fetch libraries and videos on mount
  useEffect(() => {
    fetchLibraries();
    fetchVideosFromAPI();
  }, []);

  // Filter libraries when search or status filter changes
  useEffect(() => {
    let filtered = libraries;

    if (searchQuery) {
      filtered = filtered.filter((lib) =>
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((lib) => lib.status === statusFilter);
    }

    setFilteredLibraries(filtered);
  }, [libraries, searchQuery, statusFilter]);

  const fetchLibraries = async () => {
    setLoading(true);
    try {
      const data = await libraryService.getLibraries(trainerId);
      setLibraries(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load libraries');
    } finally {
      setLoading(false);
    }
  };

  const fetchVideosFromAPI = async () => {
    try {
      setLoading(true);
      // Fetch all completed videos for the trainer across all categories
      const videos = await fileService.getUserUploads(trainerId, 'COMPLETED');
      setAllVideos(videos);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError('Failed to load trainer videos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideos = async (videoIds: string[]) => {
    if (!selectedLibrary) return;

    setLoading(true);
    try {
      await libraryService.addVideos(trainerId, selectedLibrary.id, videoIds);
      setSuccessMessage(`Added ${videoIds.length} video(s) to ${selectedLibrary.name}`);
      fetchLibraries();
      setViewMode('list');
      setSelectedLibrary(null);

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add videos');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (library: WorkoutLibrary) => {
    if (library.totalVideos === 0) {
      setError('Cannot publish library without videos');
      return;
    }

    setLoading(true);
    try {
      await libraryService.updateStatus(trainerId, library.id, 'PUBLISHED');
      setSuccessMessage(`${library.name} published successfully`);
      fetchLibraries();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish library');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (library: WorkoutLibrary) => {
    setLoading(true);
    try {
      await libraryService.updateStatus(trainerId, library.id, 'ARCHIVED');
      setSuccessMessage(`${library.name} archived`);
      fetchLibraries();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive library');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLibrary = async (library: WorkoutLibrary) => {
    if (!confirm(`Are you sure you want to delete "${library.name}"?`)) return;

    setLoading(true);
    try {
      await libraryService.deleteLibrary(trainerId, library.id);
      setSuccessMessage(`${library.name} deleted`);
      fetchLibraries();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete library');
    } finally {
      setLoading(false);
    }
  };

  const openVideoSelector = (library: WorkoutLibrary) => {
    setSelectedLibrary(library);
    setViewMode('videoselector');
  };

  // View: Library List
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Workout Library</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage your workout libraries
            </p>
          </div>
          <button
            onClick={() => setViewMode('creation')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            New Library
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 rounded-lg bg-red-50 p-4"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-700">
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Alert */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 rounded-lg bg-green-50 p-4"
            >
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 1: Your Created Libraries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Your Created Libraries</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search libraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <button
                onClick={() => setDisplayMode(displayMode === 'grid' ? 'list' : 'grid')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-600 hover:bg-gray-50"
              >
                {displayMode === 'grid' ? (
                  <List className="h-5 w-5" />
                ) : (
                  <Grid3x3 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Libraries Grid/List */}
          {loading && !libraries.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Loading libraries...</p>
              </div>
            </div>
          ) : filteredLibraries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-600">
                {libraries.length === 0
                  ? 'No libraries yet. Create your first one!'
                  : 'No libraries match your search.'}
              </p>
            </div>
          ) : (
            <div className={displayMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              <AnimatePresence>
                {filteredLibraries.map((library) => (
                  <motion.div
                    key={library.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 transition relative ${
                      displayMode === 'list' ? 'flex items-stretch' : ''
                    }`}
                  >
                    {/* Three-Dot Menu - Removed from here */}

                    {/* Thumbnail */}
                    <div
                      className={`relative ${
                        displayMode === 'list'
                          ? 'h-24 w-24 flex-shrink-0'
                          : 'h-40 w-full'
                      } bg-gray-200 overflow-hidden cursor-pointer`}
                      onClick={() => {
                        setDetailLibrary(library);
                        setViewMode('detail');
                      }}
                    >
                      {library.thumbnailUrl ? (
                        <img
                          src={library.thumbnailUrl}
                          alt={library.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-400" />
                        </div>
                      )}

                      {/* Status Badge */}
                      {displayMode === 'grid' && (
                        <div className="absolute top-2 left-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              library.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-800'
                                : library.status === 'DRAFT'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {library.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={`p-4 space-y-3 flex-1 cursor-pointer ${displayMode === 'list' ? 'min-w-0 flex flex-col justify-start' : ''}`}
                      onClick={() => {
                        setDetailLibrary(library);
                        setViewMode('detail');
                      }}
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {library.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {library.category} • {library.difficulty}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          {library.totalVideos} videos
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.round(library.totalDurationSeconds / 60)} min
                        </span>
                        {library.priceInCents > 0 && (
                          <span>${(library.priceInCents / 100).toFixed(2)}</span>
                        )}
                      </div>

                      {displayMode === 'grid' && (
                        <>
                          {/* Add Videos Button & Menu */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openVideoSelector(library);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                              <Plus className="h-3 w-3" />
                              Add Videos
                            </button>
                            <CardMenu
                              library={library}
                              onPublish={handlePublish}
                              onArchive={handleArchive}
                              onDelete={handleDeleteLibrary}
                              isLoading={loading}
                            />
                          </div>
                        </>
                      )}
                      
                      {displayMode === 'list' && (
                        <>
                          {/* List mode: Add Videos and Menu in a row */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openVideoSelector(library);
                              }}
                              className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                              <Plus className="h-3 w-3 inline mr-1" />
                              Add Videos
                            </button>
                            <CardMenu
                              library={library}
                              onPublish={handlePublish}
                              onArchive={handleArchive}
                              onDelete={handleDeleteLibrary}
                              isLoading={loading}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Section 2: Available Plans - REMOVED */}
        {/* We now only show user-created workout plans */}
      </motion.div>
    );
  }

  // View: Create Library
  if (viewMode === 'creation') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <LibraryCreationForm
          trainerId={trainerId}
          trainerName={trainerName}
          editingLibrary={selectedLibrary || undefined}
          onSuccess={() => {
            setSuccessMessage(selectedLibrary ? 'Library updated successfully!' : 'Library created successfully!');
            setViewMode('list');
            setSelectedLibrary(null);
            fetchLibraries();
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
          onCancel={() => {
            setViewMode('list');
            setSelectedLibrary(null);
          }}
        />
      </motion.div>
    );
  }

  // View: Video Selector
  if (viewMode === 'videoselector' && selectedLibrary) {
    return (
      <VideoSelector
        videos={allVideos}
        loading={loading}
        existingVideoIds={selectedLibrary.videoIds || []}
        onSelect={handleAddVideos}
        onCancel={() => {
          setViewMode('list');
          setSelectedLibrary(null);
        }}
      />
    );
  }

  // View: Workout Plan Detail (Full Page)
  if (viewMode === 'detail' && detailLibrary) {
    return (
      <WorkoutPlanDetail
        library={detailLibrary}
        trainerId={trainerId}
        onEdit={(library) => {
          setSelectedLibrary(library);
          setViewMode('creation');
        }}
        onArchive={async (library) => {
          await handleArchive(library);
          setViewMode('list');
          setDetailLibrary(null);
        }}
        onDelete={async (library) => {
          await handleDeleteLibrary(library);
          setViewMode('list');
          setDetailLibrary(null);
        }}
        onPublish={async (library) => {
          await handlePublish(library);
          // Refresh the detail with updated library
          const updated = await libraryService.getLibrary(trainerId, library.id);
          setDetailLibrary(updated);
        }}
        onClose={() => {
          setViewMode('list');
          setDetailLibrary(null);
        }}
        isLoading={loading}
      />
    );
  }

  return null;
}