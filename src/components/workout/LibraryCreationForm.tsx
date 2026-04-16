import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, ChevronLeft, AlertCircle } from 'lucide-react';
import { libraryService, CreateLibraryRequest, WorkoutLibrary } from '../../services/libraryService';

interface LibraryCreationFormProps {
  trainerId: string;
  trainerName: string;
  videoIds?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
  editingLibrary?: WorkoutLibrary;
}

type Step = 'basic' | 'thumbnail' | 'details' | 'confirm';

const CATEGORIES = [
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

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export function LibraryCreationForm({
  trainerId,
  trainerName,
  videoIds = [],
  onSuccess,
  onCancel,
  editingLibrary,
}: LibraryCreationFormProps) {
  // For editing, show all fields on one page. For creating, use stepper.
  const isEditing = !!editingLibrary;
  const [step, setStep] = useState<Step>(isEditing ? 'confirm' : 'basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: editingLibrary?.name || '',
    description: editingLibrary?.description || '',
    category: (editingLibrary?.category as any) || 'STRENGTH',
    difficulty: (editingLibrary?.difficulty as any) || 'BEGINNER',
    priceInCents: editingLibrary?.priceInCents || 0,
    guidelines: editingLibrary?.guidelines || ([] as string[]),
    prerequisites: editingLibrary?.prerequisites || ([] as string[]),
    warnings: editingLibrary?.warnings || ([] as string[]),
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string>('');
  const [newGuidelineInput, setNewGuidelineInput] = useState('');
  const [newPrerequisiteInput, setNewPrerequisiteInput] = useState('');
  const [newWarningInput, setNewWarningInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Math.max(0, Number(value) || 0) : value,
    }));
    setError('');
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (must not exceed 2MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 2) {
      setThumbnailError('Thumbnail image must not exceed 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setThumbnailError('Please select a valid image file');
      return;
    }

    setThumbnail(file);
    setThumbnailError('');
  };

  const validateStep = (): boolean => {
    if (step === 'basic') {
      if (!formData.name.trim()) {
        setError('Library name is required');
        return false;
      }
      if (formData.name.length < 3) {
        setError('Library name must be at least 3 characters');
        return false;
      }
      return true;
    }

    if (step === 'thumbnail') {
      if (!thumbnail) {
        setError('Please select a thumbnail image');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const steps: Step[] = ['basic', 'thumbnail', 'details', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['basic', 'thumbnail', 'details', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const libraryRequest: CreateLibraryRequest = {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        difficulty: formData.difficulty,
        priceInCents: formData.priceInCents,
        guidelines: formData.guidelines.length > 0 ? formData.guidelines : undefined,
        prerequisites: formData.prerequisites.length > 0 ? formData.prerequisites : undefined,
        warnings: formData.warnings.length > 0 ? formData.warnings : undefined,
        videoIds: videoIds.length > 0 ? videoIds : undefined,
      };

      if (isEditing && editingLibrary) {
        // Update existing library
        await libraryService.updateLibrary(
          trainerId,
          editingLibrary.id,
          libraryRequest,
          thumbnail || undefined
        );
      } else {
        // Create new library
        await libraryService.createLibrary(
          trainerId,
          trainerName,
          libraryRequest,
          thumbnail || undefined
        );
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} library`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Update Library' : 'Create Workout Library'}
        </h2>
        {!isEditing && (
          <p className="mt-2 text-sm text-gray-600">
            Step {['basic', 'thumbnail', 'details', 'confirm'].indexOf(step) + 1} of 4
          </p>
        )}

        {/* Progress Bar - Show for creation and edit */}
        <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{
              width: `${
                ((['basic', 'thumbnail', 'details', 'confirm'].indexOf(step) + 1) / 4) * 100
              }%`,
            }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* EDIT MODE: All fields on single page */}
      {isEditing && step === 'confirm' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Thumbnail Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thumbnail Image</h3>
            
            <div className="flex gap-6">
              {/* Current Thumbnail Preview */}
              <div className="flex-shrink-0">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Thumbnail</p>
                <div className="relative h-40 w-40 rounded-lg bg-gray-200 overflow-hidden border border-gray-300">
                  {editingLibrary?.thumbnailUrl ? (
                    <img
                      src={editingLibrary.thumbnailUrl}
                      alt="Current thumbnail"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload New Thumbnail */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">Replace Thumbnail</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {thumbnail ? thumbnail.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-600">PNG, JPG, GIF up to 2MB</p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>

                {thumbnailError && (
                  <p className="mt-2 text-sm text-red-600">{thumbnailError}</p>
                )}

                {thumbnail && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-blue-900">
                      ✓ New thumbnail selected: <span className="font-medium">{thumbnail.name}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Library Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Full Body Strength Training"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this library contains and who it's for..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (in cents)
              </label>
              <input
                type="number"
                name="priceInCents"
                value={formData.priceInCents}
                onChange={handleInputChange}
                placeholder="e.g., 2999 = $29.99"
                min="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Guidelines</h3>
            
            <div className="space-y-3">
              {formData.guidelines.map((guideline, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex-1">{guideline}</span>
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        guidelines: prev.guidelines.filter((_, i) => i !== index),
                      }));
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newGuidelineInput}
                onChange={(e) => setNewGuidelineInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newGuidelineInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        guidelines: [...prev.guidelines, newGuidelineInput.trim()],
                      }));
                      setNewGuidelineInput('');
                    }
                  }
                }}
                placeholder="Add a guideline..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newGuidelineInput.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      guidelines: [...prev.guidelines, newGuidelineInput.trim()],
                    }));
                    setNewGuidelineInput('');
                  }
                }}
                className="rounded-lg bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200 font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Prerequisites Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h3>
            
            <div className="space-y-3">
              {formData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex-1">{prerequisite}</span>
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        prerequisites: prev.prerequisites.filter((_, i) => i !== index),
                      }));
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newPrerequisiteInput}
                onChange={(e) => setNewPrerequisiteInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newPrerequisiteInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        prerequisites: [...prev.prerequisites, newPrerequisiteInput.trim()],
                      }));
                      setNewPrerequisiteInput('');
                    }
                  }
                }}
                placeholder="Add a prerequisite..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newPrerequisiteInput.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      prerequisites: [...prev.prerequisites, newPrerequisiteInput.trim()],
                    }));
                    setNewPrerequisiteInput('');
                  }
                }}
                className="rounded-lg bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200 font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Warnings Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Warnings & Disclaimers</h3>
            
            <div className="space-y-3">
              {formData.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-sm text-yellow-900 flex-1">⚠️ {warning}</span>
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        warnings: prev.warnings.filter((_, i) => i !== index),
                      }));
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newWarningInput}
                onChange={(e) => setNewWarningInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newWarningInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        warnings: [...prev.warnings, newWarningInput.trim()],
                      }));
                      setNewWarningInput('');
                    }
                  }
                }}
                placeholder="Add a warning..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newWarningInput.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      warnings: [...prev.warnings, newWarningInput.trim()],
                    }));
                    setNewWarningInput('');
                  }
                }}
                className="rounded-lg bg-yellow-100 px-4 py-2 text-yellow-700 hover:bg-yellow-200 font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {step === 'basic' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Library Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Full Body Strength Training"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what this library contains and who it's for..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Thumbnail Upload */}
      {step === 'thumbnail' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900">
              {thumbnail ? thumbnail.name : 'Click or drag to upload thumbnail'}
            </p>
            <p className="text-xs text-gray-600 mt-1">Image must be larger than 2MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </div>

          {thumbnailError && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{thumbnailError}</p>
            </div>
          )}

          {thumbnail && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-600">Selected file:</p>
              <p className="font-medium text-gray-900">
                {thumbnail.name} ({(thumbnail.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 3: Additional Details */}
      {step === 'details' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6 max-h-[60vh] overflow-y-auto"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (in cents) - Leave 0 for free
            </label>
            <input
              type="number"
              name="priceInCents"
              value={formData.priceInCents}
              onChange={handleInputChange}
              min="0"
              step="100"
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-600">
              Price shown to students: ${(formData.priceInCents / 100).toFixed(2)}
            </p>
          </div>

          {/* Guidelines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guidelines & Instructions (Optional)
            </label>
            <div className="space-y-2">
              {formData.guidelines.map((guideline, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                  <span className="flex-1 text-sm text-gray-700">{guideline}</span>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        guidelines: prev.guidelines.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGuidelineInput}
                  onChange={(e) => setNewGuidelineInput(e.target.value)}
                  placeholder="Add a guideline..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newGuidelineInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        guidelines: [...prev.guidelines, newGuidelineInput.trim()],
                      }));
                      setNewGuidelineInput('');
                    }
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (newGuidelineInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        guidelines: [...prev.guidelines, newGuidelineInput.trim()],
                      }));
                      setNewGuidelineInput('');
                    }
                  }}
                  className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white font-medium hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites (Optional)
            </label>
            <div className="space-y-2">
              {formData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                  <span className="flex-1 text-sm text-gray-700">{prerequisite}</span>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        prerequisites: prev.prerequisites.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrerequisiteInput}
                  onChange={(e) => setNewPrerequisiteInput(e.target.value)}
                  placeholder="Add a prerequisite..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newPrerequisiteInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        prerequisites: [...prev.prerequisites, newPrerequisiteInput.trim()],
                      }));
                      setNewPrerequisiteInput('');
                    }
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (newPrerequisiteInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        prerequisites: [...prev.prerequisites, newPrerequisiteInput.trim()],
                      }));
                      setNewPrerequisiteInput('');
                    }
                  }}
                  className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white font-medium hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warnings & Disclaimers (Optional)
            </label>
            <div className="space-y-2">
              {formData.warnings.map((warning, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 border border-yellow-200">
                  <span className="flex-1 text-sm text-yellow-900">{warning}</span>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        warnings: prev.warnings.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-yellow-700 hover:text-yellow-800 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWarningInput}
                  onChange={(e) => setNewWarningInput(e.target.value)}
                  placeholder="Add a warning or disclaimer..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newWarningInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        warnings: [...prev.warnings, newWarningInput.trim()],
                      }));
                      setNewWarningInput('');
                    }
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (newWarningInput.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        warnings: [...prev.warnings, newWarningInput.trim()],
                      }));
                      setNewWarningInput('');
                    }
                  }}
                  className="rounded-lg bg-yellow-500 px-3 py-2 text-sm text-white font-medium hover:bg-yellow-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              {videoIds.length > 0
                ? `✓ ${videoIds.length} video${videoIds.length !== 1 ? 's' : ''} will be added to this library`
                : 'Note: You can add videos after creating the library'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Step 4: Confirmation */}
      {step === 'confirm' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4 max-h-[60vh] overflow-y-auto"
        >
          <div className="rounded-lg bg-gray-50 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Library Name:</span>
              <span className="font-medium text-gray-900">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Category:</span>
              <span className="font-medium text-gray-900">{formData.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Difficulty:</span>
              <span className="font-medium text-gray-900">{formData.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="font-medium text-gray-900">
                ${(formData.priceInCents / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Initial Videos:</span>
              <span className="font-medium text-gray-900">
                {videoIds.length > 0 ? `${videoIds.length} videos` : 'Add later'}
              </span>
            </div>
          </div>

          {formData.guidelines.length > 0 && (
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-900 mb-2">Guidelines ({formData.guidelines.length}):</p>
              <ul className="space-y-1">
                {formData.guidelines.map((guideline, index) => (
                  <li key={index} className="text-xs text-blue-800">• {guideline}</li>
                ))}
              </ul>
            </div>
          )}

          {formData.prerequisites.length > 0 && (
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-xs font-medium text-purple-900 mb-2">Prerequisites ({formData.prerequisites.length}):</p>
              <ul className="space-y-1">
                {formData.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="text-xs text-purple-800">• {prerequisite}</li>
                ))}
              </ul>
            </div>
          )}

          {formData.warnings.length > 0 && (
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-xs font-medium text-yellow-900 mb-2">Warnings & Disclaimers ({formData.warnings.length}):</p>
              <ul className="space-y-1">
                {formData.warnings.map((warning, index) => (
                  <li key={index} className="text-xs text-yellow-800">⚠️ {warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              Your library will be created as a draft. You can publish it once you're satisfied with the content.
            </p>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={isEditing ? onCancel : (step === 'basic' ? onCancel : handleBack)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Cancel
        </button>

        {step === 'confirm' ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Library' : 'Create Library')}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </motion.div>
  );
}
