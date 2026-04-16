import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowLeft, Star, Shield, Zap, Users, Eye, EyeOff, Mail, Lock, ArrowRight, Loader as Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';

const STATS = [
  { value: '10k+', label: 'Active Members' },
  { value: '500+', label: 'Elite Trainers' },
  { value: '4.9★', label: 'Avg. Rating' },
];

const FEATURES = [
  { icon: Shield, label: 'Verified Elite Trainers' },
  { icon: Zap, label: 'Book in Under 60 Seconds' },
  { icon: Users, label: 'Live 1:1 HD Video Sessions' },
];

interface FieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

const inputCls =
  'h-11 w-full pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all outline-none';

export default function SignInPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const user = await authService.signIn({
        email: form.email.trim(),
        password: form.password,
      });
      if (user.role === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/calendar');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Invalid email or password';
      setErrors({ general: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative flex-col overflow-hidden">
        <motion.div
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src="https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=1400"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/60 to-slate-950/80" />
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
              className="space-y-7"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-[11px] font-bold uppercase tracking-[0.18em]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                </span>
                Live Training Platform
              </div>

              <h1 className="text-5xl xl:text-6xl font-black text-white leading-[0.92] tracking-tighter">
                ELEVATE<br />YOUR<br />
                <span className="italic font-serif font-bold text-accent">POTENTIAL.</span>
              </h1>

              <p className="text-slate-400 text-base leading-relaxed font-medium max-w-sm">
                The world's most elite personal trainers, available at your fingertips. Train smarter. Live better.
              </p>

              <div className="space-y-3 pt-2">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex gap-10">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-sm">
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />)}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed italic">
                "TrainLiv completely transformed my training. Having a world-class coach in my living room is unreal."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80"
                  className="w-8 h-8 rounded-full object-cover border border-white/15"
                  alt="Alex W."
                  referrerPolicy="no-referrer"
                />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Alex W. — NYC</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white relative overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-emerald-400 to-teal-500" />

        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-slate-900 p-2 rounded-xl">
              <Dumbbell className="text-accent w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900">TrainLiv</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px]"
          >
            <div className="mb-9">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors mb-7 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to home
              </Link>
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Welcome back</h2>
              <p className="text-slate-500 text-sm font-medium">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-accent font-bold hover:text-emerald-600 transition-colors">
                  Sign up free
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    placeholder="jane@example.com"
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, password: e.target.value }));
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Your password"
                    autoComplete="current-password"
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
                </div>
                {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.password}</p>}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-sm tracking-tight shadow-lg shadow-slate-900/15 hover:shadow-slate-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="text-center text-slate-400 text-[11px] mt-8 leading-relaxed">
              By signing in you agree to TrainLiv's{' '}
              <a href="#" className="underline hover:text-slate-600 transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
