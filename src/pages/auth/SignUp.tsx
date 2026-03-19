import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ArrowLeft, CircleCheck as CheckCircle2, Trophy, TrendingUp, Clock, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader as Loader2 } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9086-2.2581c-.8064.54-1.8382.8618-3.0478.8618-2.3446 0-4.3282-1.5845-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9574C.3477 6.1731 0 7.5477 0 9s.3477 2.8269.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1641 6.6554 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.4921 3.29115 17.2155 7.59375 17.8907V11.6016H5.30859V9H7.59375V7.01719C7.59375 4.76156 8.93742 3.51563 10.9929 3.51563C11.977 3.51563 13.0078 3.69141 13.0078 3.69141V5.90625H11.873C10.755 5.90625 10.4063 6.60006 10.4063 7.3125V9H12.9023L12.5033 11.6016H10.4063V17.8907C14.7088 17.2155 18 13.4921 18 9Z" fill="#1877F2"/>
    </svg>
  );
}

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

type Step = 'form' | 'verify';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  general?: string;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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
          <span className="text-xl font-black tracking-tighter text-white">FlexFit</span>
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
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);

  const handleOAuth = async (provider: 'oauth_google' | 'oauth_facebook') => {
    if (!isLoaded) return;
    const key = provider === 'oauth_google' ? 'google' : 'facebook';
    setOauthLoading(key);
    try {
      await signUp!.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding',
      });
    } catch {
      setOauthLoading(null);
    }
  };
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'phone' ? formatPhone(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) {
      next.phone = 'Phone number is required';
    } else if (form.phone.replace(/\D/g, '').length < 10) {
      next.phone = 'Enter a complete 10-digit phone number';
    }
    if (form.password.length < 8) next.password = 'At least 8 characters required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      await signUp!.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        emailAddress: form.email.trim(),
        password: form.password,
        unsafeMetadata: { phoneNumber: form.phone },
      });

      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; meta?: { paramName?: string } }[] };
      const msg = clerkErr?.errors?.[0]?.message || 'Something went wrong. Please try again.';
      const param = clerkErr?.errors?.[0]?.meta?.paramName;

      if (param === 'email_address') setErrors({ email: msg });
      else if (param === 'password') setErrors({ password: msg });
      else setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setVerifying(true);
    setCodeError('');

    try {
      const result = await signUp!.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId });
        navigate('/onboarding');
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setCodeError(clerkErr?.errors?.[0]?.message || 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || resending) return;
    setResending(true);
    try {
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } finally {
      setResending(false);
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
            <span className="text-lg font-black tracking-tighter text-slate-900">FlexFit</span>
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

                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleOAuth('oauth_google')}
                    disabled={!!oauthLoading}
                    className="h-12 w-full flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 font-semibold text-slate-700 text-sm transition-all hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {oauthLoading === 'google' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth('oauth_facebook')}
                    disabled={!!oauthLoading}
                    className="h-12 w-full flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 font-semibold text-slate-700 text-sm transition-all hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {oauthLoading === 'facebook' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                      <FacebookIcon />
                    )}
                    Continue with Facebook
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
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

                  <FormField label="Phone Number" icon={Phone} error={errors.phone}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="(555) 000-0000"
                      autoComplete="tel"
                      className={inputCls}
                    />
                  </FormField>

                  <FormField label="Password" icon={Lock} error={errors.password}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Min. 8 characters"
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
                  By creating an account you agree to FlexFit's{' '}
                  <a href="#" className="underline hover:text-slate-600 transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px]"
              >
                <div className="mb-8">
                  <button
                    onClick={() => setStep('form')}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors mb-7 group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Edit details
                  </button>

                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>

                  <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Check your email</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    We sent a 6-digit verification code to{' '}
                    <span className="text-slate-900 font-bold">{form.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (codeError) setCodeError('');
                      }}
                      placeholder="000000"
                      autoFocus
                      className="h-12 w-full px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-lg text-center tracking-[0.4em] placeholder:text-slate-300 placeholder:tracking-normal focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all outline-none"
                    />
                    <AnimatePresence>
                      {codeError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-500 text-xs font-semibold mt-1.5"
                        >
                          {codeError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || code.length < 6}
                    className="h-12 w-full rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-sm tracking-tight shadow-lg shadow-slate-900/15 hover:shadow-slate-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Verify & Get Started
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-slate-400 text-sm font-medium">
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleResend}
                      disabled={resending}
                      className="text-accent font-bold hover:text-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {resending ? 'Resending...' : resent ? 'Sent!' : 'Resend code'}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
