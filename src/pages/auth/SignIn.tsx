import React, { useState } from 'react';
import { SignIn, useSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Star, ArrowLeft } from 'lucide-react';

const STATS = [
  { value: '10k+', label: 'Active Members' },
  { value: '500+', label: 'Elite Trainers' },
  { value: '4.9', label: 'Avg. Rating' },
];

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-slate-950 overflow-hidden flex-col">
        <motion.img
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.45 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1400"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/40 to-slate-950/80" />

        <div className="relative z-10 flex flex-col h-full p-14 xl:p-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="bg-accent p-2.5 rounded-xl shadow-2xl shadow-accent/30 group-hover:shadow-accent/50 transition-shadow">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">FlexFit</span>
          </Link>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                </span>
                Live Training Platform
              </div>

              <h1 className="text-6xl xl:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                ELEVATE<br />YOUR<br /><span className="text-accent italic font-serif font-bold">POTENTIAL.</span>
              </h1>

              <p className="text-white/55 text-lg leading-relaxed font-medium">
                Join the elite community of athletes and world-class trainers pushing the boundaries of what's possible.
              </p>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex gap-10 pb-4"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />)}
            </div>
            <p className="text-white/70 text-sm leading-relaxed font-medium italic">
              "FlexFit completely transformed my training. Having a world-class coach in my living room is unreal."
            </p>
            <p className="text-white/40 text-xs font-bold mt-3 uppercase tracking-wider">— Alex W., NYC</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 bg-[#FAFAFA] relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-accent p-2 rounded-xl">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">FlexFit</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors mb-8 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 font-medium">Sign in to access your training dashboard.</p>
          </div>

          <SignIn
            routing="hash"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent p-0 gap-0 w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                header: 'hidden',
                socialButtonsBlockButton:
                  'h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 text-sm transition-all hover:border-slate-300 hover:shadow-sm w-full',
                socialButtonsBlockButtonText: 'font-bold text-slate-700',
                socialButtonsBlockButtonArrow: 'hidden',
                dividerRow: 'my-5',
                dividerText: 'text-slate-400 text-xs font-bold uppercase tracking-widest',
                dividerLine: 'bg-slate-200',
                formFieldLabel:
                  'text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5',
                formFieldInput:
                  'h-14 px-5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-base placeholder:text-slate-300 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none w-full',
                formFieldInputShowPasswordButton: 'text-slate-400 hover:text-slate-600',
                formButtonPrimary:
                  'h-14 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-base tracking-tight shadow-xl shadow-slate-900/15 hover:shadow-slate-900/25 hover:scale-[1.01] transition-all mt-2',
                footerActionLink:
                  'text-accent font-black hover:text-accent/80 transition-colors',
                footerActionText: 'text-slate-500 font-medium text-sm',
                identityPreviewText: 'text-slate-700 font-medium',
                identityPreviewEditButtonIcon: 'text-slate-400',
                formFieldErrorText: 'text-red-500 text-xs font-bold mt-1',
                alertText: 'text-red-600 text-sm font-medium',
                alert: 'bg-red-50 border border-red-100 rounded-2xl p-4',
                otpCodeFieldInput:
                  'h-14 w-12 rounded-xl border border-slate-200 text-slate-900 font-bold text-xl text-center focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all',
                footer: 'mt-6 text-center',
                form: 'gap-4',
                formFields: 'gap-4',
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
                borderRadius: '1rem',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: '15px',
              },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
