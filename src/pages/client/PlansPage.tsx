import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Check, Lock, ChevronRight, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const PLANS = [
  {
    id: '1',
    name: '8-Week Fat Loss',
    trainer: 'Marcus Chen',
    duration: '8 weeks',
    sessions: 24,
    level: 'Intermediate',
    progress: 33,
    current: true,
    description: 'A progressive HIIT and strength program designed to maximize fat loss while preserving muscle.',
    image: 'https://images.pexels.com/photos/4720236/pexels-photo-4720236.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Flexibility & Mobility',
    trainer: 'Sarah Jenkins',
    duration: '4 weeks',
    sessions: 12,
    level: 'All Levels',
    progress: 0,
    current: false,
    description: 'Build a foundation of mobility and flexibility to move pain-free and perform better.',
    image: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Strength Foundations',
    trainer: 'Elena Rodriguez',
    duration: '6 weeks',
    sessions: 18,
    level: 'Beginner',
    progress: 0,
    current: false,
    description: 'Learn the fundamentals of strength training with expert form coaching and progressive overload.',
    image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Plans</h1>
          <p className="text-slate-400 font-medium mt-0.5">Structured multi-week programs to help you reach your goals.</p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold border-slate-200 h-10 px-5 text-sm gap-2">
          <ClipboardList className="w-4 h-4" />
          Browse Plans
        </Button>
      </motion.div>

      {PLANS.filter(p => p.current).map(plan => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="bg-slate-900 rounded-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0">
            <img src={plan.image} alt="" className="w-full h-full object-cover opacity-20" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10 p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2 block">Active Plan</span>
                <h2 className="text-2xl font-black text-white tracking-tight">{plan.name}</h2>
                <p className="text-slate-400 font-medium mt-1">{plan.trainer} · {plan.duration} · {plan.sessions} sessions</p>
              </div>
              <span className="bg-accent/20 border border-accent/30 text-accent text-xs font-black px-3 py-1.5 rounded-full">
                {plan.level}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6 max-w-lg">{plan.description}</p>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Progress</p>
                <p className="text-sm font-black text-accent">{plan.progress}%</p>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${plan.progress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full"
                />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium">Week 3 of 8 · Next session: HIIT Circuit</p>
          </div>
        </motion.div>
      ))}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Recommended Plans</h2>
          <button className="text-sm font-bold text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.filter(p => !p.current).map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={plan.image} alt={plan.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full">
                    {plan.level}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 font-medium mb-3">{plan.trainer} · {plan.duration}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">{plan.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> 4.9
                  </span>
                  <Button size="sm" className="rounded-xl h-8 px-4 font-bold text-xs shadow-sm">
                    Start Plan
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
