import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ArrowLeft, CircleCheck as CheckCircle2, Trophy, TrendingUp, Clock, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader as Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';

const PERKS = [
  'Access to 500+ elite certified trainers',
  'Live 1:1 HD video training sessions',
  'Personalized programs & progress tracking',
  'First session 50% off — no commitment',
];

const TRUST_ITEMS = [
  { icon: Trophy, value: 'Top 3%', label: 'Trainer acceptance rate' },
  { icon: TrendingUp, value: '94%', label: 'Members hit their goals' },
  { icon: Clock, value: '15 min', label: 'Average booking time' },
];

type Step = 'form' | 'success';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  general?: string;
}

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative flex-col overflow-hidden">
      <motion.div
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <img
          src="https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&cs=tinysrgb&w=1400"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/55 to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
        <Link to="/" className="flex items-center gap-3 group w-fit">
          <div className="bg-accent p-2.5 rounded-xl shadow-xl shadow-accent/30 group-hover:shadow-accent/50 group-hover:scale-105 transition-all duration-300">
            <Dumbbell className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">TrainLiv</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-lg mt-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div>
              <p className="text-accent text-[11px] font-black uppercase tracking-[0.25em] mb-4">Start Free Today</p>
              <h1 className="text-5xl xl:text-6xl font-black text-white leading-[0.92] tracking-tighter">
                Your best self<br />starts{' '}
                <span className="italic font-serif font-bold text-accent">here.</span>
              </h1>
            </div>

            <p className="text-slate-400 text-base leading-relaxed font-medium max-w-sm">
              Join thousands of members already training with the world's best coaches. No gym needed.
            </p>

            <div className="space-y-3">
              {PERKS.map((perk, i) => (
                <motion.div
                  key={perk}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-accent" />
                  </div>
                  <p className="text-slate-300 text-sm font-medium">{perk}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-5"
        >
          <div className="grid grid-cols-3 gap-4">
            {TRUST_ITEMS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/8">
                <Icon className="w-4 h-4 text-accent mb-2" />
                <p className="text-xl font-black text-white tracking-tighter">{value}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <span className="text-accent text-sm font-black">%</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">
              <span className="text-white font-bold">50% off</span> your first session — no commitment required
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        {children}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-500 text-xs font-semibold mt-1.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  'h-11 w-full pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all outline-none';

export default function SignUpPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    if (form.password.length < 6) next.password = 'At least 6 characters required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      await authService.signUp({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: 'client',
      });
      setStep('success');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      if (errMsg.toLowerCase().includes('email')) setErrors({ email: errMsg });
      else if (errMsg.toLowerCase().includes('password')) setErrors({ password: errMsg });
      else setErrors({ general: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      <LeftPanel />

      <div className="flex-1 flex flex-col bg-white relative overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-emerald-400 to-teal-500" />

        <div className="lg:hidden flex items-center px-6 pt-6 pb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-slate-900 p-2 rounded-xl">
              <Dumbbell className="text-accent w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900">TrainLiv</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px]"
              >
                <div className="mb-8">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors mb-7 group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Back to home
                  </Link>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-1.5">Create your account</h2>
                  <p className="text-slate-500 text-sm font-medium">
                    Already have an account?{' '}
                    <Link to="/sign-in" className="text-accent font-bold hover:text-emerald-600 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>

                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold"
                  >
                    {errors.general}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="First Name" icon={User} error={errors.firstName}>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={set('firstName')}
                        placeholder="Jane"
                        autoComplete="given-name"
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label="Last Name" icon={User} error={errors.lastName}>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={set('lastName')}
                        placeholder="Smith"
                        autoComplete="family-name"
                        className={inputCls}
                      />
                    </FormField>
                  </div>

                  <FormField label="Email Address" icon={Mail} error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="jane@example.com"
                      autoComplete="email"
                      className={inputCls}
                    />
                  </FormField>

                  <FormField label="Password" icon={Lock} error={errors.password}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </FormField>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-sm tracking-tight shadow-lg shadow-slate-900/15 hover:shadow-slate-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <p className="text-center text-slate-400 text-[11px] mt-7 leading-relaxed">
                  By creating an account you agree to TrainLiv's{' '}
                  <a href="#" className="underline hover:text-slate-600 transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </motion.div>

                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-3">Welcome to TrainLiv!</h2>
                <p className="text-slate-500 text-base font-medium leading-relaxed mb-8">
                  Your account has been created. Get ready to transform your fitness journey with our elite trainers.
                </p>

                <button
                  onClick={() => navigate('/onboarding')}
                  className="h-12 w-full rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-sm tracking-tight shadow-lg shadow-slate-900/15 hover:shadow-slate-900/25 transition-all flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
