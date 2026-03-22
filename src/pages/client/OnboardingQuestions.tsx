import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronRight, Heart, Activity, TriangleAlert as AlertTriangle, ShieldCheck, ClipboardList, Stethoscope, UserCheck, CircleCheck as CheckCircle2, Loader as Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useAppUser } from '../../hooks/useAppUser';

interface QuestionAnswer {
  value: boolean | null;
  detail?: string;
  subChecks?: Record<string, boolean>;
}

type Answers = Record<string, QuestionAnswer>;

const HEART_CONDITIONS = [
  { id: 'Q_1', title: 'HEART_ATTACK', label: 'Heart condition' },
  { id: 'Q_2', title: 'HIGHBLOOD_PRESSURE', label: 'High blood pressure' },
];

interface QuestionDef {
  id: string;
  apiId: string;
  apiTitle: string;
  number: number;
  question: string;
  note?: string;
  listLabel?: string;
  hasComments?: boolean;
  icon: React.ElementType;
}

const QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    apiId: 'Q1',
    apiTitle: 'CDN_HRT_HBP',
    number: 1,
    question: 'Has your doctor ever said that you have a heart condition OR high blood pressure?',
    icon: Heart,
  },
  {
    id: 'q2',
    apiId: 'Q2',
    apiTitle: 'CHEST',
    number: 2,
    question: 'Do you feel pain in your chest at rest, during your daily activities of living, OR when you do physical activity?',
    icon: Activity,
  },
  {
    id: 'q3',
    apiId: 'Q3',
    apiTitle: 'DIZZINESS',
    number: 3,
    question: 'Do you lose balance because of dizziness OR have you lost consciousness in the last 12 months?',
    note: 'Please answer NO if your dizziness was associated with over-breathing (including during vigorous exercise).',
    icon: AlertTriangle,
  },
  {
    id: 'q4',
    apiId: 'Q4',
    apiTitle: 'CHRONIC_CONDITION',
    number: 4,
    question: 'Have you ever been diagnosed with another chronic medical condition (other than heart disease or high blood pressure)?',
    listLabel: 'PLEASE LIST CONDITION(S) HERE:',
    hasComments: true,
    icon: ClipboardList,
  },
  {
    id: 'q5',
    apiId: 'Q5',
    apiTitle: 'MEDICATIONS',
    number: 5,
    question: 'Are you currently taking prescribed medications for a chronic medical condition?',
    listLabel: 'PLEASE LIST CONDITION(S) AND MEDICATIONS HERE:',
    hasComments: true,
    icon: Stethoscope,
  },
  {
    id: 'q6',
    apiId: 'Q6',
    apiTitle: 'BONE_JOINT',
    number: 6,
    question: 'Do you currently have (or have had within the past 12 months) a bone, joint, or soft tissue (muscle, ligament, or tendon) problem that could be made worse by becoming more physically active?',
    note: 'Please answer NO if you had a problem in the past, but it does not limit your current ability to be physically active.',
    listLabel: 'PLEASE LIST CONDITION(S) HERE:',
    hasComments: true,
    icon: ShieldCheck,
  },
  {
    id: 'q7',
    apiId: 'Q7',
    apiTitle: 'MEDICAL_SUPERVISION',
    number: 7,
    question: 'Has your doctor ever said that you should only do medically supervised physical activity?',
    icon: UserCheck,
  },
];

function buildPayload(userId: string, answers: Answers) {
  const qstnAnswers: Array<{ questionId: string; questionTitle: string; answer: boolean; comments: string }> = [];

  for (const q of QUESTIONS) {
    const ans = answers[q.id];
    if (ans === undefined || ans.value === null) continue;

    if (q.id === 'q1') {
      qstnAnswers.push({
        questionId: q.apiId,
        questionTitle: q.apiTitle,
        answer: ans.value,
        comments: '',
      });

      if (ans.value) {
        for (const cond of HEART_CONDITIONS) {
          qstnAnswers.push({
            questionId: cond.id,
            questionTitle: cond.title,
            answer: !!ans.subChecks?.[cond.id],
            comments: '',
          });
        }
      }
    } else {
      qstnAnswers.push({
        questionId: q.apiId,
        questionTitle: q.apiTitle,
        answer: ans.value,
        comments: q.hasComments && ans.value ? (ans.detail || '') : '',
      });
    }
  }

  return { userId, qstnAnswers };
}

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 select-none',
          value === true
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
            : 'text-slate-500 hover:text-slate-700 hover:bg-white'
        )}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 select-none',
          value === false
            ? 'bg-slate-700 text-white shadow-sm shadow-slate-200'
            : 'text-slate-500 hover:text-slate-700 hover:bg-white'
        )}
      >
        No
      </button>
    </div>
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
    <label
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center gap-2.5 cursor-pointer rounded-lg px-3 py-2.5 border transition-all duration-150 select-none',
        checked
          ? 'border-blue-200 bg-blue-50 text-blue-800'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      <span
        className={cn(
          'rounded border-2 flex items-center justify-center shrink-0 transition-all',
          checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
        )}
        style={{ width: '18px', height: '18px' }}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
            <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}

export default function OnboardingQuestions() {
  const navigate = useNavigate();
  const { appUser } = useAppUser();
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const answeredCount = Object.values(answers).filter(a => a.value !== null && a.value !== undefined).length;
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
    setAnswers(prev => ({ ...prev, [id]: { ...prev[id], detail: text } }));
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

  async function handleContinue() {
    if (!allAnswered) return;
    setSubmitting(true);
    setSubmitError(null);

    const userId = appUser?.id || '';
    const payload = buildPayload(userId, answers);

    try {
      const res = await fetch('http://localhost:8080/api/client/update-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      navigate('/calendar');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const progress = (answeredCount / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/Logo_(2).png" alt="TrainLiv" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5">
              {QUESTIONS.map(q => {
                const ans = answers[q.id];
                const done = ans?.value !== null && ans?.value !== undefined;
                const yes = ans?.value === true;
                return (
                  <span
                    key={q.id}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      done && yes ? 'bg-blue-500 scale-110' : done ? 'bg-emerald-400 scale-110' : 'bg-slate-200'
                    )}
                  />
                );
              })}
            </div>
            <span className="text-xs font-bold text-slate-400 tabular-nums">
              {answeredCount}/{QUESTIONS.length}
            </span>
            <button
              onClick={() => navigate('/calendar')}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1"
            >
              Skip <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="h-[2px] bg-slate-100">
          <motion.div
            className="h-full bg-blue-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-[10.5px] font-black uppercase tracking-[0.16em] px-2.5 py-1 rounded-full mb-3">
              <Heart className="w-2.5 h-2.5" />
              PAR-Q+ Health Screening
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Physical Activity Readiness
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Answer all 7 questions honestly — takes under 2 minutes.
            </p>
          </div>
          {allAnswered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold px-4 py-2.5 rounded-xl shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              All questions answered
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
          {QUESTIONS.map((q, i) => {
            const ans = answers[q.id];
            const answered = ans?.value !== null && ans?.value !== undefined;
            const isYes = ans?.value === true;
            const isNo = ans?.value === false;
            const Icon = q.icon;
            const hasExtra = (q.id === 'q1' && isYes) || (!!q.listLabel && isYes);

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.045, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'bg-white rounded-2xl border transition-all duration-250',
                  hasExtra ? 'lg:col-span-2' : '',
                  answered && isYes
                    ? 'border-blue-200'
                    : answered && isNo
                      ? 'border-emerald-200'
                      : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-colors',
                      answered && isYes
                        ? 'bg-blue-600 text-white'
                        : answered && isNo
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                    )}>
                      {answered ? (
                        isYes ? <Icon style={{ width: '14px', height: '14px' }} /> : <span>✓</span>
                      ) : (
                        <span>{q.number}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Question {q.number}
                      </p>
                      <p className="text-slate-800 font-semibold text-[13.5px] leading-snug">
                        {q.question}
                      </p>
                      {q.note && (
                        <p className="text-slate-400 text-[11.5px] font-medium mt-1.5 leading-relaxed italic">
                          {q.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <YesNoToggle value={ans?.value ?? null} onChange={v => setYesNo(q.id, v)} />
                    {answered && (
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full',
                        isYes ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      )}>
                        {isYes ? 'Yes — flagged' : 'No — clear'}
                      </span>
                    )}
                  </div>

                  <AnimatePresence>
                    {q.id === 'q1' && isYes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                            Please select all that apply:
                          </p>
                          <div className="flex flex-wrap gap-2">
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

                  <AnimatePresence>
                    {q.listLabel && isYes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <label className="block text-[10.5px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            {q.listLabel}
                          </label>
                          <textarea
                            value={ans?.detail || ''}
                            onChange={e => setDetail(q.id, e.target.value)}
                            placeholder="Describe your condition(s)…"
                            rows={2}
                            className={cn(
                              'w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5',
                              'text-sm font-medium text-slate-800 placeholder:text-slate-300',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300',
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

        <AnimatePresence>
          {hasYes && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3.5 items-start"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-sm">Medical clearance recommended</p>
                <p className="text-amber-700 text-xs font-medium leading-relaxed mt-0.5">
                  You answered "Yes" to one or more questions. We recommend consulting your doctor before starting a new programme. Your trainer will review your responses to personalise sessions appropriately.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{submitError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={handleContinue}
            disabled={!allAnswered || submitting}
            className={cn(
              'w-full sm:w-auto rounded-xl h-11 px-8 font-bold gap-2 text-sm',
              'shadow-md shadow-blue-900/10 disabled:opacity-35 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Continue to Calendar
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <button
            onClick={() => navigate('/calendar')}
            className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip and answer later
          </button>
        </div>

        <p className="text-[11px] text-slate-400 font-medium mt-5 text-center">
          Your answers are kept strictly confidential and used solely for safety assessment purposes.
        </p>
      </main>
    </div>
  );
}
