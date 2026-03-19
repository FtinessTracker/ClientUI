import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Play, Clock, Flame, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const WORKOUTS = [
  { id: '1', name: 'Full Body HIIT', duration: '45 min', calories: 380, level: 'Intermediate', trainer: 'Marcus Chen', image: 'https://images.pexels.com/photos/4720236/pexels-photo-4720236.jpeg?auto=compress&cs=tinysrgb&w=400', tag: 'Trending' },
  { id: '2', name: 'Morning Yoga Flow', duration: '30 min', calories: 180, level: 'Beginner', trainer: 'Sarah Jenkins', image: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400', tag: 'Popular' },
  { id: '3', name: 'Mobility & Stretch', duration: '20 min', calories: 90, level: 'All Levels', trainer: 'Elena Rodriguez', image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400', tag: 'Recovery' },
  { id: '4', name: 'Strength Foundations', duration: '60 min', calories: 420, level: 'Advanced', trainer: 'Marcus Chen', image: 'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400', tag: 'New' },
];

const LEVEL_COLORS: Record<string, string> = {
  'Beginner': 'bg-emerald-50 text-emerald-700',
  'Intermediate': 'bg-blue-50 text-blue-700',
  'Advanced': 'bg-rose-50 text-rose-700',
  'All Levels': 'bg-amber-50 text-amber-700',
};

export default function WorkoutsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Workouts</h1>
        <p className="text-slate-400 font-medium mt-0.5">Browse and start trainer-curated workout sessions.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Completed', value: '24', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'This Week', value: '3', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Calories Burned', value: '8.4k', color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Streak', value: '7 days', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Featured Workouts</h2>
          <button className="text-sm font-bold text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WORKOUTS.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={w.image} alt={w.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {w.tag}
                  </span>
                </div>
                <button className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-accent hover:text-white transition-colors">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
              <div className="p-4">
                <p className="font-black text-slate-900 text-sm mb-1">{w.name}</p>
                <p className="text-xs text-slate-400 font-medium mb-3">{w.trainer}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {w.duration}</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-rose-400" /> {w.calories}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${LEVEL_COLORS[w.level]}`}>{w.level}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
