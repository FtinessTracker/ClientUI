import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Video, Clock, User, MapPin, MoveHorizontal as MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface SessionEvent {
  id: string;
  day: number;
  time: string;
  duration: string;
  trainer: string;
  type: string;
  mode: 'virtual' | 'in-person';
  color: string;
}

const MOCK_SESSIONS: SessionEvent[] = [
  { id: '1', day: 10, time: '7:00 AM', duration: '45 min', trainer: 'Sarah Jenkins', type: 'Yoga & Mindfulness', mode: 'virtual', color: 'emerald' },
  { id: '2', day: 13, time: '6:30 PM', duration: '60 min', trainer: 'Marcus Chen', type: 'HIIT & Strength', mode: 'virtual', color: 'blue' },
  { id: '3', day: 17, time: '9:00 AM', duration: '45 min', trainer: 'Elena Rodriguez', type: 'Mobility & Rehab', mode: 'in-person', color: 'amber' },
  { id: '4', day: 19, time: '7:00 AM', duration: '60 min', trainer: 'Sarah Jenkins', type: 'Yoga & Mindfulness', mode: 'virtual', color: 'emerald' },
  { id: '5', day: 24, time: '5:00 PM', duration: '45 min', trainer: 'Marcus Chen', type: 'HIIT & Strength', mode: 'virtual', color: 'blue' },
];

const COLOR_MAP: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  const sessionsForDay = (day: number) => MOCK_SESSIONS.filter(s => s.day === day);
  const selectedSessions = selectedDay ? sessionsForDay(selectedDay) : [];

  const upcomingSessions = MOCK_SESSIONS.filter(s => {
    if (!isCurrentMonth) return false;
    return s.day >= today.getDate();
  }).slice(0, 3);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Calendar</h1>
          <p className="text-slate-400 font-medium mt-0.5">Manage and view your upcoming training sessions.</p>
        </div>
        <Button className="rounded-xl font-bold shadow-lg shadow-slate-900/10 gap-2 h-11 px-5">
          <Plus className="w-4 h-4" />
          Book Session
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[11px] font-black text-slate-400 uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = isCurrentMonth && day === today.getDate();
                const isSelected = day === selectedDay;
                const daySessions = sessionsForDay(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={cn(
                      'relative flex flex-col items-center py-2 rounded-xl transition-all duration-150 hover:bg-slate-50 group',
                      isSelected && 'bg-slate-900 hover:bg-slate-900',
                      isToday && !isSelected && 'bg-accent/8'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg',
                      isSelected ? 'text-white' : isToday ? 'text-accent font-black' : 'text-slate-700'
                    )}>
                      {day}
                    </span>
                    {daySessions.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {daySessions.slice(0, 3).map(s => (
                          <div
                            key={s.id}
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isSelected ? 'bg-white/60' : COLOR_MAP[s.color].dot
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-slate-100 px-6 py-5"
            >
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                {MONTHS[viewMonth]} {selectedDay}
              </p>
              {selectedSessions.length === 0 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-400">No sessions scheduled.</p>
                  <Button variant="outline" className="rounded-xl h-9 px-4 font-bold text-sm border-slate-200 gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Add Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedSessions.map(s => {
                    const c = COLOR_MAP[s.color];
                    return (
                      <div key={s.id} className={cn('flex items-center gap-4 p-3 rounded-xl border', c.bg, c.border)}>
                        <div className={cn('w-2 h-8 rounded-full shrink-0', c.dot)} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-bold text-sm', c.text)}>{s.type}</p>
                          <p className="text-xs text-slate-500 font-medium">{s.trainer} · {s.time} · {s.duration}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {s.mode === 'virtual'
                            ? <Video className="w-4 h-4 text-slate-400" />
                            : <MapPin className="w-4 h-4 text-slate-400" />
                          }
                          <button className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Upcoming Sessions</h3>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm font-medium mb-4">No upcoming sessions this month.</p>
                <Button className="rounded-xl h-9 px-5 font-bold text-sm gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Book Now
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((s, i) => {
                  const c = COLOR_MAP[s.color];
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className={cn('p-4 rounded-xl border', c.bg, c.border)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={cn('text-xs font-black uppercase tracking-wider', c.text)}>
                          {MONTHS[viewMonth].slice(0, 3)} {s.day}
                        </span>
                        {s.mode === 'virtual'
                          ? <Video className={cn('w-3.5 h-3.5', c.text)} />
                          : <MapPin className={cn('w-3.5 h-3.5', c.text)} />
                        }
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{s.type}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <User className="w-3 h-3" /> {s.trainer.split(' ')[0]}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <Clock className="w-3 h-3" /> {s.time}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/15 rounded-full blur-2xl" />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">This Month</p>
              <p className="text-white font-black text-2xl tracking-tight mb-1">
                {MOCK_SESSIONS.length} Sessions
              </p>
              <p className="text-slate-500 text-xs font-medium mb-5">scheduled in {MONTHS[viewMonth]}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Yoga', count: 2, color: 'text-emerald-400' },
                  { label: 'HIIT', count: 2, color: 'text-blue-400' },
                  { label: 'Rehab', count: 1, color: 'text-amber-400' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                    <p className={cn('text-lg font-black', color)}>{count}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
