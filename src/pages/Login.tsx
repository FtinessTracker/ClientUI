import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dumbbell, Mail, Lock, ArrowRight, User, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { mockApi } from '../services/mockApi';
import { Role } from '../types';
import { cn } from '../lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'trainer'] as const)
});

type LoginForm = z.infer<typeof loginSchema>;

import { motion } from 'framer-motion';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'client'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await mockApi.login(data.email, data.role);
      navigate(from, { replace: true });
      window.location.reload();
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Left Side: Visual/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        
        <div className="relative z-10 p-20 flex flex-col justify-between h-full w-full">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-3 rounded-2xl shadow-2xl shadow-accent/20">
              <Dumbbell className="text-accent-foreground w-8 h-8" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">FlexFit</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-6xl font-black text-white leading-[0.9] tracking-tighter"
            >
              ELEVATE YOUR <span className="text-accent">POTENTIAL.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-slate-400 text-xl font-medium"
            >
              Join the elite community of trainers and athletes pushing the boundaries of what's possible.
            </motion.p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">10k+</p>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Active Members</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">500+</p>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Elite Trainers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20 bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-3">
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Enter your details to access your performance dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 p-1.5 bg-slate-100 rounded-[2rem]">
              <button
                type="button"
                onClick={() => setValue('role', 'client')}
                className={cn(
                  "flex items-center justify-center gap-3 py-4 rounded-[1.75rem] transition-all duration-300 font-black text-sm uppercase tracking-widest",
                  selectedRole === 'client' 
                    ? "bg-white text-slate-900 shadow-xl shadow-black/5" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <User className="w-4 h-4" />
                Client
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'trainer')}
                className={cn(
                  "flex items-center justify-center gap-3 py-4 rounded-[1.75rem] transition-all duration-300 font-black text-sm uppercase tracking-widest",
                  selectedRole === 'trainer' 
                    ? "bg-white text-slate-900 shadow-xl shadow-black/5" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Briefcase className="w-4 h-4" />
                Trainer
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    {...register('email')}
                    placeholder="name@example.com" 
                    className="h-16 pl-14 rounded-2xl border-slate-100 bg-white font-medium text-lg focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
                {errors.email && <p className="text-xs font-bold text-red-500 ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                  <a href="#" className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    {...register('password')}
                    type="password" 
                    placeholder="••••••••" 
                    className="h-16 pl-14 rounded-2xl border-slate-100 bg-white font-medium text-lg focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
                {errors.password && <p className="text-xs font-bold text-red-500 ml-1">{errors.password.message}</p>}
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all" isLoading={isLoading}>
              Sign In
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </form>

          <div className="pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              New to FlexFit?{' '}
              <a href="#" className="font-black text-primary hover:underline uppercase tracking-widest text-xs ml-1">Create Account</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
