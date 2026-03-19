import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Droplets, Flame, TrendingUp } from 'lucide-react';

const MACROS = [
  { label: 'Calories', value: '1,840', target: '2,200', pct: 84, color: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600' },
  { label: 'Protein', value: '128g', target: '160g', pct: 80, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  { label: 'Carbs', value: '210g', target: '250g', pct: 84, color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
  { label: 'Fat', value: '62g', target: '73g', pct: 85, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
];

const MEALS = [
  { time: 'Breakfast', items: ['Oatmeal with berries', 'Greek yogurt', 'Black coffee'], calories: 420 },
  { time: 'Lunch', items: ['Grilled chicken salad', 'Quinoa bowl', 'Water'], calories: 680 },
  { time: 'Snack', items: ['Almonds', 'Apple'], calories: 210 },
  { time: 'Dinner', items: ['Salmon with vegetables', 'Brown rice'], calories: 530 },
];

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Nutrition</h1>
        <p className="text-slate-400 font-medium mt-0.5">Track your daily intake and hit your nutrition goals.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MACROS.map(({ label, value, target, pct, color, light, text }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
            <p className={`text-2xl font-black tracking-tight mb-0.5 ${text}`}>{value}</p>
            <p className="text-xs text-slate-400 font-medium mb-3">of {target}</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + i * 0.06 }}
                className={`h-full rounded-full ${color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Today's Meals</h2>
          {MEALS.map((meal, i) => (
            <motion.div
              key={meal.time}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Apple className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="font-black text-slate-900 text-sm">{meal.time}</span>
                </div>
                <span className="text-sm font-black text-slate-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  {meal.calories} kcal
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {meal.items.map(item => (
                  <span key={item} className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-5"
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Hydration</h3>
            <div className="flex items-end gap-3 mb-3">
              <Droplets className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">6 / 8</p>
                <p className="text-xs font-medium text-slate-400">glasses today</p>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full ${i < 6 ? 'bg-blue-500' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <TrendingUp className="w-5 h-5 text-accent mb-3" />
              <p className="text-white font-black text-lg tracking-tight">84% on target</p>
              <p className="text-slate-500 text-xs font-medium mt-1">Great job staying within your nutrition goals this week.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
