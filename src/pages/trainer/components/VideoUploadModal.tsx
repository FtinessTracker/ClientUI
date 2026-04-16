import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, AlertCircle, FileVideo, Clock, Maximize2, Database, CheckCircle, Zap, Eye, Lock, ChevronDown,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import { fileService, FileMetadata } from '../../../services/fileService';

const VIDEO_CATEGORIES = [
  { value: 'strength', label: 'Strength Training' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'core', label: 'Core' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'stretching', label: 'Stretching' },
  { value: 'recovery', label: 'Recovery' },
] as const;

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (metadata: FileMetadata & { file: File }) => Promise<void>;
  isLoading?: boolean;
  uploadProgress?: number;
}

export default function VideoUploadModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  uploadProgress = 0,
}: VideoUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState({
    name: '',
    duration: 0,
    resolution: '',
    format: '',
    thumbnail: '',
  });
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  const [category, setCategory] = useState<string>('strength');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'uploading'>('select');
  const [localProgress, setLocalProgress] = useState(0);

  const resetForm = () => {
    setSelectedFile(null);
    setVideoMetadata({ name: '', duration: 0, resolution: '', format: '', thumbnail: '' });
    setVisibility('PRIVATE');
    setCategory('strength');
    setError('');
    setStep('select');
    setLocalProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const extractVideoMetadata = async (file: File) => {
    try {
      setError('');

      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size must be less than 100MB');
        return;
      }

      // Create video element to extract metadata
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          const duration = Math.round(video.duration);
          const width = video.videoWidth;
          const height = video.videoHeight;
          const resolution = `${width}x${height}`;
          const format = file.type.split('/')[1]?.toUpperCase() || 'VIDEO';

          // Generate thumbnail
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const thumbnail = canvas.toDataURL('image/jpeg');

            setVideoMetadata({
              name: file.name,
              duration,
              resolution,
              format,
              thumbnail,
            });

            setSelectedFile(file);
            setStep('details');
            resolve();
          }
        };

        video.onerror = () => {
          reject(new Error('Failed to load video metadata'));
        };

        video.src = URL.createObjectURL(file);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read video file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      extractVideoMetadata(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      extractVideoMetadata(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !videoMetadata.name.trim()) {
      setError('Please enter a video name');
      return;
    }

    setStep('uploading');
    setLocalProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setLocalProgress((prev) => {
        if (prev < 90) {
          return prev + Math.random() * 30;
        }
        return prev;
      });
    }, 500);

    try {
      const mimeType = fileService.getMimeType(selectedFile.name);
      const mediaType = fileService.getMediaType(mimeType);

      await onSubmit({
        file: selectedFile,
        fileName: videoMetadata.name,
        contentType: mimeType,
        size: selectedFile.size,
        mediaType: mediaType as 'VIDEO',
        resolution: videoMetadata.resolution !== '0x0' ? videoMetadata.resolution : undefined,
        durationInSeconds: videoMetadata.duration || undefined,
        visibility,
        category,
        name: videoMetadata.name,
      } as any);

      clearInterval(progressInterval);
      setLocalProgress(100);

      // Wait a moment to show success state
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setStep('details');
    }
  };

  const displayProgress = uploadProgress || localProgress;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-7 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Upload Video
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-7">
                {/* Step 1: Select File */}
                {step === 'select' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Drag and Drop Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
                        isDragging
                          ? 'border-accent bg-accent/5'
                          : 'border-slate-300 hover:border-accent hover:bg-accent/5'
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                          <Upload className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">
                            {isDragging ? 'Drop your video here' : 'Drop your video here'}
                          </p>
                          <p className="text-sm text-slate-400 font-medium mt-1">
                            or click to browse (Max 100MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-sm font-bold text-red-700">{error}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Details */}
                {step === 'details' && selectedFile && videoMetadata.thumbnail && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Video Name */}
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Video Name
                      </label>
                      <Input
                        type="text"
                        value={videoMetadata.name}
                        onChange={(e) =>
                          setVideoMetadata({ ...videoMetadata, name: e.target.value })
                        }
                        placeholder="Enter video name"
                        className="h-11 rounded-xl border-slate-200"
                      />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-11 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                        >
                          {VIDEO_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Privacy Toggle */}
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        Privacy
                      </label>
                      <div className="flex gap-3">
                        {(['PRIVATE', 'PUBLIC'] as const).map((vis) => (
                          <button
                            key={vis}
                            onClick={() => setVisibility(vis)}
                            className={cn(
                              'flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2',
                              visibility === vis
                                ? 'bg-accent text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                          >
                            {vis === 'PRIVATE' ? (
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
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="rounded-2xl border-slate-200 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Duration
                              </p>
                              <p className="text-sm font-black text-slate-900">
                                {fileService.formatDuration(videoMetadata.duration)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-slate-200 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Maximize2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Resolution
                              </p>
                              <p className="text-sm font-black text-slate-900">
                                {videoMetadata.resolution}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-slate-200 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <Database className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                File Size
                              </p>
                              <p className="text-sm font-black text-slate-900">
                                {fileService.formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-slate-200 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <FileVideo className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Format
                              </p>
                              <p className="text-sm font-black text-slate-900">
                                {videoMetadata.format}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-sm font-bold text-red-700">{error}</p>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => resetForm()}
                        className="rounded-xl font-bold h-12 border-slate-200"
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!videoMetadata.name.trim() || isLoading}
                        isLoading={isLoading}
                        className="flex-1 rounded-xl font-bold h-12"
                      >
                        Upload Video
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Uploading */}
                {step === 'uploading' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-12 space-y-6"
                  >
                    {displayProgress === 100 ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="relative w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center"
                        >
                          <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </motion.div>
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-black text-slate-900">Upload Complete!</h3>
                          <p className="text-sm text-slate-400 font-medium">
                            Your video has been uploaded successfully
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border-4 border-accent/20">
                          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-3xl font-black text-accent">
                                {Math.round(displayProgress)}
                              </p>
                              <p className="text-xs font-bold text-slate-400">%</p>
                            </div>
                          </div>

                          {/* Circular Progress */}
                          <svg
                            className="absolute inset-0 w-full h-full transform -rotate-90"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.2))' }}
                          >
                            <circle
                              cx="50%"
                              cy="50%"
                              r="48%"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="6"
                              className="text-slate-200"
                            />
                            <motion.circle
                              cx="50%"
                              cy="50%"
                              r="48%"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="6"
                              strokeDasharray={`${2 * Math.PI * 48}`}
                              strokeDashoffset={`${2 * Math.PI * 48 * (1 - displayProgress / 100)}`}
                              strokeLinecap="round"
                              className="text-accent transition-all"
                            />
                          </svg>
                        </div>

                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-black text-slate-900">Uploading...</h3>
                          <p className="text-sm text-slate-400 font-medium">
                            {fileService.formatFileSize(
                              Math.round((selectedFile?.size || 0) * (displayProgress / 100))
                            )}
                            {' '}
                            /
                            {' '}
                            {fileService.formatFileSize(selectedFile?.size || 0)}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            Please don't close this window
                          </p>
                        </div>

                        {/* Speed Indicator */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
                          <Zap className="w-4 h-4 text-accent" />
                          <span className="text-xs font-bold text-slate-600">
                            Uploading to cloud storage...
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
