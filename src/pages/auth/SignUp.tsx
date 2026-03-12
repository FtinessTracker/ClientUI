import React, { useState } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowLeft, CircleCheck as CheckCircle2, Trophy, TrendingUp, Clock } from 'lucide-react';

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

export default function SignUpPage() {
  const [oauthLoading, setOauthLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {/* Left Panel */}
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
                Join thousands of members who are already training with the world's best coaches. No gym needed.
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

      {/* Right Panel */}
      <div className="flex-1 flex flex-col bg-white relative overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-emerald-400 to-teal-500" />

        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-slate-900 p-2 rounded-xl">
              <Dumbbell className="text-accent w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900">FlexFit</span>
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
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Create your account</h2>
              <p className="text-slate-500 text-sm font-medium">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-accent font-bold hover:text-emerald-600 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <div
              className={oauthLoading ? 'pointer-events-none opacity-70' : ''}
              onClick={() => {
                const btn = document.querySelector('[data-provider]');
                if (btn) setOauthLoading(true);
              }}
            >
              <SignUp
                routing="hash"
                signInUrl="/sign-in"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-none bg-transparent p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    header: 'hidden',
                    socialButtonsBlockButton:
                      'h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 text-sm transition-all hover:border-slate-300 hover:shadow-sm w-full gap-3 cursor-pointer',
                    socialButtonsBlockButtonText: 'font-semibold text-slate-700 text-sm',
                    socialButtonsBlockButtonArrow: 'hidden',
                    socialButtonsProviderIcon: 'w-5 h-5',
                    dividerRow: 'my-5',
                    dividerText: 'text-slate-400 text-[11px] font-bold uppercase tracking-widest px-3',
                    dividerLine: 'bg-slate-200',
                    formFieldLabel:
                      'text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5',
                    formFieldInput:
                      'h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all outline-none w-full',
                    formFieldInputShowPasswordButton: 'text-slate-400 hover:text-slate-600',
                    formButtonPrimary:
                      'h-12 w-full rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-sm tracking-tight shadow-lg shadow-slate-900/15 hover:shadow-slate-900/25 transition-all mt-1',
                    footerActionLink: 'hidden',
                    footerActionText: 'hidden',
                    footer: 'hidden',
                    formFieldErrorText: 'text-red-500 text-xs font-semibold mt-1',
                    alertText: 'text-red-700 text-sm font-medium',
                    alert: 'bg-red-50 border border-red-100 rounded-xl p-4 mb-2',
                    otpCodeFieldInput:
                      'h-12 w-11 rounded-xl border border-slate-200 text-slate-900 font-bold text-lg text-center focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all',
                    form: 'gap-4',
                    formFields: 'gap-4',
                    formFieldRow: 'gap-4',
                  },
                  layout: {
                    socialButtonsPlacement: 'top',
                    socialButtonsVariant: 'blockButton',
                  },
                  variables: {
                    colorPrimary: '#10b981',
                    colorText: '#0f172a',
                    colorTextSecondary: '#64748b',
                    colorBackground: 'transparent',
                    colorInputBackground: '#ffffff',
                    colorInputText: '#0f172a',
                    borderRadius: '0.75rem',
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    fontSize: '14px',
                    spacingUnit: '16px',
                  },
                }}
              />
            </div>

            <p className="text-center text-slate-400 text-[11px] mt-8 leading-relaxed">
              By creating an account you agree to FlexFit's{' '}
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
