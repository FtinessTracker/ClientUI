import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, ChevronRight, Check, X, Heart, CircleAlert as AlertCircle, Stethoscope, Activity, Zap, Brain } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface ParQQuestion {
  id: string;
  section: string;
  question: string;
  detail?: string;
  icon: React.ElementType;
}

const PARQ_QUESTIONS: ParQQuestion[] = [
  {
    id: 'heart_condition',
    section: 'Cardiovascular',
    question: 'Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
    icon: Heart,
  },
  {
    id: 'chest_pain_activity',
    section: 'Cardiovascular',
    question: 'Do you feel pain in your chest when you do physical activity?',
    icon: Activity,
  },
  {
    id: 'chest_pain_rest',
    section: 'Cardiovascular',
    question: 'In the past month, have you had chest pain when you were not doing physical activity?',
    icon: Heart,
  },
  {
    id: 'dizziness',
    section: 'Balance & Coordination',
    question: 'Do you lose your balance because of dizziness, or do you ever lose consciousness?',
    icon: Brain,
  },
  {
    id: 'bone_joint',
    section: 'Musculoskeletal',
    question: 'Do you have a bone or joint problem (for example, back, knee, or hip) that could be made worse by a change in your physical activity?',
    icon: Zap,
  },
  {
    id: 'blood_pressure_medication',
    section: 'Medication',
    question: 'Is your doctor currently prescribing drugs (for example, water pills) for your blood pressure or heart condition?',
    icon: Stethoscope,
  },
  {
    id: 'other_reason',
    section: 'General Health',
    question: 'Do you know of any other reason why you should not do physical activity?',
    detail: 'This includes any chronic illness, condition, or recent surgery not covered above.',
    icon: AlertCircle,
  },
];

const SECTION_COLORS: Record<string, string> = {
  'Cardiovascular': 'text-rose-500 bg-rose-50',
  'Balance & Coordination': 'text-blue-500 bg-blue-50',
  'Musculoskeletal': 'text-amber-500 bg-amber-50',
  'Medication': 'text-emerald-500 bg-emerald-50',
  'General Health': 'text-slate-500 bg-slate-100',
};

export default function OnboardingQuestions() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === PARQ_QUESTIONS.length;
  const hasYes = Object.values(answers).some(v => v === true);

  function setAnswer(id: string, value: boolean) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function handleDone() {
    navigate('/calendar');
  }

  function handleSkip() {
    navigate('/calendar');
  }

  const progress = (answeredCount / PARQ_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 p-1.5 rounded-xl">
              <Dumbbell className="text-accent w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900">FlexFit</span>
          </div>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
          >
            Skip for now
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="h-0.5 bg-slate-100">
          <motion.div
            className="h-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full mb-4">
            <Heart className="w-3 h-3" />
            PAR-Q+ Health Screening
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Before we get started
          </h1>
          <p className="text-slate-500 text-base font-medium leading-relaxed max-w-xl">
            The Physical Activity Readiness Questionnaire (PAR-Q+) helps ensure your safety during exercise. Please answer all questions honestly. This takes less than 2 minutes.
          </p>
        </motion.div>

        <div className="space-y-3 mb-8">
          {PARQ_QUESTIONS.map((q, i) => {
            const answered = q.id in answers;
            const value = answers[q.id];
            const Icon = q.icon;
            const sectionStyle = SECTION_COLORS[q.section] || 'text-slate-500 bg-slate-100';

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'bg-white rounded-2xl border transition-all duration-200',
                  answered
                    ? value === true
                      ? 'border-rose-200 shadow-sm shadow-rose-100/50'
                      : 'border-emerald-200 shadow-sm shadow-emerald-100/50'
                    : 'border-slate-100 shadow-sm hover:border-slate-200'
                )}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn('flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full', sectionStyle)}>
                          <Icon className="w-3 h-3" />
                          {q.section}
                        </div>
                        <span className="text-xs font-bold text-slate-300">Q{i + 1}</span>
                      </div>
                      <p className="text-slate-800 font-semibold text-sm sm:text-base leading-relaxed mb-1">
                        {q.question}
                      </p>
                      {q.detail && (
                        <p className="text-slate-400 text-xs font-medium mt-1.5 leading-relaxed">{q.detail}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setAnswer(q.id, true)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border-2 font-bold text-sm transition-all duration-150',
                        value === true
                          ? 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
                      )}
                    >
                      <Check className="w-4 h-4" />
                      Yes
                    </button>
                    <button
                      onClick={() => setAnswer(q.id, false)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border-2 font-bold text-sm transition-all duration-150',
                        value === false
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                      )}
                    >
                      <X className="w-4 h-4" />
                      No
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {hasYes && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex gap-4"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm mb-1">Medical clearance recommended</p>
              <p className="text-amber-700 text-xs font-medium leading-relaxed">
                You answered "Yes" to one or more questions. We recommend consulting with your doctor before starting a new physical activity program. Your trainer will also be informed to tailor sessions appropriately.
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 pb-10"
        >
          <Button
            onClick={handleDone}
            disabled={!allAnswered}
            className="w-full sm:w-auto rounded-xl h-12 px-8 font-bold shadow-lg shadow-slate-900/15 gap-2 disabled:opacity-40"
          >
            Done — Take me to my calendar
            <ChevronRight className="w-4 h-4" />
          </Button>
          <button
            onClick={handleSkip}
            className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip and answer later
          </button>
        </motion.div>

        <div className="flex items-center justify-between text-xs font-medium text-slate-400 pb-6">
          <span>{answeredCount} of {PARQ_QUESTIONS.length} answered</span>
          <span>Your answers are confidential and secure.</span>
        </div>
      </main>
    </div>
  );
}
