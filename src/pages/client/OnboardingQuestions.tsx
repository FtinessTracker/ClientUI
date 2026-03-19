import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, SkipForward, Dumbbell } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Question {
  id: string;
  question: string;
  subtitle?: string;
  type: 'single' | 'multi';
  options: { label: string; icon?: string; value: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'primary_goal',
    question: 'What is your primary fitness goal?',
    subtitle: 'We\'ll match you with trainers who specialize in your goal.',
    type: 'single',
    options: [
      { label: 'Lose Weight', icon: '🔥', value: 'lose_weight' },
      { label: 'Build Muscle', icon: '💪', value: 'build_muscle' },
      { label: 'Improve Endurance', icon: '🏃', value: 'endurance' },
      { label: 'Increase Flexibility', icon: '🧘', value: 'flexibility' },
      { label: 'Stress Relief', icon: '🧠', value: 'stress_relief' },
      { label: 'General Fitness', icon: '⚡', value: 'general' },
    ],
  },
  {
    id: 'experience_level',
    question: 'What is your current fitness level?',
    subtitle: 'Be honest — your trainer will tailor sessions to your level.',
    type: 'single',
    options: [
      { label: 'Beginner', icon: '🌱', value: 'beginner' },
      { label: 'Intermediate', icon: '🌿', value: 'intermediate' },
      { label: 'Advanced', icon: '🌳', value: 'advanced' },
      { label: 'Athlete', icon: '🏆', value: 'athlete' },
    ],
  },
  {
    id: 'preferred_time',
    question: 'When do you prefer to train?',
    subtitle: 'We\'ll show you trainers available during your preferred time.',
    type: 'multi',
    options: [
      { label: 'Early Morning', icon: '🌅', value: 'early_morning' },
      { label: 'Morning', icon: '☀️', value: 'morning' },
      { label: 'Afternoon', icon: '🌤', value: 'afternoon' },
      { label: 'Evening', icon: '🌇', value: 'evening' },
      { label: 'Late Night', icon: '🌙', value: 'late_night' },
    ],
  },
  {
    id: 'session_type',
    question: 'How would you like to train?',
    subtitle: 'You can always change this per session.',
    type: 'single',
    options: [
      { label: 'Live Video (Virtual)', icon: '🎥', value: 'virtual' },
      { label: 'In-Person', icon: '🏋️', value: 'in_person' },
      { label: 'Both work for me', icon: '✅', value: 'both' },
    ],
  },
  {
    id: 'health_conditions',
    question: 'Any health conditions we should know about?',
    subtitle: 'This helps match you with the right specialist. Select all that apply.',
    type: 'multi',
    options: [
      { label: 'No conditions', icon: '✅', value: 'none' },
      { label: 'Back / Spine issues', icon: '🦴', value: 'back' },
      { label: 'Knee / Joint issues', icon: '🦵', value: 'joint' },
      { label: 'Heart / Cardio concerns', icon: '❤️', value: 'heart' },
      { label: 'Pregnancy / Postpartum', icon: '🤰', value: 'pregnancy' },
      { label: 'Other', icon: '📋', value: 'other' },
    ],
  },
];

export default function OnboardingQuestions() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [direction, setDirection] = useState(1);

  const question = QUESTIONS[currentIndex];
  const selected = answers[question.id] || [];
  const isLast = currentIndex === QUESTIONS.length - 1;
  const canProceed = selected.length > 0;

  function toggleOption(value: string) {
    const current = answers[question.id] || [];
    if (question.type === 'single') {
      setAnswers({ ...answers, [question.id]: [value] });
    } else {
      if (current.includes(value)) {
        setAnswers({ ...answers, [question.id]: current.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [question.id]: [...current, value] });
      }
    }
  }

  function handleNext() {
    if (isLast) {
      navigate('/dashboard');
    } else {
      setDirection(1);
      setCurrentIndex(i => i + 1);
    }
  }

  function handleBack() {
    setDirection(-1);
    setCurrentIndex(i => i - 1);
  }

  function handleSkip() {
    navigate('/dashboard');
  }

  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 p-2 rounded-xl">
            <Dumbbell className="text-accent w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-tighter text-slate-900">FlexFit</span>
        </div>
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          Skip for now
        </button>
      </div>

      <div className="h-1 bg-slate-100">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
              {currentIndex + 1} of {QUESTIONS.length}
            </span>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {question.question}
              </h2>
              {question.subtitle && (
                <p className="text-slate-400 font-medium mb-8">{question.subtitle}</p>
              )}

              <div className={`grid gap-3 ${question.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {question.options.map(option => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={`
                        relative flex flex-col items-start gap-2 p-5 rounded-2xl border-2 text-left
                        transition-all duration-200 hover:-translate-y-0.5
                        ${isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/15'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {option.icon && (
                        <span className="text-2xl">{option.icon}</span>
                      )}
                      <span className={`font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="rounded-full px-8 h-12 font-bold shadow-xl shadow-slate-900/15 group"
            >
              {isLast ? 'Get Started' : 'Continue'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
