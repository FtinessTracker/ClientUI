import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronRight, Heart, Activity, TriangleAlert as AlertTriangle, ShieldCheck, ClipboardList, Stethoscope, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface QuestionAnswer {
  value: boolean | null;
  detail?: string;
  subChecks?: Record<string, boolean>;
}

type Answers = Record<string, QuestionAnswer>;

const HEART_CONDITIONS = [
  { id: 'heart_condition', label: 'Heart condition' },
  { id: 'high_blood_pressure', label: 'High blood pressure' },
];

interface QuestionDef {
  id: string;
  number: number;
  question: string;
  note?: string;
  listLabel?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    number: 1,
    question: 'Has your doctor ever said that you have a heart condition OR high blood pressure?',
    icon: Heart,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
  },
  {
    id: 'q2',
    number: 2,
    question: 'Do you feel pain in your chest at rest, during your daily activities of living, OR when you do physical activity?',
    icon: Activity,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    id: 'q3',
    number: 3,
    question: 'Do you lose balance because of dizziness OR have you lost consciousness in the last 12 months?',
    note: 'Please answer NO if your dizziness was associated with over-breathing (including during vigorous exercise).',
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    id: 'q4',
    number: 4,
    question: 'Have you ever been diagnosed with another chronic medical condition (other than heart disease or high blood pressure)?',
    listLabel: 'PLEASE LIST CONDITION(S) HERE:',
    icon: ClipboardList,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    id: 'q5',
    number: 5,
    question: 'Are you currently taking prescribed medications for a chronic medical condition?',
    listLabel: 'PLEASE LIST CONDITION(S) AND MEDICATIONS HERE:',
    icon: Stethoscope,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-500',
  },
  {
    id: 'q6',
    number: 6,
    question: 'Do you currently have (or have had within the past 12 months) a bone, joint, or soft tissue (muscle, ligament, or tendon) problem that could be made worse by becoming more physically active?',
    note: 'Please answer NO if you had a problem in the past, but it does not limit your current ability to be physically active.',
    listLabel: 'PLEASE LIST CONDITION(S) HERE:',
    icon: ShieldCheck,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
  },
  {
    id: 'q7',
    number: 7,
    question: 'Has your doctor ever said that you should only do medically supervised physical activity?',
    icon: UserCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
];

function RadioButton({
  label,
  selected,
  variant,
  onClick,
}: {
  label: 'Yes' | 'No';
  selected: boolean;
  variant: 'yes' | 'no';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 select-none',
        selected && variant === 'yes'
          ? 'border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-200'
          : selected && variant === 'no'
            ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      <span
        className={cn(
          'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          selected && variant === 'yes'
            ? 'border-white bg-white'
            : selected && variant === 'no'
              ? 'border-white bg-white'
              : 'border-slate-300 bg-white'
        )}
      >
        {selected && (
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              variant === 'yes' ? 'bg-rose-500' : 'bg-emerald-500'
            )}
          />
        )}
      </span>
      {label}
    </button>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <span
        onClick={() => onChange(!checked)}
        className={cn(
          'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150',
          checked
            ? 'border-rose-500 bg-rose-500'
            : 'border-slate-300 bg-white group-hover:border-rose-300'
        )}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
    </label>
  );
}

export default function OnboardingQuestions() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answers>({});

  const answeredCount = Object.values(answers).filter(a => a.value !== null).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const hasYes = Object.values(answers).some(a => a.value === true);

  function setYesNo(id: string, value: boolean) {
    setAnswers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        value,
        subChecks: value ? prev[id]?.subChecks : undefined,
        detail: value ? prev[id]?.detail : undefined,
      },
    }));
  }

  function setDetail(id: string, text: string) {
    setAnswers(prev => ({
      ...prev,
      [id]: { ...prev[id], detail: text },
    }));
  }

  function setSubCheck(id: string, checkId: string, checked: boolean) {
    setAnswers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        subChecks: { ...prev[id]?.subChecks, [checkId]: checked },
      },
    }));
  }

  const progress = (answeredCount / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 p-1.5 rounded-xl">
              <Dumbbell className="text-accent w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900">FlexFit</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              {answeredCount}/{QUESTIONS.length} answered
            </span>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-1"
            >
              Skip
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] bg-slate-100">
          <motion.div
            className="h-full bg-gradient-to-r from-slate-700 to-slate-900"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 pb-16">
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-5">
            <Heart className="w-3 h-3" />
            Health Screening Required
          </div>
          <h1 className="text-3xl sm:text-[2.1rem] font-black text-slate-900 tracking-tight leading-tight mb-2">
            PAR-Q+
          </h1>
          <p className="text-base font-semibold text-slate-700 mb-2">
            The Physical Activity Readiness Questionnaire for Everyone
          </p>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-lg">
            Please read each question carefully and answer honestly. This information helps ensure your safety and allows your trainer to personalise your programme appropriately.
          </p>
        </motion.div>

        {/* Questions */}
        <div className="space-y-4 mb-8">
          {QUESTIONS.map((q, i) => {
            const ans = answers[q.id];
            const answered = ans?.value !== undefined && ans?.value !== null;
            const isYes = ans?.value === true;
            const isNo = ans?.value === false;
            const Icon = q.icon;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.055, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'bg-white rounded-2xl border transition-all duration-300',
                  answered && isYes
                    ? 'border-rose-200 shadow-sm'
                    : answered && isNo
                      ? 'border-emerald-200 shadow-sm'
                      : 'border-slate-200/80 shadow-sm hover:border-slate-300'
                )}
              >
                <div className="p-6">
                  {/* Question header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5', q.iconBg)}>
                      <Icon className={cn('w-4.5 h-4.5', q.iconColor)} style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest">
                          Question {q.number}
                        </span>
                        {answered && (
                          <span className={cn(
                            'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                            isYes ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
                          )}>
                            {isYes ? 'Yes' : 'No'}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-semibold text-[14.5px] leading-relaxed">
                        {q.question}
                      </p>
                      {q.note && (
                        <p className="text-slate-400 text-[12.5px] font-medium mt-2 leading-relaxed pl-3 border-l-2 border-slate-200">
                          {q.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Radio buttons */}
                  <div className="flex items-center gap-3 ml-14">
                    <RadioButton
                      label="Yes"
                      variant="yes"
                      selected={isYes}
                      onClick={() => setYesNo(q.id, true)}
                    />
                    <RadioButton
                      label="No"
                      variant="no"
                      selected={isNo}
                      onClick={() => setYesNo(q.id, false)}
                    />
                  </div>

                  {/* Q1 only: conditional checkboxes */}
                  <AnimatePresence>
                    {q.id === 'q1' && isYes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-14 bg-rose-50/60 border border-rose-100 rounded-xl p-4">
                          <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3">
                            Please select all that apply:
                          </p>
                          <div className="space-y-2.5">
                            {HEART_CONDITIONS.map(c => (
                              <Checkbox
                                key={c.id}
                                label={c.label}
                                checked={!!ans?.subChecks?.[c.id]}
                                onChange={v => setSubCheck(q.id, c.id, v)}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Questions with listLabel: show textarea when Yes */}
                  <AnimatePresence>
                    {q.listLabel && isYes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-14">
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            {q.listLabel}
                          </label>
                          <textarea
                            value={ans?.detail || ''}
                            onChange={e => setDetail(q.id, e.target.value)}
                            placeholder="Please describe your condition(s) here…"
                            rows={3}
                            className={cn(
                              'w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3',
                              'text-sm font-medium text-slate-800 placeholder:text-slate-300',
                              'focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400',
                              'transition-colors duration-150 leading-relaxed'
                            )}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Warning banner */}
        <AnimatePresence>
          {hasYes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4"
            >
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-sm mb-1">Medical clearance recommended</p>
                <p className="text-amber-700 text-[13px] font-medium leading-relaxed">
                  You have answered "Yes" to one or more questions. We recommend consulting your doctor before starting or changing your physical activity programme. Your trainer will also review your responses to tailor sessions appropriately.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={() => navigate('/calendar')}
            disabled={!allAnswered}
            className={cn(
              'w-full sm:w-auto rounded-xl h-12 px-8 font-bold gap-2',
              'shadow-lg shadow-slate-900/10 disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            Continue to Calendar
            <ChevronRight className="w-4 h-4" />
          </Button>
          <button
            onClick={() => navigate('/calendar')}
            className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip and answer later
          </button>
        </div>

        <p className="text-xs text-slate-400 font-medium mt-6 text-center">
          Your answers are kept strictly confidential and used only for safety assessment purposes.
        </p>
      </main>
    </div>
  );
}
