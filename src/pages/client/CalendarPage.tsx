import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Video, Clock, MapPin, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { API_BASE_URL } from '../../config';
import { useAppUser } from '../../hooks/useAppUser';
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

// Default avatar as inline SVG data URI (renders a clean person silhouette)
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23cbd5e1'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ccircle cx='50' cy='36' r='18'/%3E%3Cellipse cx='50' cy='90' rx='30' ry='24'/%3E%3C/svg%3E";

const COLOR_MAP: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { appUser: user } = useAppUser();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewStartDate, setViewStartDate] = useState(() => {
    const d = new Date(today);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [apiTrainers, setApiTrainers] = useState<ApiTrainer[]>([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(false);

  useEffect(() => {
    const fetchTrainers = async () => {
      if (!selectedDate) {
        setApiTrainers([]);
        return;
      }
      try {
        setIsLoadingTrainers(true);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const response = await fetch(`${API_BASE_URL}/api/booking/trainers/available?date=${dateStr}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setApiTrainers(data.trainers || []);
        } else {
          setApiTrainers([]);
        }
      } catch (error) {
        console.error('Error fetching trainers:', error);
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

  const combinedSessions = apiSessions;

  const clientId = user?.id || 'client_001';

  const { data: upcomingData, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['upcoming-bookings', clientId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/booking/clients/${clientId}/bookings/upcoming`, {
        credentials: 'include'
      });
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
      type: b.type || 'Personal Training', // Fallback type
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
    <div className="max-w-[1440px] mx-auto space-y-10 py-4 px-4 sm:px-10">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="relative group">
          <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-accent/10 to-transparent blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h1 className="relative text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-none">
            Calendar<span className="text-accent ml-1">.</span>
          </h1>
          <p className="relative text-slate-400 font-semibold mt-2 tracking-tight flex items-center gap-2">
            <span className="w-8 h-px bg-slate-200" />
            Empower your fitness narrative
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="rounded-2xl h-14 px-6 font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
            History
          </Button>
          <Button className="rounded-2xl font-black bg-slate-900 hover:bg-slate-800 text-white shadow-[0_20px_40px_-12px_rgba(15,23,42,0.3)] hover:shadow-[0_20px_40px_-8px_rgba(15,23,42,0.4)] gap-3 h-14 px-8 transition-all hover:scale-[1.02] active:scale-95 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Book Session
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Weekly Calendar Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 sm:px-10 py-8 sm:py-10 border-b border-slate-100/50">
            <div>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2">Weekly Pipeline</p>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                {MONTHS[viewStartDate.getMonth()]}
                <span className="text-slate-300 font-bold">{viewStartDate.getFullYear()}</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevWeek}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all text-slate-900 active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextWeek}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all text-slate-900 active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 px-6">
            <div className="grid grid-cols-7 gap-px">
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
                      "relative h-24 py-4 flex flex-col items-center justify-between transition-all duration-500 group active:scale-95",
                      isSelected ? "z-20" : "z-10 hover:bg-slate-50/50 rounded-3xl"
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selectedDay"
                        className="absolute inset-0 bg-slate-900 rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(15,23,42,0.4)] z-0"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative flex flex-col items-center z-10">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 transition-colors duration-300",
                        isSelected ? "text-slate-400" : isToday ? "text-accent" : "text-slate-300"
                      )}>
                        <span className="sm:inline hidden">{DAYS[date.getDay()]}</span>
                        <span className="inline sm:hidden">{DAYS[date.getDay()][0]}</span>
                      </span>
                      <span className={cn(
                        'text-xl font-black transition-colors duration-300',
                        isSelected ? 'text-white' : 'text-slate-700'
                      )}>
                        {date.getDate()}
                      </span>
                    </div>

                    {/* {daySessions.length > 0 && ( ... )} */}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedDate && (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-slate-100/50 px-10 py-12 bg-white/40"
              >
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Daily Ledger</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                      {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
                      <span className="text-slate-300 ml-2 text-2xl">/ {selectedDate.getFullYear()}</span>
                    </h3>
                  </div>
                </div>

                {isLoadingTrainers ? (
                  <div className="flex items-center justify-center p-8 bg-white/50 border border-dashed border-slate-200 rounded-3xl">
                    <p className="text-sm font-bold text-slate-400">Loading available trainers...</p>
                  </div>
                ) : combinedSessions.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-8 bg-white/50 border border-dashed border-slate-200 rounded-3xl">
                    <p className="text-sm font-bold text-slate-400">No available sessions for this date.</p>
                    <Button variant="outline" className="rounded-xl h-10 px-6 font-black text-xs border-slate-200 hover:bg-slate-900 hover:text-white transition-all gap-2">
                      <Plus className="w-4 h-4" />
                      Quick Add
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid gap-3">
                    {combinedSessions.map((s, i) => {
                      const c = COLOR_MAP[s.color];
                      const isExpanded = expandedSessionId === s.id;

                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          layout
                          className={cn(
                            "group relative bg-white rounded-[2.5rem] border border-slate-100/50 transition-shadow duration-500",
                            isExpanded ? "shadow-[0_40px_80px_-24px_rgba(0,0,0,0.12)] ring-1 ring-slate-200" : "hover:shadow-2xl hover:shadow-slate-900/5"
                          )}
                        >
                          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-t-[2.5rem]" />
                          <div className="relative p-4 sm:p-6 sm:pl-8 sm:pr-6 z-10">
                            <div className="flex items-center gap-4 sm:gap-6">
                              {/* 1. Profile Avatar */}
                              <button
                                onClick={() => navigate(`/trainer/${s.trainerId}`)}
                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.5rem] overflow-hidden shadow-inner shrink-0 ring-4 ring-slate-50 group-hover:ring-accent/10 transition-all duration-500 active:scale-95 bg-slate-100"
                              >
                                <img src={s.trainerAvatar} alt={s.trainer} className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }} />
                              </button>

                              {/* 2. Trainer Details */}
                              <div className="min-w-0 flex-1">
                                <div className="space-y-1 mb-2 font-medium">
                                  <span className={cn(
                                    'text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.15em] border backdrop-blur-sm shadow-sm transition-all duration-500 whitespace-nowrap',
                                    c.bg, c.text, "border-white"
                                  )}>
                                    {s.type}
                                  </span>
                                  <button
                                    onClick={() => navigate(`/trainer/${s.trainerId}`)}
                                    className="font-black text-slate-900 text-lg sm:text-2xl tracking-tight hover:text-accent transition-all duration-300 text-left block truncate max-w-full"
                                  >
                                    {s.trainer}
                                  </button>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide whitespace-nowrap">{s.time}</span>
                                  </div>
                                  <div className="w-1 h-1 rounded-full bg-slate-200 flex-shrink-0" />
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] whitespace-nowrap">{s.mode}</span>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Action Buttons Group (Book/Join + Expand) */}
                              <div className="flex items-center gap-3 shrink-0">
                                {/* Primary Action */}
                                <div className="hidden sm:block">
                                  {s.isBooked ? (
                                    s.mode === 'virtual' ? (
                                      <button
                                        onClick={() => navigate(`/session/${s.id}`)}
                                        className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-[13px] font-black h-12 px-6 rounded-2xl transition-all shadow-lg hover:scale-[1.02] active:scale-95 group/btn overflow-hidden"
                                      >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-2xl" />
                                        <Video className="w-4 h-4 relative z-10" />
                                        <span className="relative z-10 whitespace-nowrap">Join Now</span>
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full -mr-4 -mt-4 blur-xl" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                                      </button>
                                    ) : (
                                      <div className="flex items-center justify-center gap-2 bg-slate-50 text-slate-400 text-xs font-black h-12 px-6 rounded-xl ring-1 ring-slate-100">
                                        <MapPin className="w-4 h-4" />
                                        On Site
                                      </div>
                                    )
                                  ) : (
                                    <button
                                      onClick={() => navigate(`/book/${s.trainerId}`, { state: { trainerName: s.trainer, trainerAvatar: s.trainerAvatar, specialties: [s.type], selectedDate: selectedDate?.toISOString() } })}
                                      className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white text-[13px] font-black h-12 px-6 rounded-2xl transition-all shadow-lg hover:scale-[1.02] active:scale-95 group/btn overflow-hidden"
                                    >
                                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-2xl" />
                                      <Plus className="w-4 h-4 relative z-10" />
                                      <span className="relative z-10 whitespace-nowrap">Book Now</span>
                                    </button>
                                  )}
                                </div>

                                {/* Expand/collapse chevron */}
                                <div className="h-10 w-px bg-slate-200/50 hidden sm:block" />
                                <button
                                  onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                                  className={cn(
                                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0",
                                    isExpanded ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 shadow-sm"
                                  )}
                                >
                                  <ChevronDown className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500", isExpanded && "rotate-180")} />
                                </button>
                              </div>
                            </div>

                            {/* Mobile-only full-width action button */}
                            <div className="sm:hidden mt-3">
                              {s.isBooked ? (
                                s.mode === 'virtual' ? (
                                  <button
                                    onClick={() => navigate(`/session/${s.id}`)}
                                    className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-[13px] font-black h-12 px-6 rounded-2xl transition-all shadow-lg active:scale-95 group/btn overflow-hidden"
                                  >
                                    <Video className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">Join Now</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-center gap-2 bg-slate-50 text-slate-400 text-xs font-black h-12 px-6 rounded-xl ring-1 ring-slate-100 w-full">
                                    <MapPin className="w-4 h-4" />
                                    On Site
                                  </div>
                                )
                              ) : (
                                <button
                                  onClick={() => navigate(`/book/${s.trainerId}`, { state: { trainerName: s.trainer, trainerAvatar: s.trainerAvatar, specialties: [s.type], selectedDate: selectedDate?.toISOString() } })}
                                  className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white text-[13px] font-black h-12 px-6 rounded-2xl transition-all shadow-lg active:scale-95 group/btn overflow-hidden"
                                >
                                  <Plus className="w-4 h-4 relative z-10" />
                                  <span className="relative z-10">Book Now</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                              >
                                <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                                  <div className="space-y-6">
                                    <div className="space-y-4">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] inline-block pb-1 border-b-2 border-accent uppercase">Trainer Expertise</p>
                                      <p className="text-base text-slate-600 leading-relaxed font-medium max-w-4xl">
                                        {s.trainerBio}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-start gap-3">
                                      <Button
                                        variant="default"
                                        onClick={() => navigate(`/book/${s.trainerId}`, { state: { trainerName: s.trainer, trainerAvatar: s.trainerAvatar, specialties: [s.type], selectedDate: selectedDate?.toISOString() } })}
                                        className="rounded-2xl text-xs font-black h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all active:scale-95 gap-2 cursor-pointer"
                                      >
                                        <Clock className="w-4 h-4" />
                                        Check Availability
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => navigate(`/trainer/${s.trainerId}`)}
                                        className="rounded-2xl text-xs font-black h-11 px-6 border-slate-200 hover:bg-slate-900 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                                      >
                                        View Profile
                                      </Button>
                                    </div>
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
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Your Journal</h3>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Upcoming Schedule</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest">
                {upcomingSessions.length} SESSIONS
              </div>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 text-sm font-medium mb-4">No current bookings this month.</p>
                <Button className="rounded-xl h-10 px-6 font-bold text-sm gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10">
                  <Plus className="w-4 h-4" />
                  Explore Slots
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((s, i) => {
                  const c = COLOR_MAP[s.color];
                  const dateLabel = getDateLabel(s.year, s.month, s.day);
                  const isToday = dateLabel === 'TODAY';

                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="group relative p-4 sm:p-5 rounded-[2rem] border border-slate-100 bg-white hover:bg-slate-50/50 transition-all duration-500 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.06)] hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-lg scale-75 group-hover:scale-110 transition-all" />
                            <button
                              onClick={() => navigate(`/trainer/${s.trainerId}`)}
                              className="w-12 h-12 rounded-[1.2rem] overflow-hidden border-2 border-white relative bg-white transition-all active:scale-95 shrink-0 shadow-sm"
                            >
                              <img src={s.trainerAvatar} alt={s.trainer} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }} />
                            </button>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={cn(
                                'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border',
                                isToday ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                              )}>
                                {dateLabel}
                              </span>
                              <div className="flex items-center gap-1">
                                {s.mode === 'virtual' && isToday && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                                <span className="text-[10px] font-bold text-slate-400">{s.time}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/trainer/${s.trainerId}`)}
                              className="font-black text-slate-900 text-[13px] tracking-tight hover:text-accent transition-colors text-left block truncate"
                            >
                              {s.trainer}
                            </button>
                            <p className="text-[10px] text-slate-400 font-bold tracking-tight">{s.type}</p>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {s.mode === 'virtual' ? (
                            <button
                              onClick={() => {
                                const roomId = s.meetingId || s.id;
                                navigate(`/session/${roomId}`, { 
                                  state: { 
                                    bookingId: s.id,
                                    meetingId: s.meetingId,
                                    trainerId: s.trainerId,
                                    clientId: clientId
                                  } 
                                });
                              }}
                              className="group/join relative flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[11px] font-black h-9 px-5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap overflow-hidden"
                            >
                              <Video className="w-3.5 h-3.5 relative z-10" />
                              <span className="relative z-10">Join Now</span>
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/join:opacity-100 transition-opacity" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 bg-slate-50 text-slate-400 text-[10px] font-black h-9 px-4 rounded-xl border border-slate-100 whitespace-nowrap">
                              <MapPin className="w-3.5 h-3.5" />
                              On Site
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl shadow-slate-900/30"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Your Progress</p>
              <p className="text-white font-black text-4xl tracking-tighter mb-1">
                {apiUpcomingBookings.length} <span className="text-xl text-slate-500 ml-1">Sessions</span>
              </p>
              <p className="text-slate-400 text-xs font-bold mb-8">scheduled in {MONTHS[viewStartDate.getMonth()]}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Trainer Sessions', count: apiUpcomingBookings.length, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/10 group">
                    <p className={cn('text-2xl font-black mb-1 transition-transform group-hover:scale-110', color)}>{count}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
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
