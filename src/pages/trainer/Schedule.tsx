import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Video, MapPin, ChevronLeft, ChevronRight, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Globe, Send, X, CalendarPlus, Loader as Loader2, Play, Users as UsersIcon, Zap, TrendingUp, Sparkles } from 'lucide-react';
import {
  format, addDays, startOfWeek, isSameDay, isToday, isPast,
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isBefore,
} from 'date-fns';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useAppUser } from '../../hooks/useAppUser';
import { API_BASE_URL } from '../../config';
import { getSystemTimezone } from '../../lib/timezone';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AvailabilityWindow {
  date: string;
  startTime: string;
  endTime: string;
}

interface SubmitPayload {
  trainerId: string;
  timezone: string;
  availabilityWindows: AvailabilityWindow[];
}

interface ApiWindowEntry {
  windowId: string;
  startTime: string;
  endTime: string;
}

interface ApiAvailabilityDay {
  date: string;
  window: ApiWindowEntry[];
}

interface ExistingWindow {
  date: string;
  windowId: string;
  startTime: string;
  endTime: string;
}

interface TodayBooking {
  id: string;
  bookingId?: string;
  clientId?: string;
  trainerId?: string;
  clientName: string;
  clientAvatar?: string;
  date?: string;
  startTime: string;
  endTime: string;
  meetingId?: string;
  status: string;
}

interface TodayBookingsResponse {
  trainerId: string;
  totalBookings: number;
  bookings: TodayBooking[];
}

// ─── Constants ───────────────────────────────────────────────────────────────
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const min = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${min}`;
});

function formatTimeLabel(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-orange-400 to-orange-600',
    'from-rose-400 to-rose-600',
    'from-cyan-400 to-cyan-600',
    'from-amber-400 to-amber-600',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ClientAvatar({ name, avatar, size = 'md' }: { name: string; avatar?: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-11 h-11 text-sm';
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={cn(sz, 'rounded-xl object-cover ring-2 ring-white shadow-sm')}
      />
    );
  }
  return (
    <div
      className={cn(
        sz,
        'rounded-xl flex items-center justify-center font-black text-white ring-2 ring-white shadow-sm bg-gradient-to-br shrink-0',
        getAvatarColor(name)
      )}
    >
      {getInitials(name)}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    confirmed: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    pending: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    cancelled: { bg: 'bg-red-50 border-red-100', text: 'text-red-700', dot: 'bg-red-400' },
  };
  const s = map[status?.toLowerCase()] || { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border', s.bg, s.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {status}
    </span>
  );
}

interface BookingCardProps {
  booking: TodayBooking;
  idx: number;
  showDate?: boolean;
  onJoin: (booking: TodayBooking) => void;
  [key: string]: unknown;
}

function BookingCard({ booking, idx, showDate = false, onJoin }: BookingCardProps) {
  const canJoin = !!(booking.meetingId || booking.bookingId || booking.id);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.35, ease: 'easeOut' }}
      className="group relative flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300"
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <ClientAvatar name={booking.clientName} avatar={booking.clientAvatar} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-slate-900 text-sm truncate">{booking.clientName}</p>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex items-center gap-3">
          {showDate && booking.date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500">
                {format(new Date(booking.date + 'T12:00:00'), 'EEE, MMM d')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-accent" />
            <span className="text-[11px] font-semibold text-slate-500">
              {formatTimeLabel(booking.startTime)} – {formatTimeLabel(booking.endTime)}
            </span>
          </div>
        </div>
      </div>

      {canJoin && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onJoin(booking)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-accent text-white text-xs font-black rounded-xl shadow-sm shadow-accent/30 hover:bg-emerald-600 transition-colors shrink-0"
        >
          <Play className="w-3 h-3 fill-current" />
          Join
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrainerSchedule() {
  const navigate = useNavigate();
  const { appUser } = useAppUser();
  const queryClient = useQueryClient();

  const trainerId = appUser?.id || '';
  const timezone = getSystemTimezone();

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [stagedWindows, setStagedWindows] = useState<AvailabilityWindow[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [showSuccess, setShowSuccess] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState<string[]>([]);

  const fetchStartDate = format(startOfMonth(calendarMonth), 'yyyy-MM-dd');
  const fetchEndDate = format(endOfMonth(calendarMonth), 'yyyy-MM-dd');

  const { data: existingData, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['trainer-availability', trainerId, fetchStartDate, fetchEndDate],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/trainer/${trainerId}/availability?startDate=${fetchStartDate}&endDate=${fetchEndDate}`,
        { credentials: 'include' }
      );
      if (!res.ok) return { availabilityWindow: [] };
      return res.json();
    },
    enabled: !!trainerId,
  });

  const { data: todayBookingsData, isLoading: isLoadingToday } = useQuery<TodayBookingsResponse>({
    queryKey: ['trainer-bookings-today', trainerId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/trainer/${trainerId}/bookings/today`, {
        credentials: 'include',
      });
      if (!res.ok) return { trainerId, totalBookings: 0, bookings: [] };
      return res.json();
    },
    enabled: !!trainerId,
  });

  const { data: upcomingBookingsData, isLoading: isLoadingUpcoming } = useQuery<TodayBookingsResponse>({
    queryKey: ['trainer-bookings-upcoming', trainerId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/trainer/${trainerId}/bookings/upcoming`, {
        credentials: 'include',
      });
      if (!res.ok) return { trainerId, totalBookings: 0, bookings: [] };
      return res.json();
    },
    enabled: !!trainerId,
  });

  const existingWindows: ExistingWindow[] = useMemo(() => {
    const days: ApiAvailabilityDay[] = existingData?.availabilityWindow || [];
    const flat: ExistingWindow[] = [];
    days.forEach(day => {
      (day.window || []).forEach(w => {
        flat.push({ date: day.date, windowId: w.windowId, startTime: w.startTime, endTime: w.endTime });
      });
    });
    return flat;
  }, [existingData]);

  const submitMutation = useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      const res = await fetch(`${API_BASE_URL}/api/trainer/${trainerId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to save availability');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability', trainerId] });
      setStagedWindows([]);
      setSelectedDates([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    },
  });

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const hasOverlap = (date: string, start: string, end: string) => {
    for (const w of existingWindows.filter(w => w.date === date)) {
      if (start < w.endTime && end > w.startTime) return true;
    }
    for (const w of stagedWindows.filter(w => w.date === date)) {
      if (start < w.endTime && end > w.startTime) return true;
    }
    return false;
  };

  const addWindowsForSelectedDates = () => {
    if (selectedDates.length === 0 || newStart >= newEnd) return;
    const added: AvailabilityWindow[] = [];
    const skipped: string[] = [];
    selectedDates.forEach(date => {
      if (hasOverlap(date, newStart, newEnd)) skipped.push(date);
      else added.push({ date, startTime: newStart, endTime: newEnd });
    });
    if (skipped.length > 0) {
      setOverlapWarning(skipped);
      setTimeout(() => setOverlapWarning([]), 4000);
    }
    if (added.length > 0) setStagedWindows(prev => [...prev, ...added]);
    setShowAddForm(false);
    setSelectedDates([]);
  };

  const removeStaged = (index: number) => {
    setStagedWindows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (stagedWindows.length === 0) return;
    submitMutation.mutate({ trainerId, timezone, availabilityWindows: stagedWindows });
  };

  const handleJoin = (booking: TodayBooking) => {
    const roomId = booking.meetingId || booking.bookingId || booking.id;
    navigate(`/session/${roomId}`, {
      state: {
        bookingId: booking.bookingId || booking.id,
        meetingId: booking.meetingId,
        trainerId: appUser?.id,
        clientId: booking.clientId,
      },
    });
  };

  const groupedExisting = useMemo(() => {
    const days: ApiAvailabilityDay[] = existingData?.availabilityWindow || [];
    return days
      .map(day => ({ date: day.date, windows: day.window || [] }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [existingData]);

  const stagedDateSet = new Set(stagedWindows.map(w => w.date));
  const existingDateSet = new Set(existingWindows.map(w => w.date));

  const todayCount = todayBookingsData?.totalBookings || 0;
  const upcomingCount = upcomingBookingsData?.totalBookings || 0;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-8"
    >
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Schedule</h1>
          <p className="text-slate-400 font-medium mt-1 flex items-center gap-2 text-sm">
            <Globe className="w-3.5 h-3.5" />
            {timezone}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {stagedWindows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="rounded-2xl font-black bg-accent hover:bg-emerald-600 text-white gap-2 shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 active:scale-95"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Publish {stagedWindows.length} Slot{stagedWindows.length > 1 ? 's' : ''}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── Toasts / Alerts ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-100"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            Availability published successfully!
          </motion.div>
        )}
        {submitMutation.isError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            {submitMutation.error?.message || 'Something went wrong. Please try again.'}
          </motion.div>
        )}
        {overlapWarning.length > 0 && (
          <motion.div
            key="overlap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-2xl text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>Skipped {overlapWarning.length} date{overlapWarning.length > 1 ? 's' : ''} — overlap with existing availability</p>
              <p className="text-amber-600 text-xs mt-0.5 font-medium">
                {overlapWarning.map(d => format(new Date(d + 'T12:00:00'), 'MMM d')).join(', ')}
              </p>
            </div>
            <button onClick={() => setOverlapWarning([])} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Stats Row ──────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Today's Sessions",
            value: todayCount,
            icon: Zap,
            color: 'text-accent',
            bg: 'bg-accent/8',
            loading: isLoadingToday,
          },
          {
            label: 'Upcoming',
            value: upcomingCount,
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            loading: isLoadingUpcoming,
          },
          {
            label: 'Published Slots',
            value: existingWindows.length,
            icon: Sparkles,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            loading: isLoadingExisting,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
            className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', stat.bg)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <div>
              {stat.loading ? (
                <div className="w-8 h-6 bg-slate-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              )}
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* ─── Calendar Panel ─────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
        >
          {/* Month nav */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-0.5">Availability</p>
              <p className="font-black text-slate-900 text-lg tracking-tight">
                {format(calendarMonth, 'MMMM yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCalendarMonth(prev => subMonths(prev, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all active:scale-90 text-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalendarMonth(new Date())}
                className="px-2.5 py-1 text-[10px] font-black text-accent border border-accent/20 bg-accent/5 rounded-lg uppercase tracking-widest hover:bg-accent/10 transition-all"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarMonth(prev => addMonths(prev, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all active:scale-90 text-slate-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="p-4 flex-1">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              {calendarDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isSelected = selectedDates.includes(dateStr);
                const isPastDay = isBefore(day, new Date()) && !isToday(day);
                const hasStaged = stagedDateSet.has(dateStr);
                const hasExisting = existingDateSet.has(dateStr);
                const today = isToday(day);

                return (
                  <button
                    key={dateStr}
                    disabled={isPastDay}
                    onClick={() => toggleDate(dateStr)}
                    className={cn(
                      'relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-150 text-sm font-semibold group',
                      isPastDay && 'opacity-25 cursor-not-allowed',
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md scale-[1.08]'
                        : today
                          ? 'bg-accent/10 text-accent font-black ring-1 ring-accent/20'
                          : 'hover:bg-slate-50 text-slate-700 active:scale-95'
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    <div className="flex gap-0.5 mt-0.5 h-1">
                      {hasExisting && (
                        <span className={cn('w-1 h-1 rounded-full', isSelected ? 'bg-emerald-400' : 'bg-emerald-500')} />
                      )}
                      {hasStaged && (
                        <span className={cn('w-1 h-1 rounded-full', isSelected ? 'bg-amber-300' : 'bg-amber-500')} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Published</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-slate-900" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected</span>
              </div>
            </div>
          </div>

          {/* Selected dates action area */}
          <AnimatePresence>
            {selectedDates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="border-t border-slate-100 overflow-hidden"
              >
                <div className="p-4 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black text-slate-800">
                      {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={() => setSelectedDates([])}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedDates.sort().map(d => (
                      <motion.span
                        key={d}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 shadow-sm"
                      >
                        {format(new Date(d + 'T12:00:00'), 'MMM d')}
                        <button onClick={() => toggleDate(d)} className="text-slate-300 hover:text-red-400 transition-colors ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full rounded-xl font-black gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Set Time Window
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Right Column ───────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-5">

          {/* Staged windows */}
          <AnimatePresence>
            {stagedWindows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="bg-amber-50 rounded-3xl border border-amber-200/60 overflow-hidden shadow-sm"
              >
                <div className="px-5 py-4 border-b border-amber-200/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                      <CalendarPlus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-amber-900 text-sm">Pending Publish</p>
                      <p className="text-[11px] text-amber-600 font-medium">{stagedWindows.length} slot{stagedWindows.length > 1 ? 's' : ''} ready to publish</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="rounded-xl font-black bg-amber-500 hover:bg-amber-600 text-white gap-2 shadow-sm text-xs h-9 px-4"
                  >
                    {submitMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Publish All
                  </Button>
                </div>
                <div className="p-4 space-y-2">
                  {stagedWindows.map((w, idx) => (
                    <motion.div
                      key={`${w.date}-${w.startTime}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-amber-100 shadow-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            {format(new Date(w.date + 'T12:00:00'), 'EEE, MMM d')}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {formatTimeLabel(w.startTime)} – {formatTimeLabel(w.endTime)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStaged(idx)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Today's Sessions */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-4.5 h-4.5 text-accent" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-base">Today's Sessions</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {format(new Date(), 'EEEE, MMMM d')}
                  </p>
                </div>
              </div>
              <span className={cn(
                'px-3 py-1 rounded-full text-[11px] font-black tracking-wide border',
                todayCount > 0
                  ? 'bg-accent/10 text-accent border-accent/20'
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              )}>
                {todayCount} {todayCount === 1 ? 'session' : 'sessions'}
              </span>
            </div>
            <div className="p-4">
              {isLoadingToday ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-[66px] bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : !todayBookingsData?.bookings?.length ? (
                <div className="flex items-center gap-4 py-5 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                    <Calendar className="w-4.5 h-4.5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">No sessions today</p>
                    <p className="text-xs text-slate-400 mt-0.5">Your schedule is clear. Time to plan ahead.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayBookingsData.bookings.map((b, idx) => (
                    <BookingCard key={b.bookingId || b.id || idx} booking={b} idx={idx} onJoin={handleJoin} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-base">Upcoming Sessions</p>
                  <p className="text-[11px] text-slate-400 font-medium">Future bookings</p>
                </div>
              </div>
              <span className={cn(
                'px-3 py-1 rounded-full text-[11px] font-black tracking-wide border',
                upcomingCount > 0
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              )}>
                {upcomingCount} {upcomingCount === 1 ? 'booking' : 'bookings'}
              </span>
            </div>
            <div className="p-4">
              {isLoadingUpcoming ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-[66px] bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : !upcomingBookingsData?.bookings?.length ? (
                <div className="flex items-center gap-4 py-5 px-4 bg-slate-50/40 rounded-2xl border border-dashed border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                    <CalendarPlus className="w-4.5 h-4.5 text-slate-200" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400">No upcoming bookings</p>
                    <p className="text-xs text-slate-300 mt-0.5">When clients book your slots, they'll appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingBookingsData.bookings.map((b, idx) => (
                    <BookingCard key={b.bookingId || b.id || `upcoming-${idx}`} booking={b} idx={idx} showDate onJoin={handleJoin} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Published Availability */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-base">Published Availability</p>
                  <p className="text-[11px] text-slate-400 font-medium">Active time slots</p>
                </div>
              </div>
              {existingWindows.length > 0 && (
                <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wide border bg-emerald-50 text-emerald-600 border-emerald-100">
                  {existingWindows.length} slots
                </span>
              )}
            </div>
            <div className="p-4">
              {isLoadingExisting ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : groupedExisting.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-dashed border-slate-200">
                    <Calendar className="w-6 h-6 text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 mb-1">No availability published</p>
                  <p className="text-xs text-slate-300">Select dates on the calendar to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {groupedExisting.map(({ date, windows }, groupIdx) => {
                    const dateObj = new Date(date + 'T12:00:00');
                    const isPastDate = isBefore(dateObj, new Date()) && !isToday(dateObj);
                    const isTodayDate = isToday(dateObj);
                    return (
                      <motion.div
                        key={date}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIdx * 0.04, duration: 0.3 }}
                        className={cn(
                          'rounded-2xl border overflow-hidden transition-all',
                          isPastDate
                            ? 'opacity-40 bg-slate-50 border-slate-100'
                            : isTodayDate
                              ? 'bg-accent/5 border-accent/20'
                              : 'bg-slate-50/60 border-slate-100 hover:border-slate-200'
                        )}
                      >
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100/60">
                          <div className="flex items-center gap-2">
                            <Calendar className={cn('w-3.5 h-3.5', isTodayDate ? 'text-accent' : 'text-slate-400')} />
                            <p className={cn(
                              'text-xs font-black uppercase tracking-widest',
                              isTodayDate ? 'text-accent' : 'text-slate-600'
                            )}>
                              {format(dateObj, 'EEE, MMM d')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isTodayDate && (
                              <span className="text-[9px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                Today
                              </span>
                            )}
                            {isPastDate && (
                              <span className="text-[9px] font-black text-slate-400 bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
                                Past
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-400">
                              {windows.length} window{windows.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="px-4 py-3 flex flex-wrap gap-2">
                          {windows.map((w, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm"
                            >
                              <Clock className={cn('w-3 h-3', isTodayDate ? 'text-accent' : 'text-emerald-500')} />
                              <span className="text-xs font-bold text-slate-700">
                                {formatTimeLabel(w.startTime)}
                              </span>
                              <span className="text-slate-300 text-xs">–</span>
                              <span className="text-xs font-bold text-slate-700">
                                {formatTimeLabel(w.endTime)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ─── Add Time Window Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowAddForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Set Time Window</h3>
                  <p className="text-sm text-slate-400 font-medium mt-0.5">
                    Applies to {selectedDates.length} selected date{selectedDates.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-90"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Selected dates chips */}
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {selectedDates.sort().map(d => (
                    <span key={d} className="px-2.5 py-1 bg-white text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 shadow-sm">
                      {format(new Date(d + 'T12:00:00'), 'MMM d')}
                    </span>
                  ))}
                </div>

                {/* Time pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">Start Time</label>
                    <select
                      value={newStart}
                      onChange={e => setNewStart(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold bg-slate-50 transition-all text-sm"
                    >
                      {TIMES.map(t => (
                        <option key={t} value={t}>{formatTimeLabel(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">End Time</label>
                    <select
                      value={newEnd}
                      onChange={e => setNewEnd(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold bg-slate-50 transition-all text-sm"
                    >
                      {TIMES.filter(t => t > newStart).map(t => (
                        <option key={t} value={t}>{formatTimeLabel(t)}</option>
                      ))}
                      <option value="23:59">11:59 PM</option>
                    </select>
                  </div>
                </div>

                {newStart >= newEnd && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    End time must be after start time
                  </motion.p>
                )}

                {/* Quick presets */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Quick Presets</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Morning', sub: '8:00 – 12:00', start: '08:00', end: '12:00', icon: '🌅' },
                      { label: 'Afternoon', sub: '1:00 – 5:00', start: '13:00', end: '17:00', icon: '☀️' },
                      { label: 'Evening', sub: '5:00 – 9:00', start: '17:00', end: '21:00', icon: '🌆' },
                      { label: 'Full Day', sub: 'All day', start: '00:00', end: '23:59', icon: '📅' },
                    ].map(p => {
                      const active = newStart === p.start && newEnd === p.end;
                      return (
                        <button
                          key={p.label}
                          onClick={() => { setNewStart(p.start); setNewEnd(p.end); }}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border transition-all',
                            active
                              ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          )}
                        >
                          <span className="text-base">{p.icon}</span>
                          <div>
                            <p className={cn('text-xs font-black', active ? 'text-white' : 'text-slate-800')}>{p.label}</p>
                            <p className={cn('text-[10px] font-medium', active ? 'text-white/60' : 'text-slate-400')}>{p.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 pb-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-xl font-semibold border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addWindowsForSelectedDates}
                  disabled={newStart >= newEnd}
                  className="flex-1 rounded-xl font-black bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  Add to {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
