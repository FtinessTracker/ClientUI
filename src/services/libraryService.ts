import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

interface CreateLibraryRequest {
  name: string;
  description?: string;
  priceInCents?: number;
  category?: string;
  difficulty?: string;
  agenda?: Array<{ order: number; title: string; description: string; videoId: string }>;
  guidelines?: string[];
  prerequisites?: string[];
  warnings?: string[];
  images?: Array<{ imageUrl: string; caption: string; order: number }>;
  videoIds?: string[];
}

interface LibraryVideoRequest {
  videoIds: string[];
}

interface WorkoutLibrary {
  id: string;
  trainerId: string;
  trainerName: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  priceInCents: number;
  category: string;
  difficulty: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  totalVideos: number;
  totalDurationSeconds: number;
  videoIds: string[];
  agenda: Array<{ order: number; title: string; description: string; videoId: string }>;
  guidelines: string[];
  prerequisites: string[];
  warnings: string[];
  images: Array<{ imageUrl: string; caption: string; order: number }>;
  createdAt: string;
  updatedAt: string;
}

interface LibrarySummary {
  id: string;
  name: string;
  thumbnailUrl: string;
  totalVideos: number;
  status: string;
}

interface LibraryVideoResponse {
  libraryId: string;
  addedVideoIds: string[];
  failedVideoIds: Array<{ videoId: string; reason: string }>;
  totalVideos: number;
  totalDurationSeconds: number;
}

const handleResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API error: ${response.statusText}`);
  }
  return response.json();
};

export const libraryService = {
  // Get all libraries for a trainer
  getLibraries: async (trainerId: string, status?: string): Promise<WorkoutLibrary[]> => {
    const url = new URL(`${API_BASE}/api/library/${trainerId}`);
    if (status) url.searchParams.append('status', status);

    const response = await fetch(url.toString());
    return handleResponse<WorkoutLibrary[]>(response);
  },

  // Get lightweight library summaries (for dropdowns/selection)
  getLibrarySummaries: async (trainerId: string): Promise<LibrarySummary[]> => {
    const response = await fetch(`${API_BASE}/api/library/${trainerId}/summary`);
    return handleResponse<LibrarySummary[]>(response);
  },

  // Get a specific library by ID
  getLibrary: async (trainerId: string, libraryId: string): Promise<WorkoutLibrary> => {
    const response = await fetch(`${API_BASE}/api/library/${trainerId}/${libraryId}`);
    return handleResponse<WorkoutLibrary>(response);
  },

  // Create a new library
  createLibrary: async (
    trainerId: string,
    trainerName: string,
    request: CreateLibraryRequest,
    thumbnailFile?: File
  ): Promise<WorkoutLibrary> => {
    const formData = new FormData();
    // Append JSON as Blob with proper content type
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    const response = await fetch(
      `${API_BASE}/api/library/${trainerId}?trainerName=${encodeURIComponent(trainerName)}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    return handleResponse<WorkoutLibrary>(response);
  },

  // Update library info
  updateLibrary: async (
    trainerId: string,
    libraryId: string,
    request: CreateLibraryRequest,
    thumbnailFile?: File
  ): Promise<WorkoutLibrary> => {
    const formData = new FormData();
    // Append JSON as Blob with proper content type
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    const response = await fetch(
      `${API_BASE}/api/library/${trainerId}/${libraryId}`,
      {
        method: 'PUT',
        body: formData,
      }
    );
    return handleResponse<WorkoutLibrary>(response);
  },

  // Update library status
  updateStatus: async (
    trainerId: string,
    libraryId: string,
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  ): Promise<WorkoutLibrary> => {
    const response = await fetch(
      `${API_BASE}/api/library/${trainerId}/${libraryId}/status?status=${status}`,
      { method: 'PATCH' }
    );
    return handleResponse<WorkoutLibrary>(response);
  },

  // Add videos to library
  addVideos: async (
    trainerId: string,
    libraryId: string,
    videoIds: string[]
  ): Promise<LibraryVideoResponse> => {
    const response = await fetch(
      `${API_BASE}/api/library/${trainerId}/${libraryId}/videos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds }),
      }
    );
    return handleResponse<LibraryVideoResponse>(response);
  },

  // Remove videos from library
  removeVideos: async (
    trainerId: string,
    libraryId: string,
    videoIds: string[]
  ): Promise<WorkoutLibrary> => {
    const response = await fetch(
      `${API_BASE}/api/library/${trainerId}/${libraryId}/remove-videos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds }),
      }
    );
    return handleResponse<WorkoutLibrary>(response);
  },

  // Delete (archive) library
  deleteLibrary: async (trainerId: string, libraryId: string): Promise<any> => {
    const response = await fetch(
      `${API_BASE}/api/library/${trainerId}/${libraryId}`,
      { method: 'DELETE' }
    );
    return handleResponse<any>(response);
  },
};

export type { CreateLibraryRequest, LibrarySummary, WorkoutLibrary, LibraryVideoResponse };
