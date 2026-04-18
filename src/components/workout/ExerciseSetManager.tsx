import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ExerciseSet {
  setNumber: number;
  reps?: number | null;
  durationSeconds?: number | null;
  restSeconds: number;
}

interface ExerciseSetManagerProps {
  exerciseType: 'REPS' | 'TIME';
  sets: ExerciseSet[];
  onSetsChange: (sets: ExerciseSet[]) => void;
  videoName?: string;
}

export function ExerciseSetManager({
  exerciseType,
  sets,
  onSetsChange,
  videoName,
}: ExerciseSetManagerProps) {
  const [localSets, setLocalSets] = useState<ExerciseSet[]>(
    sets && sets.length > 0
      ? sets
      : [{ setNumber: 1, reps: 10, durationSeconds: null, restSeconds: 30 }]
  );

  const handleSetChange = (index: number, field: keyof ExerciseSet, value: any) => {
    const updated = [...localSets];
    if (field === 'reps' || field === 'durationSeconds' || field === 'restSeconds') {
      updated[index][field] = value ? parseInt(value) : null;
    } else {
      updated[index][field] = value;
    }
    setLocalSets(updated);
    onSetsChange(updated);
  };

  const handleAddSet = () => {
    const newSet: ExerciseSet = {
      setNumber: localSets.length + 1,
      reps: exerciseType === 'REPS' ? 10 : null,
      durationSeconds: exerciseType === 'TIME' ? 30 : null,
      restSeconds: 30,
    };
    const updated = [...localSets, newSet];
    setLocalSets(updated);
    onSetsChange(updated);
  };

  const handleRemoveSet = (index: number) => {
    if (localSets.length > 1) {
      const updated = localSets
        .filter((_, i) => i !== index)
        .map((set, i) => ({ ...set, setNumber: i + 1 }));
      setLocalSets(updated);
      onSetsChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      {videoName && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900">{videoName}</h3>
          <p className="text-xs text-gray-500 mt-1">
            Exercise Type: <span className="font-bold">{exerciseType}</span>
          </p>
        </div>
      )}

      {/* Sets Table */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 px-2 text-xs font-bold text-gray-600 uppercase">
          <div className="col-span-2">Set</div>
          {exerciseType === 'REPS' ? (
            <div className="col-span-3">Reps</div>
          ) : (
            <div className="col-span-3 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time (sec)
            </div>
          )}
          <div className="col-span-3">Rest (sec)</div>
          <div className="col-span-4"></div>
        </div>

        <AnimatePresence mode="popLayout">
          {localSets.map((set, index) => (
            <motion.div
              key={set.setNumber}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-12 gap-2 items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition"
            >
              {/* Set Number */}
              <div className="col-span-2 text-center font-bold text-gray-900">
                {set.setNumber}
              </div>

              {/* Reps or Time Input */}
              {exerciseType === 'REPS' ? (
                <div className="col-span-3">
                  <input
                    type="number"
                    min="1"
                    value={set.reps || ''}
                    onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                    placeholder="Reps"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="col-span-3">
                  <input
                    type="number"
                    min="1"
                    value={set.durationSeconds || ''}
                    onChange={(e) => handleSetChange(index, 'durationSeconds', e.target.value)}
                    placeholder="Sec"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Rest Input */}
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  value={set.restSeconds || ''}
                  onChange={(e) => handleSetChange(index, 'restSeconds', e.target.value)}
                  placeholder="Rest"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Delete Button */}
              <div className="col-span-4 flex justify-end">
                {localSets.length > 1 && (
                  <button
                    onClick={() => handleRemoveSet(index)}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                    title="Delete set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Set Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddSet}
        className="w-full py-2 px-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 font-bold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Set
      </motion.button>
    </div>
  );
}
