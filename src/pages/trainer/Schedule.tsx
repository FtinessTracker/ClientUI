import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Plus, Video, ChevronLeft, ChevronRight,
  CircleCheck as CheckCircle, CircleAlert as AlertCircle, Globe,
  Send, X, CalendarPlus, Loader as Loader2, Play, Zap,
  TrendingUp, Sparkles, ArrowRight,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isBefore, isToday,
} from 'date-fns';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useAppUser } from '../../hooks/useAppUser';
import { API_BASE_URL } from '../../config';
import { getSystemTimezone } from '../../lib/timezone';

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
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-amber-500',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function ClientAvatar({ name, avatar, size = 'md' }: { name: string; avatar?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const sz = sizeMap[size];
  if (avatar) {
    return <img src={avatar} alt={name} className={cn(sz, 'rounded-full object-cover ring-2 ring-white')} />;
  }
  return (
    <div className={cn(sz, 'rounded-full flex items-center justify-center font-bold text-white shrink-0 ring-2 ring-white', getAvatarColor(name))}>
      {getInitials(name)}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  const cls = map[status?.toLowerCase()] || 'bg-slate-100 text-slate-500';
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize', cls)}>
      {status}
    </span>
  );
}

function SessionRow({ booking, idx, showDate = false, onJoin }: {
  booking: TodayBooking;
  idx: number;
  showDate?: boolean;
  onJoin: (b: TodayBooking) => void;
}) {
  const canJoin = !!(booking.meetingId || booking.bookingId || booking.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.3, ease: 'easeOut' }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors rounded-xl group"
    >
      <ClientAvatar name={booking.clientName} avatar={booking.clientAvatar} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-slate-900 truncate">{booking.clientName}</p>
          <StatusPill status={booking.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {showDate && booking.date && (
            <span className="font-medium">
              {format(new Date(booking.date + 'T12:00:00'), 'EEE, MMM d')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeLabel(booking.startTime)} – {formatTimeLabel(booking.endTime)}
          </span>
        </div>
      </div>

      {canJoin && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onJoin(booking)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors shrink-0"
        >
          <Play className="w-3 h-3 fill-current" />
          Join
        </motion.button>
      )}
    </motion.div>
  );
}

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
      const res = await fetch(`${API_BASE_URL}/api/trainer/${trainerId}/bookings/today`, { credentials: 'include' });
      if (!res.ok) return { trainerId, totalBookings: 0, bookings: [] };
      return res.json();
    },
    enabled: !!trainerId,
  });

  const { data: upcomingBookingsData, isLoading: isLoadingUpcoming } = useQuery<TodayBookingsResponse>({
    queryKey: ['trainer-bookings-upcoming', trainerId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/trainer/${trainerId}/bookings/upcoming`, { credentials: 'include' });
      if (!res.ok) return { trainerId, totalBookings: 0, bookings: [] };
      return res.json();
    },
    enabled: !!trainerId,
  });

  const existingWindows: ExistingWindow[] = useMemo(() => {
    const days: ApiAvailabilityDay[] = existingData?.availabilityWindow || [];
    return days.flatMap(day =>
      (day.window || []).map(w => ({ date: day.date, windowId: w.windowId, startTime: w.startTime, endTime: w.endTime }))
    );
  }, [existingData]);

  const submitMutation = useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      const res = await fetch(`${API_BASE_URL}/api/trainer/${trainerId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || 'Failed to save availability');
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
    const windows = [...existingWindows.filter(w => w.date === date), ...stagedWindows.filter(w => w.date === date)];
    return windows.some(w => start < w.endTime && end > w.startTime);
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

  const removeStaged = (index: number) => setStagedWindows(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (stagedWindows.length === 0) return;
    submitMutation.mutate({ trainerId, timezone, availabilityWindows: stagedWindows });
  };

  const handleJoin = (booking: TodayBooking) => {
    const roomId = booking.meetingId || booking.bookingId || booking.id;
    navigate(`/session/${roomId}`, {
      state: { bookingId: booking.bookingId || booking.id, meetingId: booking.meetingId, trainerId: appUser?.id, clientId: booking.clientId },
    });
  };

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const groupedExisting = useMemo(() => {
    const days: ApiAvailabilityDay[] = existingData?.availabilityWindow || [];
    return days
      .filter(day => day.date >= todayStr)
      .map(day => ({ date: day.date, windows: day.window || [] }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [existingData, todayStr]);

  const stagedDateSet = new Set(stagedWindows.map(w => w.date));
  const existingDateSet = new Set(existingWindows.map(w => w.date));

  const todayCount = todayBookingsData?.totalBookings || 0;
  const upcomingCount = upcomingBookingsData?.totalBookings || 0;
  const futureSlotCount = groupedExisting.reduce((acc, g) => acc + g.windows.length, 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Schedule</h1>
          <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            {timezone}
          </p>
        </div>

        <AnimatePresence>
          {stagedWindows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="rounded-xl font-semibold bg-slate-900 hover:bg-slate-700 text-white gap-2 h-10 px-5 shadow-sm"
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publish {stagedWindows.length} Slot{stagedWindows.length > 1 ? 's' : ''}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            Availability published successfully.
          </motion.div>
        )}
        {submitMutation.isError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            {submitMutation.error?.message || 'Something went wrong. Please try again.'}
          </motion.div>
        )}
        {overlapWarning.length > 0 && (
          <motion.div
            key="overlap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              Skipped {overlapWarning.length} date{overlapWarning.length > 1 ? 's' : ''} — overlap with existing availability:&nbsp;
              <span className="font-semibold">{overlapWarning.map(d => format(new Date(d + 'T12:00:00'), 'MMM d')).join(', ')}</span>
            </div>
            <button onClick={() => setOverlapWarning([])} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today's Sessions", value: todayCount, icon: Zap, iconColor: 'text-emerald-600', bg: 'bg-emerald-50', loading: isLoadingToday },
          { label: 'Upcoming Bookings', value: upcomingCount, icon: TrendingUp, iconColor: 'text-blue-600', bg: 'bg-blue-50', loading: isLoadingUpcoming },
          { label: 'Available Slots', value: futureSlotCount, icon: Sparkles, iconColor: 'text-amber-600', bg: 'bg-amber-50', loading: isLoadingExisting },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', stat.bg)}>
              <stat.icon className={cn('w-4.5 h-4.5', stat.iconColor)} />
            </div>
            <div>
              {stat.loading ? (
                <div className="w-7 h-5 bg-slate-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-xl font-bold text-slate-900 leading-none">{stat.value}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
        >
          {/* Month nav */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-0.5">Availability Calendar</p>
              <p className="font-bold text-slate-900 text-base tracking-tight">
                {format(calendarMonth, 'MMMM yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCalendarMonth(prev => subMonths(prev, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalendarMonth(new Date())}
                className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all tracking-wide"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarMonth(prev => addMonths(prev, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="p-4 flex-1">
            <div className="grid grid-cols-7 mb-2">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-slate-300 uppercase tracking-wider py-1.5">
                  {d[0]}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              {calendarDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isSelected = selectedDates.includes(dateStr);
                const isPastDay = isBefore(day, today) && !isToday(day);
                const hasStaged = stagedDateSet.has(dateStr);
                const hasExisting = existingDateSet.has(dateStr);
                const todayDay = isToday(day);

                return (
                  <button
                    key={dateStr}
                    disabled={isPastDay}
                    onClick={() => toggleDate(dateStr)}
                    className={cn(
                      'relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-150 text-sm font-medium mx-0.5',
                      isPastDay && 'opacity-20 cursor-not-allowed',
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm scale-105'
                        : todayDay
                          ? 'bg-blue-50 text-blue-600 font-semibold ring-1 ring-blue-200'
                          : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <span className="text-[13px] leading-none">{format(day, 'd')}</span>
                    <div className="flex gap-0.5 mt-1 h-1">
                      {hasExisting && (
                        <span className={cn('w-1 h-1 rounded-full', isSelected ? 'bg-emerald-400' : 'bg-emerald-500')} />
                      )}
                      {hasStaged && (
                        <span className={cn('w-1 h-1 rounded-full', isSelected ? 'bg-amber-300' : 'bg-amber-400')} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-slate-400">Published</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] font-medium text-slate-400">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-md bg-slate-900" />
                <span className="text-[10px] font-medium text-slate-400">Selected</span>
              </div>
            </div>
          </div>

          {/* Selected dates action */}
          <AnimatePresence>
            {selectedDates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="border-t border-slate-100 overflow-hidden"
              >
                <div className="p-4 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={() => setSelectedDates([])}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedDates.sort().map(d => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200"
                      >
                        {format(new Date(d + 'T12:00:00'), 'MMM d')}
                        <button onClick={() => toggleDate(d)} className="text-slate-300 hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full rounded-xl font-semibold gap-2 bg-slate-900 hover:bg-slate-800 text-white h-9 text-sm shadow-sm"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Set Time Window
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-7 space-y-4">

          {/* Staged windows */}
          <AnimatePresence>
            {stagedWindows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="bg-amber-50 rounded-2xl border border-amber-200/80 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
                      <CalendarPlus className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Ready to Publish</p>
                      <p className="text-[11px] text-amber-600">{stagedWindows.length} slot{stagedWindows.length > 1 ? 's' : ''} staged</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="rounded-lg font-semibold bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-sm text-xs h-8 px-3"
                  >
                    {submitMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Publish All
                  </Button>
                </div>
                <div className="p-3 space-y-1.5">
                  {stagedWindows.map((w, idx) => (
                    <motion.div
                      key={`${w.date}-${w.startTime}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-amber-100 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {format(new Date(w.date + 'T12:00:00'), 'EEE, MMM d')}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatTimeLabel(w.startTime)} – {formatTimeLabel(w.endTime)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStaged(idx)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Today's Sessions</p>
                  <p className="text-[11px] text-slate-400">{format(new Date(), 'EEEE, MMMM d')}</p>
                </div>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium',
                todayCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
              )}>
                {todayCount} {todayCount === 1 ? 'session' : 'sessions'}
              </span>
            </div>

            <div className="divide-y divide-slate-50">
              {isLoadingToday ? (
                <div className="p-4 space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}
                </div>
              ) : !todayBookingsData?.bookings?.length ? (
                <div className="flex items-center gap-3 px-5 py-5">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">No sessions scheduled today</p>
                    <p className="text-xs text-slate-400 mt-0.5">Your schedule is clear for today.</p>
                  </div>
                </div>
              ) : (
                todayBookingsData.bookings.map((b, idx) => (
                  <SessionRow key={b.bookingId || b.id || idx} booking={b} idx={idx} onJoin={handleJoin} />
                ))
              )}
            </div>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Upcoming Sessions</p>
                  <p className="text-[11px] text-slate-400">Future bookings</p>
                </div>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium',
                upcomingCount > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'
              )}>
                {upcomingCount} {upcomingCount === 1 ? 'booking' : 'bookings'}
              </span>
            </div>

            <div className="divide-y divide-slate-50">
              {isLoadingUpcoming ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}
                </div>
              ) : !upcomingBookingsData?.bookings?.length ? (
                <div className="flex items-center gap-3 px-5 py-5">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarPlus className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">No upcoming bookings</p>
                    <p className="text-xs text-slate-400 mt-0.5">Clients will appear here once they book a slot.</p>
                  </div>
                </div>
              ) : (
                upcomingBookingsData.bookings.map((b, idx) => (
                  <SessionRow key={b.bookingId || b.id || `up-${idx}`} booking={b} idx={idx} showDate onJoin={handleJoin} />
                ))
              )}
            </div>
          </motion.div>

          {/* Published Availability — future only */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Published Availability</p>
                  <p className="text-[11px] text-slate-400">Upcoming open slots</p>
                </div>
              </div>
              {groupedExisting.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700">
                  {futureSlotCount} {futureSlotCount === 1 ? 'slot' : 'slots'}
                </span>
              )}
            </div>

            <div className="p-4">
              {isLoadingExisting ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
                </div>
              ) : groupedExisting.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-dashed border-slate-200">
                    <Calendar className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">No upcoming availability</p>
                  <p className="text-xs text-slate-300">Select dates on the calendar to publish your availability.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
                  {groupedExisting.map(({ date, windows }, groupIdx) => {
                    const dateObj = new Date(date + 'T12:00:00');
                    const todayDate = isToday(dateObj);
                    return (
                      <motion.div
                        key={date}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIdx * 0.04, duration: 0.25 }}
                        className={cn(
                          'rounded-xl border overflow-hidden',
                          todayDate
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors'
                        )}
                      >
                        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100/80">
                          <div className="flex items-center gap-2">
                            {todayDate && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                            <p className={cn(
                              'text-[11px] font-semibold uppercase tracking-wide',
                              todayDate ? 'text-emerald-700' : 'text-slate-500'
                            )}>
                              {format(dateObj, 'EEE, MMM d')}
                              {todayDate && <span className="ml-1.5 text-emerald-500 normal-case tracking-normal font-medium">Today</span>}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {windows.length} {windows.length === 1 ? 'window' : 'windows'}
                          </p>
                        </div>
                        <div className="px-3.5 py-2.5 flex flex-wrap gap-2">
                          {windows.map((w, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm"
                            >
                              <Clock className={cn('w-3 h-3', todayDate ? 'text-emerald-500' : 'text-slate-400')} />
                              <span className="text-[11px] font-medium text-slate-700">
                                {formatTimeLabel(w.startTime)} – {formatTimeLabel(w.endTime)}
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

      {/* Add Time Window Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowAddForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Set Time Window</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Applies to {selectedDates.length} selected date{selectedDates.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {selectedDates.sort().map(d => (
                    <span key={d} className="px-2 py-1 bg-white text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200">
                      {format(new Date(d + 'T12:00:00'), 'MMM d')}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Time</label>
                    <select
                      value={newStart}
                      onChange={e => setNewStart(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium bg-white transition-all"
                    >
                      {TIMES.map(t => <option key={t} value={t}>{formatTimeLabel(t)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Time</label>
                    <select
                      value={newEnd}
                      onChange={e => setNewEnd(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium bg-white transition-all"
                    >
                      {TIMES.filter(t => t > newStart).map(t => <option key={t} value={t}>{formatTimeLabel(t)}</option>)}
                      <option value="23:59">11:59 PM</option>
                    </select>
                  </div>
                </div>

                {newStart >= newEnd && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    End time must be after start time
                  </p>
                )}

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-2">Quick Presets</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Morning', sub: '8:00 – 12:00 AM', start: '08:00', end: '12:00' },
                      { label: 'Afternoon', sub: '1:00 – 5:00 PM', start: '13:00', end: '17:00' },
                      { label: 'Evening', sub: '5:00 – 9:00 PM', start: '17:00', end: '21:00' },
                      { label: 'Full Day', sub: 'All day', start: '00:00', end: '23:59' },
                    ].map(p => {
                      const active = newStart === p.start && newEnd === p.end;
                      return (
                        <button
                          key={p.label}
                          onClick={() => { setNewStart(p.start); setNewEnd(p.end); }}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl text-left border transition-all',
                            active
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          )}
                        >
                          <div>
                            <p className={cn('text-xs font-semibold', active ? 'text-white' : 'text-slate-800')}>{p.label}</p>
                            <p className={cn('text-[10px]', active ? 'text-white/60' : 'text-slate-400')}>{p.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-xl font-medium border-slate-200 text-slate-600 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addWindowsForSelectedDates}
                  disabled={newStart >= newEnd}
                  className="flex-1 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-2 h-10 shadow-sm disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  Add to {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
