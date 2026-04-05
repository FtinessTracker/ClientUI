import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../../services/authService';
import { Dumbbell, ArrowLeft, Shield, Zap, Users, Star, Mail, Lock, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const FEATURES = [
  { icon: Shield, label: 'Manage Clients & Schedules' },
  { icon: Zap, label: 'Automated Payments & Payouts' },
  { icon: Users, label: 'Grow Your Fitness Brand' },
];

export default function TrainerSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const pwd = formData.password;

  const passwordChecks = [
    { id: 'length',    label: '15+ characters',          met: pwd.length >= 15,                             tip: `${Math.max(0, 15 - pwd.length)} more character${15 - pwd.length === 1 ? '' : 's'} needed` },
    { id: 'lower',     label: 'Lowercase letter (a-z)',   met: /[a-z]/.test(pwd),                            tip: 'Add a lowercase letter' },
    { id: 'upper',     label: 'Uppercase letter (A-Z)',   met: /[A-Z]/.test(pwd),                            tip: 'Add an uppercase letter like A–Z' },
    { id: 'number',    label: 'Number (0-9)',              met: /\d/.test(pwd),                               tip: 'Add at least one digit (0–9)' },
    { id: 'special',   label: 'Special character (@#$…)', met: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),           tip: 'Add a symbol like @ # $ % & *' },
  ];

  const metCount  = passwordChecks.filter(c => c.met).length;
  const strength  = metCount <= 1 ? 'Weak' : metCount === 2 ? 'Fair' : metCount === 3 ? 'Good' : metCount === 4 ? 'Strong' : 'Very Strong';
  const strengthColor = metCount <= 1 ? '#ef4444' : metCount === 2 ? '#f97316' : metCount === 3 ? '#eab308' : metCount === 4 ? '#22c55e' : '#10b981';
  const strengthBar   = `${(metCount / 5) * 100}%`;
  const nextTip = passwordChecks.find(c => !c.met)?.tip ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await authService.signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Signup successful — show success screen then redirect
      setSuccess(true);
      setTimeout(() => {
        navigate('/trainer/sign-in', { state: { registered: true } });
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6 text-center px-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Account Created!</h2>
            <p className="text-slate-500 font-medium">Your trainer account was successfully created.</p>
            <p className="text-slate-400 text-sm mt-1">Redirecting you to login...</p>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.4, duration: 2.1, ease: 'linear' }}
            className="h-1 bg-emerald-500 rounded-full max-w-[200px]"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {/* Left Panel - Branding & Social Proof */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src="https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            className="w-full h-full object-cover"
            alt="Trainer background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/70 to-slate-950/80" />
        </motion.div>

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="bg-accent p-2.5 rounded-xl shadow-xl shadow-accent/30 group-hover:shadow-accent/50 group-hover:scale-105 transition-all duration-300">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">TrainLiv</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-[11px] font-bold uppercase tracking-widest">
                Trainer Portal
              </div>
              <h1 className="text-5xl font-black text-white leading-tight tracking-tighter">
                TRANSFORM<br />LIVES.<br />
                <span className="italic font-serif text-accent">EARN MORE.</span>
              </h1>
              <p className="text-slate-400 text-base font-medium leading-relaxed">
                Join the world's most elite platform for personal trainers. Scale your business with powerful tools designed for fitness pros.
              </p>

              <div className="grid gap-4 pt-4">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-slate-300 font-bold text-sm tracking-tight">{feature.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 border-t border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <img
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                    className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800"
                    alt="Trainer"
                  />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />)}
                </div>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Trusted by 5,000+ Elite Trainers</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="flex-1 bg-white relative overflow-y-auto px-6 sm:px-12 lg:px-20 py-12 flex items-center justify-center">
        <div className="w-full max-w-[480px]">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-wider">Back to site</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Create Trainer Account</h2>
            <p className="text-slate-500 font-medium">Start your journey as an elite trainer today.</p>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                {error}
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    type="text"
                    placeholder="John"
                    className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    type="text"
                    placeholder="Doe"
                    className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input
                  type="email"
                  placeholder="coach@example.com"
                  className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
              </div>

              <AnimatePresence>
                {(isPasswordFocused || pwd.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">

                      {/* Strength bar */}
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password Strength</p>
                        <span className="text-[11px] font-black" style={{ color: strengthColor }}>{pwd.length > 0 ? strength : '—'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: strengthColor }}
                          initial={{ width: 0 }}
                          animate={{ width: pwd.length > 0 ? strengthBar : '0%' }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </div>

                      {/* Live tip */}
                      <AnimatePresence mode="wait">
                        {nextTip && pwd.length > 0 && (
                          <motion.p
                            key={nextTip}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5"
                          >
                            💡 {nextTip}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Requirements checklist */}
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {passwordChecks.map((req) => (
                          <motion.div
                            key={req.id}
                            animate={{ opacity: req.met ? 1 : 0.7 }}
                            className="flex items-center gap-2"
                          >
                            {req.met ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className={`text-xs font-medium transition-colors ${
                              req.met ? 'text-emerald-700 line-through decoration-emerald-300' : 'text-slate-400'
                            }`}>
                              {req.label}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-tight shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : 'Create Trainer Account'}
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-slate-500 text-sm font-medium">
                Already have a trainer account?{' '}
                <Link to="/trainer/sign-in" className="text-accent font-bold hover:text-accent-dark transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>

          <p className="text-center text-[10px] text-slate-400 mt-10 leading-relaxed uppercase tracking-widest font-bold">
            By joining, you agree to our Terms of Service<br />and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
