import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, SkipForward, Dumbbell, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Question {
  id: string;
  question: string;
  description?: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'has_trained_before',
    question: 'Have you worked with a personal trainer before?',
    description: "This helps us set the right expectations for your first session.",
  },
  {
    id: 'has_specific_goal',
    question: 'Do you have a specific fitness goal in mind?',
    description: "We'll make sure your trainer focuses on what matters most to you.",
  },
  {
    id: 'has_health_conditions',
    question: 'Do you have any injuries or health conditions we should know about?',
    description: "Your safety is our priority. We'll match you with a specialist if needed.",
  },
  {
    id: 'has_equipment',
    question: 'Do you have any workout equipment at home?',
    description: "Weights, resistance bands, a yoga mat — anything counts.",
  },
  {
    id: 'has_dietary_restrictions',
    question: 'Do you follow any specific diet or have nutritional restrictions?',
    description: "Some of our trainers also offer nutrition coaching alongside sessions.",
  },
  {
    id: 'wants_regular_schedule',
    question: 'Are you looking to train on a regular weekly schedule?',
    description: "Consistency is key — we can help you find a trainer who matches your routine.",
  },
];

export default function OnboardingQuestions() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState(1);
  const [completing, setCompleting] = useState(false);

  const question = QUESTIONS[currentIndex];
  const answered = question.id in answers;
  const isLast = currentIndex === QUESTIONS.length - 1;
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  function selectAnswer(value: boolean) {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  }

  function handleNext() {
    if (isLast) {
      setCompleting(true);
      setTimeout(() => navigate('/calendar'), 400);
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
    navigate('/calendar');
  }

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
        <div className="w-full max-w-lg">
          <div className="mb-4">
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
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3 leading-tight">
                {question.question}
              </h2>
              {question.description && (
                <p className="text-slate-400 font-medium mb-10 text-base leading-relaxed">
                  {question.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => selectAnswer(true)}
                  className={`
                    group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2
                    transition-all duration-200 hover:-translate-y-0.5
                    ${answers[question.id] === true
                      ? 'border-emerald-500 bg-emerald-500 shadow-xl shadow-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-lg'
                    }
                  `}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    answers[question.id] === true
                      ? 'bg-white/20'
                      : 'bg-emerald-50 group-hover:bg-emerald-100'
                  }`}>
                    <Check className={`w-7 h-7 ${answers[question.id] === true ? 'text-white' : 'text-emerald-500'}`} />
                  </div>
                  <span className={`text-lg font-black tracking-tight ${
                    answers[question.id] === true ? 'text-white' : 'text-slate-800'
                  }`}>
                    Yes
                  </span>
                </button>

                <button
                  onClick={() => selectAnswer(false)}
                  className={`
                    group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2
                    transition-all duration-200 hover:-translate-y-0.5
                    ${answers[question.id] === false
                      ? 'border-slate-800 bg-slate-900 shadow-xl shadow-slate-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-lg'
                    }
                  `}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    answers[question.id] === false
                      ? 'bg-white/10'
                      : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}>
                    <X className={`w-7 h-7 ${answers[question.id] === false ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-lg font-black tracking-tight ${
                    answers[question.id] === false ? 'text-white' : 'text-slate-800'
                  }`}>
                    No
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12">
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
              disabled={!answered || completing}
              className="rounded-full px-8 h-12 font-bold shadow-xl shadow-slate-900/15 group"
            >
              {isLast ? 'Get Started' : 'Next'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex justify-center gap-1.5 mt-8">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-accent' : i < currentIndex ? 'w-3 bg-accent/40' : 'w-3 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
