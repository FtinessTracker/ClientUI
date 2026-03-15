import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, Video, MapPin, ChevronLeft, ChevronRight, User, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, MoveHorizontal as MoreHorizontal } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, isToday, isPast } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { trainerService } from '../../services/trainerService';
import { useAppUser } from '../../hooks/useAppUser';
import { BookingRow, AvailabilitySlotRow } from '../../types/trainer';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-50', icon: AlertCircle },
  confirmed: { label: 'Confirmed', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
  completed: { label: 'Done', color: 'text-slate-500', bg: 'bg-slate-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
  no_show: { label: 'No Show', color: 'text-orange-500', bg: 'bg-orange-50', icon: XCircle },
};

const CLIENT_AVATARS = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=60',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60',
];

function getAvatarForClient(clientId: string) {
  const hash = clientId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return CLIENT_AVATARS[hash % CLIENT_AVATARS.length];
}

export default function TrainerSchedule() {
  const { appUser } = useAppUser();
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: '09:00', end_time: '10:00' });
  const [activeTab, setActiveTab] = useState<'calendar' | 'availability'>('calendar');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', appUser?.id],
    queryFn: () => trainerService.getBookings(appUser!.id),
    enabled: !!appUser,
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['availability', appUser?.id],
    queryFn: () => trainerService.getAvailability(appUser!.id),
    enabled: !!appUser,
  });

  const addSlotMutation = useMutation({
    mutationFn: (slot: Omit<AvailabilitySlotRow, 'id' | 'created_at'>) =>
      trainerService.addAvailabilitySlot(slot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      setShowAvailabilityModal(false);
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (id: string) => trainerService.deleteAvailabilitySlot(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability'] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingRow['status'] }) =>
      trainerService.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setActionMenuId(null);
    },
  });

  const selectedDayBookings = bookings.filter(b =>
    isSameDay(new Date(b.scheduled_at), selectedDay)
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const upcomingBookings = bookings.filter(b =>
    (b.status === 'upcoming' || b.status === 'confirmed') && !isPast(new Date(b.scheduled_at))
  ).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Schedule</h1>
          <p className="text-slate-400 font-medium mt-1">Manage your sessions and availability</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAvailabilityModal(true)}
            className="rounded-2xl font-bold border-slate-200 gap-2"
          >
            <Clock className="w-4 h-4" />
            Set Availability
          </Button>
        </div>
      </motion.div>

      {/* Tab Toggle */}
      <div className="flex bg-slate-100 rounded-2xl p-1 w-fit">
        {(['calendar', 'availability'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded-xl font-bold text-sm capitalize transition-all',
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab === 'calendar' ? 'Calendar View' : 'Availability'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Weekly Calendar */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Week Navigation */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-900 text-lg">
                    {format(weekStart, 'MMMM yyyy')}
                  </p>
                  <p className="text-slate-400 text-sm font-medium">
                    Week of {format(weekStart, 'MMM d')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeekOffset(w => w - 1)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => { setWeekOffset(0); setSelectedDay(new Date()); }}
                    className="px-3 py-1.5 text-xs font-bold text-accent border border-accent/20 bg-accent/5 rounded-lg"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setWeekOffset(w => w + 1)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Day Columns */}
              <div className="grid grid-cols-7">
                {weekDays.map((day) => {
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.scheduled_at), day));
                  const isSelected = isSameDay(day, selectedDay);
                  const today = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        'p-3 text-center border-r border-slate-100 last:border-r-0 transition-all hover:bg-slate-50 min-h-[100px] flex flex-col items-center',
                        isSelected && 'bg-accent/5'
                      )}
                    >
                      <p className={cn(
                        'text-xs font-bold uppercase tracking-wider mb-2',
                        today ? 'text-accent' : 'text-slate-400'
                      )}>
                        {DAYS[day.getDay()]}
                      </p>
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black mb-2 transition-all',
                        isSelected ? 'bg-accent text-white shadow-lg shadow-accent/30' :
                        today ? 'bg-slate-900 text-white' : 'text-slate-700'
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        {dayBookings.slice(0, 3).map(b => (
                          <div
                            key={b.id}
                            className={cn(
                              'w-full h-1.5 rounded-full',
                              b.status === 'confirmed' || b.status === 'upcoming' ? 'bg-accent' :
                              b.status === 'completed' ? 'bg-slate-300' : 'bg-red-300'
                            )}
                          />
                        ))}
                        {dayBookings.length > 3 && (
                          <p className="text-[10px] text-slate-400 font-bold">+{dayBookings.length - 3}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Detail */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <p className="font-black text-slate-900">{format(selectedDay, 'EEEE')}</p>
                <p className="text-slate-400 font-medium text-sm">{format(selectedDay, 'MMMM d, yyyy')}</p>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto max-h-[340px]">
                {selectedDayBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold text-sm">No sessions scheduled</p>
                    <p className="text-slate-300 text-xs mt-1">Free day!</p>
                  </div>
                ) : (
                  selectedDayBookings.map(booking => {
                    const status = STATUS_CONFIG[booking.status];
                    const StatusIcon = status.icon;
                    return (
                      <div key={booking.id} className="relative p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={getAvatarForClient(booking.client_clerk_id)}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{booking.client_name}</p>
                              <p className="text-slate-400 text-xs font-medium">
                                {format(new Date(booking.scheduled_at), 'h:mm a')} · {booking.duration_minutes}min
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuId(actionMenuId === booking.id ? null : booking.id)}
                              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </button>
                            <AnimatePresence>
                              {actionMenuId === booking.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden w-44 z-20"
                                >
                                  {['confirmed', 'completed', 'cancelled', 'no_show'].map(s => (
                                    <button
                                      key={s}
                                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: s as BookingRow['status'] })}
                                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 capitalize"
                                    >
                                      Mark as {s.replace('_', ' ')}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {booking.session_type === 'virtual' ? (
                              <Video className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className="text-xs text-slate-400 font-medium capitalize">{booking.session_type}</span>
                          </div>
                          <span className={cn('text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-full', status.bg, status.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'availability' && (
          <motion.div
            key="availability"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900 text-lg">Weekly Availability</h2>
                <p className="text-slate-400 text-sm font-medium mt-0.5">Your recurring weekly schedule</p>
              </div>
              <Button
                onClick={() => setShowAvailabilityModal(true)}
                className="rounded-2xl font-bold gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </Button>
            </div>
            <div className="p-6">
              {availability.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No availability set yet</p>
                  <p className="text-slate-300 text-sm mt-1 mb-6">Add time blocks when you're available to train clients</p>
                  <Button onClick={() => setShowAvailabilityModal(true)} className="rounded-2xl font-bold gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Slot
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {DAYS.map((day, idx) => {
                    const daySlots = availability.filter(s => s.day_of_week === idx);
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={day} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-12 shrink-0">
                          <p className="font-black text-slate-900 text-sm">{day}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 flex-1">
                          {daySlots.map(slot => (
                            <div
                              key={slot.id}
                              className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
                            >
                              <Clock className="w-3.5 h-3.5 text-accent" />
                              {slot.start_time} – {slot.end_time}
                              <button
                                onClick={() => deleteSlotMutation.mutate(slot.id)}
                                className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Sessions quick list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-black text-slate-900 text-lg">Upcoming Sessions</h2>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium">No upcoming sessions</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingBookings.map(booking => {
              const status = STATUS_CONFIG[booking.status];
              const StatusIcon = status.icon;
              const date = new Date(booking.scheduled_at);
              return (
                <div key={booking.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">{format(date, 'EEE')}</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{format(date, 'd')}</p>
                    <p className="text-xs font-bold text-slate-400">{format(date, 'MMM')}</p>
                  </div>
                  <div className="w-px h-10 bg-slate-100 shrink-0" />
                  <img
                    src={getAvatarForClient(booking.client_clerk_id)}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{booking.client_name}</p>
                    <p className="text-sm text-slate-400 font-medium">{format(date, 'h:mm a')} · {booking.duration_minutes} min</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn('text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5', status.bg, status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    <span className="font-black text-slate-900">${booking.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Add Availability Modal */}
      <AnimatePresence>
        {showAvailabilityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowAvailabilityModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-black text-slate-900 mb-6">Add Availability Slot</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Day of Week</label>
                  <select
                    value={newSlot.day_of_week}
                    onChange={e => setNewSlot(p => ({ ...p, day_of_week: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium"
                  >
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                    <select
                      value={newSlot.start_time}
                      onChange={e => setNewSlot(p => ({ ...p, start_time: e.target.value }))}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium"
                    >
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                    <select
                      value={newSlot.end_time}
                      onChange={e => setNewSlot(p => ({ ...p, end_time: e.target.value }))}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium"
                    >
                      {TIMES.filter(t => t > newSlot.start_time).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="flex-1 rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => addSlotMutation.mutate({
                    trainer_clerk_id: appUser!.id,
                    ...newSlot,
                    is_active: true,
                  })}
                  isLoading={addSlotMutation.isPending}
                  className="flex-1 rounded-2xl font-bold"
                >
                  Add Slot
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
