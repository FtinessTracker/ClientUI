import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../../services/authService';
import { Dumbbell, ArrowLeft, Mail, Lock, Shield, Zap, Users, Star, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function TrainerSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.signIn({ email, password });

      if (response.role !== 'trainer') {
        setError('This account is not a trainer account. Please use the client sign-in.');
        setIsLoading(false);
        return;
      }

      navigate('/trainer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[50%] relative flex-col overflow-hidden">
        <motion.div 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            className="w-full h-full object-cover"
            alt="Trainer background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/50 to-slate-950/80" />
        </motion.div>

        <div className="relative z-10 flex flex-col h-full p-12 lg:p-16">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="bg-accent p-2.5 rounded-xl shadow-xl shadow-accent/30 group-hover:shadow-accent/50 group-hover:scale-105 transition-all duration-300">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">TrainLiv</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-[11px] font-black uppercase tracking-[0.2em]">
                Elite Trainer Access
              </div>
              
              <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter">
                WELCOME<br />BACK TO<br />
                <span className="text-accent italic">THE ARENA.</span>
              </h1>

              <div className="space-y-4 pt-4">
                {[
                  { icon: Shield, label: 'Secure Business Tools' },
                  { icon: Zap, label: 'Instant Client Booking' },
                  { icon: Users, label: 'Real-time Analytics' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-accent/10 group-hover:border-accent/20">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-slate-300 font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
          >
             <div className="flex gap-1 mb-3">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />)}
             </div>
             <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
               "This platform doubled my client base in three months. The UI is just incredible for my business."
             </p>
             <div className="mt-4 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" alt="Marcus" />
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marcus Chen — Platinum Trainer</span>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="flex-1 bg-white relative overflow-y-auto px-6 sm:px-12 lg:px-20 py-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-[400px]">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider">Public Site</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">SIGN IN</h2>
            <p className="text-slate-500 font-medium">Access your professional trainer dashboard.</p>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                {error}
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-accent transition-colors" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium text-slate-900"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                <a href="#" className="text-[10px] font-black text-accent hover:text-accent-dark uppercase tracking-widest">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-accent transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium text-slate-900"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm tracking-widest uppercase shadow-2xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                disabled={isLoading}
              >
                {isLoading ? (
                   <div className="flex items-center gap-3">
                     <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     <span>AUTHENTICATING...</span>
                   </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>SIGN IN TO DASHBOARD</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </div>

            <div className="text-center pt-6">
              <p className="text-slate-500 text-sm font-medium">
                New to TrainLiv?{' '}
                <Link to="/trainer/sign-up" className="text-accent font-black hover:text-accent-dark transition-colors uppercase tracking-widest">
                  Apply Now
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <div className="absolute bottom-8 text-center px-6">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
            Professional Elite Platform · v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
