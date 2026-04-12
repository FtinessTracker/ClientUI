import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Plus, Trash2, Video, MapPin,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Globe, Send, X, CalendarPlus, Loader2, Play, Users as UsersIcon,
  MoveHorizontal as MoreHorizontal,
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, isToday, isPast, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isBefore } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useAppUser } from '../../hooks/useAppUser';
import { API_BASE_URL } from '../../config';
import { getSystemTimezone } from '../../lib/timezone';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AvailabilityWindow {
  date: string;       // "2026-04-10"
  startTime: string;  // "08:00"
  endTime: string;    // "12:00"
}

interface SubmitPayload {
  trainerId: string;
  timezone: string;
  availabilityWindows: AvailabilityWindow[];
}

// Matches the actual API response shape
interface ApiWindowEntry {
  windowId: string;
  startTime: string;
  endTime: string;
}

interface ApiAvailabilityDay {
  date: string;
  window: ApiWindowEntry[];
}

// Flattened for display
interface ExistingWindow {
  date: string;
  windowId: string;
  startTime: string;
  endTime: string;
}

interface TodayBooking {
  id: string;
  bookingId?: string; // Support both id and bookingId
  clientId?: string;  // Added for video join
  trainerId?: string; // Added for video join
  clientName: string;
  clientAvatar?: string;
  date?: string; // Optional for today, required for upcoming
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

// ─── Component ───────────────────────────────────────────────────────────────
export default function TrainerSchedule() {
  const navigate = useNavigate();
  const { appUser } = useAppUser();
  const queryClient = useQueryClient();

  const trainerId = appUser?.id || '';
  const timezone = getSystemTimezone();

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Staged availability windows (the "cart")
  const [stagedWindows, setStagedWindows] = useState<AvailabilityWindow[]>([]);

  // Add-window form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('12:00');

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // ─── Fetch existing availability ─────────────────────────────────────────
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

  // ─── Fetch today's bookings ──────────────────────────────────────────────
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

  // ─── Fetch upcoming bookings ──────────────────────────────────────────
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

  // Flatten the nested API response into a flat array
  const existingWindows: ExistingWindow[] = useMemo(() => {
    const days: ApiAvailabilityDay[] = existingData?.availabilityWindow || [];
    const flat: ExistingWindow[] = [];
    days.forEach(day => {
      (day.window || []).forEach(w => {
        flat.push({
          date: day.date,
          windowId: w.windowId,
          startTime: w.startTime,
          endTime: w.endTime,
        });
      });
    });
    return flat;
  }, [existingData]);

  // ─── Submit mutation ─────────────────────────────────────────────────────
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
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  // ─── Calendar Helpers ────────────────────────────────────────────────────
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0=Sun

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  // ─── Overlap check helper ─────────────────────────────────────────────────
  const hasOverlap = (date: string, start: string, end: string) => {
    // Check against published windows
    const publishedOnDate = existingWindows.filter(w => w.date === date);
    for (const w of publishedOnDate) {
      if (start < w.endTime && end > w.startTime) return true;
    }
    // Check against already-staged windows
    const stagedOnDate = stagedWindows.filter(w => w.date === date);
    for (const w of stagedOnDate) {
      if (start < w.endTime && end > w.startTime) return true;
    }
    return false;
  };

  // ─── Add windows for all selected dates ──────────────────────────────────
  const [overlapWarning, setOverlapWarning] = useState<string[]>([]);

  const addWindowsForSelectedDates = () => {
    if (selectedDates.length === 0) return;
    if (newStart >= newEnd) return;

    const added: AvailabilityWindow[] = [];
    const skipped: string[] = [];

    selectedDates.forEach(date => {
      if (hasOverlap(date, newStart, newEnd)) {
        skipped.push(date);
      } else {
        added.push({ date, startTime: newStart, endTime: newEnd });
      }
    });

    if (skipped.length > 0) {
      setOverlapWarning(skipped);
      setTimeout(() => setOverlapWarning([]), 4000);
    }

    if (added.length > 0) {
      setStagedWindows(prev => [...prev, ...added]);
    }
    setShowAddForm(false);
    setSelectedDates([]);
  };

  const removeStaged = (index: number) => {
    setStagedWindows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (stagedWindows.length === 0) return;
    submitMutation.mutate({
      trainerId,
      timezone,
      availabilityWindows: stagedWindows,
    });
  };

  // Group existing windows by date
  const groupedExisting = useMemo(() => {
    const days: ApiAvailabilityDay[] = existingData?.availabilityWindow || [];
    return days
      .map(day => ({
        date: day.date,
        windows: day.window || [],
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [existingData]);

  // Dates that have staged windows (for calendar dots)
  const stagedDateSet = new Set(stagedWindows.map(w => w.date));
  const existingDateSet = new Set(existingWindows.map(w => w.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">My Schedule</h1>
          <p className="text-slate-400 font-medium mt-1 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Set your available hours · {timezone}
          </p>
        </div>
        <div className="flex gap-3">
          {stagedWindows.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="rounded-2xl font-black bg-accent hover:bg-emerald-600 text-white gap-2 shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish {stagedWindows.length} Slot{stagedWindows.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl font-bold text-sm shadow-lg"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Availability published successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {submitMutation.isError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-red-400" />
          {submitMutation.error?.message || 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Overlap Warning */}
      <AnimatePresence>
        {overlapWarning.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl font-bold text-sm"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p>Skipped {overlapWarning.length} date{overlapWarning.length > 1 ? 's' : ''} — overlapping with existing availability:</p>
              <p className="text-amber-600 text-xs font-medium mt-1">
                {overlapWarning.map(d => format(new Date(d + 'T12:00:00'), 'MMM d')).join(', ')}
              </p>
            </div>
            <button onClick={() => setOverlapWarning([])} className="ml-auto text-amber-400 hover:text-amber-600 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* ─── Calendar + Date Picker ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Month Navigation */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-1">Select Dates</p>
              <p className="font-black text-slate-900 text-xl tracking-tight">
                {format(calendarMonth, 'MMMM yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarMonth(prev => subMonths(prev, 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => setCalendarMonth(new Date())}
                className="px-3 py-1.5 text-[10px] font-black text-accent border border-accent/20 bg-accent/5 rounded-lg uppercase tracking-widest hover:bg-accent/10 transition-all"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarMonth(prev => addMonths(prev, 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-90"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-5">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding for days before month starts */}
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="h-12" />
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
                      "relative h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-200 group",
                      isPastDay && "opacity-30 cursor-not-allowed",
                      isSelected
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                        : today
                          ? "bg-accent/10 text-accent font-black hover:bg-accent/20"
                          : "hover:bg-slate-50 text-slate-700 active:scale-95"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-bold",
                      isSelected && "text-white",
                      today && !isSelected && "text-accent"
                    )}>
                      {format(day, 'd')}
                    </span>

                    {/* Indicator dots */}
                    <div className="flex gap-0.5 mt-0.5">
                      {hasExisting && (
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-emerald-400" : "bg-emerald-500"
                        )} />
                      )}
                      {hasStaged && (
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-amber-400" : "bg-amber-500"
                        )} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Published</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</span>
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
                className="border-t border-slate-100"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black text-slate-900">
                      {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={() => setSelectedDates([])}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedDates.sort().map(d => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg"
                      >
                        {format(new Date(d + 'T12:00:00'), 'MMM d')}
                        <button onClick={() => toggleDate(d)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full rounded-2xl font-black gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all active:scale-95"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Add Time Window
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Right Column: Today's Sessions + Staged + Existing ─────────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-1">Live Schedule</p>
                <h2 className="font-black text-slate-900 text-lg tracking-tight">Today's Sessions</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-accent/5 text-accent px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-accent/10">
                {todayBookingsData?.totalBookings || 0} SESSIONS
              </div>
            </div>

            <div className="p-5">
              {isLoadingToday ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 text-slate-300 animate-spin mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-medium">Loading today's schedule...</p>
                </div>
              ) : !todayBookingsData?.bookings || todayBookingsData.bookings.length === 0 ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">No sessions scheduled for today</p>
                    <p className="text-[11px] text-slate-400 font-medium">Your agenda is clear! Use this time to update your availability.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookingsData.bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {booking.clientAvatar ? (
                            <img src={booking.clientAvatar} alt={booking.clientName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                              <UsersIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{booking.clientName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-accent" />
                            <span className="text-xs font-bold text-slate-400">
                              {formatTimeLabel(booking.startTime)} – {formatTimeLabel(booking.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(booking.meetingId || booking.bookingId || booking.id) && (
                          <Button 
                            className="h-9 px-4 rounded-xl text-xs font-black gap-2 bg-accent hover:bg-emerald-600 shadow-sm"
                            onClick={() => {
                              const roomId = booking.meetingId || booking.bookingId || booking.id;
                              navigate(`/session/${roomId}`, { 
                                state: { 
                                  bookingId: booking.bookingId || booking.id,
                                  meetingId: booking.meetingId,
                                  trainerId: booking.trainerId || todayBookingsData?.trainerId,
                                  clientId: booking.clientId
                                } 
                              });
                            }}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Join
                          </Button>
                        )}
                        <Button variant="ghost" className="w-9 h-9 p-0 rounded-xl hover:bg-slate-50">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Coming Up</p>
                <h2 className="font-black text-slate-900 text-lg tracking-tight">Upcoming Sessions</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-slate-100">
                {upcomingBookingsData?.totalBookings || 0} TOTAL
              </div>
            </div>

            <div className="p-5">
              {isLoadingUpcoming ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 text-slate-200 animate-spin mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-medium">Checking your future agenda...</p>
                </div>
              ) : !upcomingBookingsData?.bookings || upcomingBookingsData.bookings.length === 0 ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50/20 rounded-2xl border border-dashed border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <CalendarPlus className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400">No and upcoming sessions</p>
                    <p className="text-[11px] text-slate-400/70 font-medium">When clients book your newly added slots, they'll appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookingsData.bookings.map(booking => (
                    <div key={booking.id || booking.bookingId} className="flex items-center justify-between p-4 bg-slate-50/30 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-sm">
                          {booking.clientAvatar ? (
                            <img src={booking.clientAvatar} alt={booking.clientName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                              <UsersIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-black text-slate-900">{booking.clientName}</p>
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] font-black rounded uppercase tracking-wider">
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
                                {booking.date ? format(new Date(booking.date + 'T12:00:00'), 'EEE, MMM d') : 'No Date'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-400">
                                {formatTimeLabel(booking.startTime)} – {formatTimeLabel(booking.endTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(booking.meetingId || booking.bookingId || booking.id) && (
                          <Button 
                            className="h-9 px-4 rounded-xl text-xs font-black gap-2 bg-accent hover:bg-emerald-600 shadow-sm"
                            onClick={() => {
                              const roomId = booking.meetingId || booking.bookingId || booking.id;
                              navigate(`/session/${roomId}`, { 
                                state: { 
                                  bookingId: booking.bookingId || booking.id,
                                  meetingId: booking.meetingId,
                                  trainerId: booking.trainerId || upcomingBookingsData?.trainerId,
                                  clientId: booking.clientId
                                } 
                              });
                            }}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Join
                          </Button>
                        )}
                        <Button variant="ghost" className="w-9 h-9 p-0 rounded-xl hover:bg-white hover:shadow-sm">
                          <MoreHorizontal className="w-4 h-4 text-slate-300" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>



          {/* Existing Published Availability */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Active</p>
                <h2 className="font-black text-slate-900 text-lg tracking-tight">Published Availability</h2>
              </div>
              {existingWindows.length > 0 && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-emerald-100">
                  {existingWindows.length} SLOTS
                </div>
              )}
            </div>

            <div className="p-5">
              {isLoadingExisting ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-slate-300 animate-spin mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Loading availability...</p>
                </div>
              ) : groupedExisting.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-sm font-bold mb-1">No availability published yet</p>
                  <p className="text-slate-300 text-xs">Your published time slots will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {groupedExisting.map(({ date, windows }) => {
                    const dateObj = new Date(date + 'T12:00:00');
                    const isPastDate = isBefore(dateObj, new Date()) && !isToday(dateObj);
                    return (
                      <div
                        key={date}
                        className={cn(
                          "bg-slate-50 rounded-2xl p-4 border border-slate-100 transition-all",
                          isPastDate && "opacity-50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                            {format(dateObj, 'EEE, MMM d')}
                          </p>
                          {isPastDate && (
                            <span className="text-[9px] font-black text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Past
                            </span>
                          )}
                          {isToday(dateObj) && (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-100">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {windows.map((w, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-600"
                            >
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{formatTimeLabel(w.startTime)}</span>
                              <span className="text-slate-300">–</span>
                              <span>{formatTimeLabel(w.endTime)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Add Time Window Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowAddForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Add Time Window</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    Applies to {selectedDates.length} selected date{selectedDates.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Selected dates preview */}
              <div className="flex flex-wrap gap-1.5 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {selectedDates.sort().map(d => (
                  <span key={d} className="px-2.5 py-1 bg-white text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200 shadow-sm">
                    {format(new Date(d + 'T12:00:00'), 'MMM d')}
                  </span>
                ))}
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2">Start Time</label>
                    <select
                      value={newStart}
                      onChange={e => setNewStart(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold bg-slate-50 transition-all"
                    >
                      {TIMES.map(t => (
                        <option key={t} value={t}>{formatTimeLabel(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2">End Time</label>
                    <select
                      value={newEnd}
                      onChange={e => setNewEnd(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold bg-slate-50 transition-all"
                    >
                      {TIMES.filter(t => t > newStart).map(t => (
                        <option key={t} value={t}>{formatTimeLabel(t)}</option>
                      ))}
                      <option value="23:59">11:59 PM</option>
                    </select>
                  </div>
                </div>

                {newStart >= newEnd && (
                  <p className="text-red-500 text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    End time must be after start time
                  </p>
                )}

                {/* Quick presets */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Quick Presets</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Morning', start: '08:00', end: '12:00' },
                      { label: 'Afternoon', start: '13:00', end: '17:00' },
                      { label: 'Evening', start: '17:00', end: '21:00' },
                      { label: 'Full Day', start: '00:00', end: '23:59' },
                    ].map(p => (
                      <button
                        key={p.label}
                        onClick={() => { setNewStart(p.start); setNewEnd(p.end); }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                          newStart === p.start && newEnd === p.end
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-2xl font-bold border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addWindowsForSelectedDates}
                  disabled={newStart >= newEnd}
                  className="flex-1 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 text-white gap-2 transition-all"
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
