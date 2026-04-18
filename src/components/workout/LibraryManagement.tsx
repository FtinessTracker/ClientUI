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
  Calendar,
} from 'lucide-react';
import { libraryService, WorkoutLibrary } from '../../services/libraryService';
import { fileService, VideoFile } from '../../services/fileService';
import { formatDate, formatPrice } from '../../lib/utils';
import { useSnackbar } from '../ui/Snackbar';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { LibraryCreationForm } from './LibraryCreationForm';
import { AddVideosWithExercisesModal } from './AddVideosWithExercisesModal';
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

export function LibraryManagement({ trainerId, trainerName, videos: initialVideos }: { trainerId: string; trainerName: string; videos?: VideoFile[] }) {
  const { error: showError, success: showSuccess } = useSnackbar();
  const { confirm: showConfirm } = useConfirmDialog();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [libraries, setLibraries] = useState<WorkoutLibrary[]>([]);
  const [filteredLibraries, setFilteredLibraries] = useState<WorkoutLibrary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedLibrary, setSelectedLibrary] = useState<WorkoutLibrary | null>(null);
  const [allVideos, setAllVideos] = useState<VideoFile[]>([]);
  const [detailLibrary, setDetailLibrary] = useState<WorkoutLibrary | null>(null);

  // Fetch libraries and videos on mount
  useEffect(() => {
    fetchLibraries();
    // Only fetch videos if not provided as prop
    if (!initialVideos) {
      fetchVideosFromAPI();
    }
  }, [statusFilter]); // Re-fetch when status filter changes

  // Update allVideos when initialVideos prop changes
  useEffect(() => {
    if (initialVideos) {
      setAllVideos(initialVideos);
    }
  }, [initialVideos]);

  // Filter libraries by search only (status filtering is now handled by API)
  useEffect(() => {
    let filtered = libraries;

    if (searchQuery) {
      filtered = filtered.filter((lib) =>
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLibraries(filtered);
  }, [libraries, searchQuery]);

  const fetchLibraries = async () => {
    setLoading(true);
    try {
      // Fetch libraries from API
      // If status filter is set, pass it to API (DRAFT, PUBLISHED, ARCHIVED)
      // If not set, API returns all non-archived by default
      const data = await libraryService.getLibraries(trainerId, statusFilter || undefined);
      setLibraries(data);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load libraries');
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
      showError('Failed to load trainer videos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideos = async (entries: Array<{
    videoId: string;
    videoName: string;
    exerciseType: 'REPS' | 'TIME';
    sets: Array<{ setNumber: number; reps?: number | null; durationSeconds?: number | null; restSeconds: number }>;
  }>) => {
    if (!selectedLibrary) return;

    setLoading(true);
    try {
      // Add videos to library with entries format (includes exercise details)
      await libraryService.addVideos(trainerId, selectedLibrary.id, entries);

      showSuccess(`Added ${entries.length} video(s) with exercise details to ${selectedLibrary.name}`);
      fetchLibraries();
      setViewMode('list');
      setSelectedLibrary(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add videos');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (library: WorkoutLibrary) => {
    if (library.totalVideos === 0) {
      showError('Cannot publish library without videos');
      return;
    }

    setLoading(true);
    try {
      await libraryService.updateStatus(trainerId, library.id, 'PUBLISHED');
      showSuccess(`${library.name} published successfully`);
      fetchLibraries();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to publish library');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (library: WorkoutLibrary) => {
    setLoading(true);
    try {
      await libraryService.updateStatus(trainerId, library.id, 'ARCHIVED');
      showSuccess(`${library.name} archived`);
      fetchLibraries();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to archive library');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLibrary = async (library: WorkoutLibrary) => {
    const confirmed = await showConfirm({
      title: 'Delete Library',
      message: `Are you sure you want to delete "${library.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await libraryService.deleteLibrary(trainerId, library.id);
      showSuccess(`${library.name} deleted`);
      fetchLibraries();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete library');
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

        {/* Section 1: Your Created Libraries */}
        <div className="space-y-0">
          <div className="flex items-center justify-end gap-2 mb-4">
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
              <p className="text-gray-600 mb-6">
                {libraries.length === 0
                  ? 'No libraries yet. Create your first one!'
                  : 'No libraries match your search.'}
              </p>
              {libraries.length === 0 && (
                <button
                  onClick={() => setViewMode('creation')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Create Library
                </button>
              )}
            </div>
          ) : (
            <div className={displayMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              <AnimatePresence>
                {/* Add New Library Placeholder Card */}
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setViewMode('creation')}
                  className={`group rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex flex-col items-center justify-center ${displayMode === 'grid' ? 'aspect-auto h-64' : 'h-24'}`}
                >
                  <Plus className="h-12 w-12 text-gray-400 group-hover:text-blue-500 transition" />
                  <p className="mt-2 font-medium text-gray-600 group-hover:text-blue-600">Add</p>
                </motion.div>

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
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(library.createdAt)}
                        </span>
                      </div>

                      {/* Price Badge */}
                      <div>
                        {library.priceInCents > 0 ? (
                          <span className="inline-block rounded-lg bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold">
                            {formatPrice(library.priceInCents)}
                          </span>
                        ) : (
                          <span className="inline-block rounded-lg bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-semibold">
                            FREE
                          </span>
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
            showSuccess(selectedLibrary ? 'Library updated successfully!' : 'Library created successfully!');
            setViewMode('list');
            setSelectedLibrary(null);
            fetchLibraries();
          }}
          onCancel={() => {
            setViewMode('list');
            setSelectedLibrary(null);
          }}
        />
      </motion.div>
    );
  }

  // View: Add Videos with Exercises
  if (viewMode === 'videoselector' && selectedLibrary) {
    return (
      <AddVideosWithExercisesModal
        videos={allVideos}
        loading={loading}
        existingVideoIds={selectedLibrary.videoIds || []}
        onAddVideos={handleAddVideos}
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