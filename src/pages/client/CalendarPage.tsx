import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Video, Clock, MapPin, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { API_BASE_URL } from '../../config';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { getSystemTimezone } from '../../lib/timezone';

interface ApiTrainerWindow {
  startTime: string;
  endTime: string;
}

interface ApiTrainer {
  trainerId: string;
  trainerName: string;
  profileImageUrl: string;
  timezone: string;
  windows: ApiTrainerWindow[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface SessionEvent {
  id: string;
  day: number;
  month: number;
  year: number;
  time: string;
  duration: string;
  trainer: string;
  trainerId: string;
  trainerAvatar: string;
  type: string;
  mode: 'virtual' | 'in-person';
  color: string;
  isBooked: boolean;
  trainerBio: string;
  trainerAvailability: string[];
}

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23cbd5e1'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ccircle cx='50' cy='36' r='18'/%3E%3Cellipse cx='50' cy='90' rx='30' ry='24'/%3E%3C/svg%3E";

const COLOR_MAP: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewStartDate, setViewStartDate] = useState(() => new Date(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [apiTrainers, setApiTrainers] = useState<ApiTrainer[]>([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(false);

  useEffect(() => {
    const fetchTrainers = async () => {
      if (!selectedDate) { setApiTrainers([]); return; }
      try {
        setIsLoadingTrainers(true);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const response = await fetch(`${API_BASE_URL}/api/booking/trainers/available?date=${dateStr}`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setApiTrainers(data.trainers || []);
        } else {
          setApiTrainers([]);
        }
      } catch {
        setApiTrainers([]);
      } finally {
        setIsLoadingTrainers(false);
      }
    };
    fetchTrainers();
  }, [selectedDate]);

  function prevWeek() {
    setViewStartDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      setSelectedDate(d);
      return d;
    });
  }

  function nextWeek() {
    setViewStartDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      setSelectedDate(d);
      return d;
    });
  }

  const apiSessions: SessionEvent[] = apiTrainers.map((t, idx) => {
    const startTimeStr = t.windows && t.windows.length > 0 ? t.windows[0].startTime : '08:00';
    const [h, m] = startTimeStr.split(':');
    const hour = parseInt(h, 10) || 8;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    const timeFormatted = `${formattedHour}:${m || '00'} ${ampm}`;
    return {
      id: `api_${t.trainerId}_${idx}`,
      day: selectedDate?.getDate() || 1,
      month: selectedDate?.getMonth() || 0,
      year: selectedDate?.getFullYear() || 2026,
      time: timeFormatted,
      duration: 'Flexible',
      trainer: t.trainerName,
      trainerId: t.trainerId,
      trainerAvatar: t.profileImageUrl || DEFAULT_AVATAR,
      type: 'Personal Training',
      mode: 'virtual',
      color: 'emerald',
      isBooked: false,
      trainerBio: `Available for booking in your local time (${getSystemTimezone()}).`,
      trainerAvailability: t.windows.map(w => `${w.startTime} - ${w.endTime}`)
    };
  });

  const clientId = user?.id || 'client_001';

  const { data: upcomingData, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['upcoming-bookings', clientId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/booking/clients/${clientId}/bookings/upcoming`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch upcoming bookings');
      return res.json();
    },
    enabled: !!clientId
  });

  const apiUpcomingBookings = upcomingData?.bookings || [];

  const upcomingSessions = apiUpcomingBookings.map((b: any) => {
    const [yyyy, mm, dd] = b.date.split('-');
    return {
      id: b.bookingId,
      meetingId: b.meetingId,
      year: parseInt(yyyy),
      month: parseInt(mm) - 1,
      day: parseInt(dd),
      time: b.startTime,
      trainer: b.trainerName,
      trainerId: b.trainerId,
      trainerAvatar: b.trainerProfileImageUrl || DEFAULT_AVATAR,
      type: b.type || 'Personal Training',
      mode: 'virtual' as const,
      color: 'emerald' as any
    };
  }).sort((a: any, b: any) => {
    const da = new Date(a.year, a.month, a.day, parseInt(a.time.substring(0, 2)));
    const db = new Date(b.year, b.month, b.day, parseInt(b.time.substring(0, 2)));
    return da.getTime() - db.getTime();
  }).slice(0, 3);

  const getDateLabel = (sYear: number, sMonth: number, sDay: number) => {
    const sDate = new Date(sYear, sMonth, sDay);
    sDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((sDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'TODAY';
    if (diff === 1) return 'TOMORROW';
    return `${MONTHS[sMonth].slice(0, 3)} ${sDay}`;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {MONTHS[today.getMonth()]} {today.getFullYear()}
          </p>
        </div>
        <Button
          onClick={() => navigate('/trainers')}
          className="rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-2 h-10 px-5 shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          Book Session
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-5">
        {/* Calendar + Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 overflow-hidden"
        >
          {/* Month + Nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Weekly View</p>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {MONTHS[viewStartDate.getMonth()]} <span className="text-slate-400 font-medium">{viewStartDate.getFullYear()}</span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevWeek}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-slate-600 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setViewStartDate(new Date(today)); setSelectedDate(new Date(today)); }}
                className="px-3 py-1 text-[10px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all tracking-wide"
              >
                Today
              </button>
              <button
                onClick={nextWeek}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-slate-600 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day Pills */}
          <div className="px-4 py-3 border-b border-slate-50">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(viewStartDate);
                date.setDate(viewStartDate.getDate() + i);
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(isSelected ? null : date)}
                    className={cn(
                      'relative flex flex-col items-center py-2.5 px-1 rounded-xl transition-all duration-200 active:scale-95',
                      isSelected
                        ? 'bg-slate-900 shadow-md'
                        : isToday
                          ? 'bg-blue-50 ring-1 ring-blue-200'
                          : 'hover:bg-slate-50'
                    )}
                  >
                    <span className={cn(
                      'text-[9px] font-semibold uppercase tracking-wider mb-1.5',
                      isSelected ? 'text-slate-400' : isToday ? 'text-blue-500' : 'text-slate-400'
                    )}>
                      <span className="sm:inline hidden">{DAYS[date.getDay()]}</span>
                      <span className="sm:hidden">{DAYS[date.getDay()][0]}</span>
                    </span>
                    <span className={cn(
                      'text-sm font-bold leading-none',
                      isSelected ? 'text-white' : isToday ? 'text-blue-600' : 'text-slate-700'
                    )}>
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Sessions */}
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.25 }}
                className="p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.15em]">
                      {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Available trainers</p>
                  </div>
                  {!isLoadingTrainers && apiSessions.length > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {apiSessions.length} available
                    </span>
                  )}
                </div>

                {isLoadingTrainers ? (
                  <div className="space-y-2.5">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-slate-100 rounded-full animate-pulse w-32" />
                          <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-20" />
                        </div>
                        <div className="w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : apiSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-dashed border-slate-200">
                      <Calendar className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">No trainers available</p>
                    <p className="text-xs text-slate-300">Try a different date or browse all trainers.</p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/trainers')}
                      className="mt-4 rounded-xl h-9 px-5 font-semibold text-xs border-slate-200"
                    >
                      Browse Trainers
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {apiSessions.map((s, i) => {
                      const c = COLOR_MAP[s.color];
                      const isExpanded = expandedSessionId === s.id;

                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          layout
                          className={cn(
                            'rounded-xl border transition-all duration-200 overflow-hidden',
                            isExpanded
                              ? 'border-slate-200 shadow-md'
                              : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                          )}
                        >
                          <div className="flex items-center gap-3 p-3">
                            <button
                              onClick={() => navigate(`/trainer/${s.trainerId}`)}
                              className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 ring-2 ring-white hover:ring-slate-200 transition-all active:scale-95"
                            >
                              <img
                                src={s.trainerAvatar}
                                alt={s.trainer}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                              />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border', c.bg, c.text, c.border)}>
                                  {s.type}
                                </span>
                              </div>
                              <button
                                onClick={() => navigate(`/trainer/${s.trainerId}`)}
                                className="text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors text-left truncate block max-w-full"
                              >
                                {s.trainer}
                              </button>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-300" />
                                <span className="text-[10px] text-slate-400 font-medium">{s.time}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{s.mode}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => navigate(`/book/${s.trainerId}`, {
                                  state: { trainerName: s.trainer, trainerAvatar: s.trainerAvatar, specialties: [s.type], selectedDate: selectedDate?.toISOString() }
                                })}
                                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-[11px] font-semibold h-8 px-3.5 rounded-lg transition-all active:scale-95 whitespace-nowrap"
                              >
                                <Plus className="w-3 h-3" />
                                Book
                              </button>
                              <button
                                onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center rounded-lg transition-all',
                                  isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                )}
                              >
                                <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isExpanded && 'rotate-180')} />
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50">
                                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{s.trainerBio}</p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => navigate(`/book/${s.trainerId}`, {
                                        state: { trainerName: s.trainer, trainerAvatar: s.trainerAvatar, specialties: [s.type], selectedDate: selectedDate?.toISOString() }
                                      })}
                                      className="rounded-lg h-8 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800"
                                    >
                                      <Clock className="w-3 h-3 mr-1.5" />
                                      Check Availability
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/trainer/${s.trainerId}`)}
                                      className="rounded-lg h-8 px-4 text-xs font-semibold border-slate-200"
                                    >
                                      View Profile
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-date"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Select a day to see available trainers</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upcoming Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Your Journal</p>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Schedule</h3>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-semibold',
                upcomingSessions.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
              )}>
                {isLoadingUpcoming ? '—' : `${upcomingSessions.length} sessions`}
              </span>
            </div>

            <div className="p-4">
              {isLoadingUpcoming ? (
                <div className="space-y-2.5">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-100 rounded-full animate-pulse w-28" />
                        <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-20" />
                      </div>
                      <div className="w-16 h-7 bg-slate-100 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3 border border-dashed border-slate-200">
                    <Calendar className="w-4 h-4 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">No upcoming sessions</p>
                  <p className="text-xs text-slate-300 mb-3">Book a session to get started.</p>
                  <Button
                    onClick={() => navigate('/trainers')}
                    className="rounded-lg h-8 px-4 font-semibold text-xs gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
                  >
                    <Plus className="w-3 h-3" />
                    Explore Trainers
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingSessions.map((s: any, i: number) => {
                    const c = COLOR_MAP[s.color];
                    const dateLabel = getDateLabel(s.year, s.month, s.day);
                    const isTodayLabel = dateLabel === 'TODAY';

                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
                      >
                        <button
                          onClick={() => navigate(`/trainer/${s.trainerId}`)}
                          className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 ring-2 ring-white group-hover:ring-slate-100 transition-all active:scale-95"
                        >
                          <img
                            src={s.trainerAvatar}
                            alt={s.trainer}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                          />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={cn(
                              'text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
                              isTodayLabel ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                            )}>
                              {dateLabel}
                            </span>
                            {s.mode === 'virtual' && isTodayLabel && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                          </div>
                          <button
                            onClick={() => navigate(`/trainer/${s.trainerId}`)}
                            className="text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors text-left block truncate"
                          >
                            {s.trainer}
                          </button>
                          <p className="text-[10px] text-slate-400 font-medium">{s.time} · {s.type}</p>
                        </div>

                        {s.mode === 'virtual' ? (
                          <button
                            onClick={() => {
                              const roomId = s.meetingId || s.id;
                              navigate(`/session/${roomId}`, {
                                state: { bookingId: s.id, meetingId: s.meetingId, trainerId: s.trainerId, clientId }
                              });
                            }}
                            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold h-8 px-3 rounded-lg transition-all active:scale-95 whitespace-nowrap shrink-0"
                          >
                            <Video className="w-3 h-3" />
                            Join
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-slate-50 text-slate-400 text-[10px] font-semibold h-8 px-3 rounded-lg border border-slate-100 whitespace-nowrap shrink-0">
                            <MapPin className="w-3 h-3" />
                            On Site
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
            className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/15 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em] mb-2">Monthly Progress</p>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-white font-bold text-3xl tracking-tight">{apiUpcomingBookings.length}</p>
                <p className="text-slate-500 text-sm">sessions in {MONTHS[viewStartDate.getMonth()]}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <p className="text-emerald-400 text-xl font-bold mb-0.5">{apiUpcomingBookings.length}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Trainer Sessions</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <p className="text-blue-400 text-xl font-bold mb-0.5">0</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Completed</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
