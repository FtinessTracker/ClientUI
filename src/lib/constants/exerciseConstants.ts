// Exercise and video metadata constants matching backend enums

export const MODALITY = [
  'STRENGTH',
  'MOBILITY',
  'FLEXIBILITY',
  'CARDIO',
  'PLYOMETRIC',
  'BALANCE',
  'ENDURANCE',
  'REHAB'
] as const;

export const MUSCLE_GROUPS = [
  'CHEST',
  'TRICEPS',
  'QUADS',
  'GLUTES',
  'HAMSTRINGS',
  'BACK',
  'BICEPS',
  'SHOULDERS',
  'CORE',
  'CALVES',
  'HIP_GROIN',
  'FOREARMS',
  'FULL_BODY'
] as const;

export const MOVEMENT_PATTERNS = [
  'PUSH',
  'PULL',
  'SQUAT',
  'HINGE',
  'LUNGE',
  'CARRY',
  'ROTATION',
  'FULL_BODY',
  'CARDIO',
  'ISOMETRIC'
] as const;

export const EQUIPMENT = [
  'DUMBBELL',
  'BARBELL',
  'KETTLEBELL',
  'RESISTANCE_BAND',
  'CABLE',
  'MACHINE',
  'BODYWEIGHT',
  'FOAM_ROLLER',
  'MEDICINE_BALL'
] as const;

export const DIFFICULTY = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED'
] as const;

export const EXERCISE_TYPE = [
  'REPS',
  'TIMED'
] as const;

export const VIDEO_CATEGORY = [
  'YOGA',
  'HIIT',
  'STRENGTH',
  'CARDIO',
  'STRETCHING',
  'NUTRITION',
  'MEDITATION',
  'OTHER'
] as const;

// Display names/labels for better UI
export const MODALITY_LABELS: Record<typeof MODALITY[number], string> = {
  STRENGTH: 'Strength',
  MOBILITY: 'Mobility',
  FLEXIBILITY: 'Flexibility',
  CARDIO: 'Cardio',
  PLYOMETRIC: 'Plyometric',
  BALANCE: 'Balance',
  ENDURANCE: 'Endurance',
  REHAB: 'Rehabilitation'
};

export const MUSCLE_GROUP_LABELS: Record<typeof MUSCLE_GROUPS[number], string> = {
  CHEST: 'Chest',
  TRICEPS: 'Triceps',
  QUADS: 'Quadriceps',
  GLUTES: 'Glutes',
  HAMSTRINGS: 'Hamstrings',
  BACK: 'Back',
  BICEPS: 'Biceps',
  SHOULDERS: 'Shoulders',
  CORE: 'Core',
  CALVES: 'Calves',
  HIP_GROIN: 'Hips/Groin',
  FOREARMS: 'Forearms',
  FULL_BODY: 'Full Body'
};

export const MOVEMENT_PATTERN_LABELS: Record<typeof MOVEMENT_PATTERNS[number], string> = {
  PUSH: 'Push',
  PULL: 'Pull',
  SQUAT: 'Squat',
  HINGE: 'Hinge',
  LUNGE: 'Lunge',
  CARRY: 'Carry',
  ROTATION: 'Rotation',
  FULL_BODY: 'Full Body',
  CARDIO: 'Cardio',
  ISOMETRIC: 'Isometric'
};

export const EQUIPMENT_LABELS: Record<typeof EQUIPMENT[number], string> = {
  DUMBBELL: 'Dumbbell',
  BARBELL: 'Barbell',
  KETTLEBELL: 'Kettlebell',
  RESISTANCE_BAND: 'Resistance Band',
  CABLE: 'Cable Machine',
  MACHINE: 'Machine',
  BODYWEIGHT: 'Bodyweight',
  FOAM_ROLLER: 'Foam Roller',
  MEDICINE_BALL: 'Medicine Ball'
};

export const DIFFICULTY_LABELS: Record<typeof DIFFICULTY[number], string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
};

export const DIFFICULTY_COLORS: Record<typeof DIFFICULTY[number], string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-red-100 text-red-800'
};
