import React, { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, CreditCard, CircleCheck as CheckCircle2, ArrowLeft, ShieldCheck, Zap, ChevronLeft, ChevronRight, Sunrise, Sun, Moon, Play, Loader as Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';
import { API_BASE_URL } from '../../config';
import { useUser } from '@clerk/clerk-react';
import { getSystemTimezone } from '../../lib/timezone';

type Step = 'select-slot' | 'payment' | 'confirmation';

const STEPS = [
  { id: 'select-slot', label: 'Schedule' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Confirmed' },
];

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
};

export default function BookingFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    trainerName?: string; 
    trainerAvatar?: string; 
    specialties?: string[];
    selectedDate?: string;
  } | null;
  const { user } = useUser();
  const [step, setStep] = useState<Step>('select-slot');

  // Initialize selectedDate from state if available, otherwise default to today
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (state?.selectedDate) return new Date(state.selectedDate);
    return new Date();
  });

  // Start of the week for the day picker
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => startOfWeek(selectedDate, { weekStartsOn: 1 }));

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>('60');
  const [bookingResult, setBookingResult] = useState<any>(null);

  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/booking/trainers/available?date=${dateStr}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const found = data.trainers?.find((t: any) => t.trainerId === id);
        if (found) {
          return {
            id: found.trainerId,
            name: found.trainerName,
            specialties: ['Personal Training'], // Fallback specialty
            pricePerHour: 80, // Default price
            avatar: found.profileImageUrl
          };
        }
      }
      
      // Secondary fallback from state
      return {
        id: id!,
        name: state?.trainerName || 'Selected Trainer',
        specialties: state?.specialties || ['Personal Training'],
        pricePerHour: 80,
        avatar: state?.trainerAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=trainer'
      };
    },
  });

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const prevWeek = () => setWeekStartDate(prev => addDays(prev, -7));
  const nextWeek = () => setWeekStartDate(prev => addDays(prev, 7));

  // Generate 7 days for the current week view
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));

  const { data: slotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['trainer-slots', id, dateStr],
    queryFn: () => {
      return fetch(`${API_BASE_URL}/api/booking/trainers/${id}/slots?date=${dateStr}&trainerId=${id}&clientTimezone=${getSystemTimezone()}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null);
    },
    enabled: !!id
  });

  const availableSlots = slotsData?.slotsByDuration?.[selectedDuration] || [];

  const groupedSlots = React.useMemo(() => {
    const morning: any[] = [];
    const afternoon: any[] = [];
    const evening: any[] = [];

    availableSlots.forEach((slot: any) => {
      const hour = parseInt(slot.startTime.split(':')[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  }, [availableSlots]);

  const selectedSlot = availableSlots.find((s: any) => s.startTime === selectedTime);

  if (isLoading) return <BookingSkeleton />;
  if (!trainer) return <div className="text-center py-32 text-slate-400">Trainer not found</div>;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        trainerId: id,
        trainerName: trainer?.name || 'Selected Trainer',
        clientId: user?.id || 'unknown_client',
        clientName: user?.fullName || user?.firstName || 'Current User',
        durationInMinutes: parseInt(selectedDuration) || 60,
        date: dateStr,
        startTime: selectedTime,
        clientTimezone: getSystemTimezone()
      };

      const res = await fetch(`${API_BASE_URL}/api/booking/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setBookingResult(data);
      } else {
        console.error('Booking failed API call');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setStep('confirmation');
    }
  };

  const currentIdx = STEPS.findIndex((s) => s.id === step);
  const trainerImage = trainer.avatar;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back link */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center">
        <Link
          to="/calendar"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-semibold transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Calendar
        </Link>
      </motion.div>

      {/* Progress Steps */}
      {step !== 'confirmation' && (
        <div className="flex items-center justify-center gap-3">
          {STEPS.slice(0, 2).map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300',
                    done ? 'bg-accent text-white' : active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                  )}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn('text-sm font-bold hidden sm:inline transition-colors', active ? 'text-slate-900' : 'text-slate-400')}>
                    {s.label}
                  </span>
                </div>
                {i === 0 && (
                  <div className="w-12 h-0.5 bg-slate-100">
                    {done && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-accent" />}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'select-slot' && (
          <motion.div
            key="slot"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-8 space-y-6">
              {/* Day Picker */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-slate-900 text-xl tracking-tight">Pick Your Day</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevWeek}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextWeek}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 transition-all active:scale-90"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 font-bold',
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                        )}
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
                          {format(date, 'EEE')}
                        </span>
                        <span className="text-xl font-black">{format(date, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Picker */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <h2 className="font-black text-slate-900 text-xl tracking-tight">
                    Available Times <span className="text-slate-400 font-semibold text-base">— {format(selectedDate, 'MMMM d')}</span>
                  </h2>
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
                    {['30', '45', '60'].map(dur => (
                      <button
                        key={dur}
                        onClick={() => { setSelectedDuration(dur); setSelectedTime(null); }}
                        className={cn(
                          "px-4 py-1.5 text-xs font-black rounded-lg transition-all",
                          selectedDuration === dur ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {dur}m
                      </button>
                    ))}
                  </div>
                </div>
                
                {isLoadingSlots ? (
                  <div className="py-10 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading available slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 font-bold">
                    No slots available for this date and duration.
                  </div>
                ) : (
                  <div className="space-y-8">
                    {[
                      { title: 'Morning', icon: Sunrise, color: 'text-amber-500', slots: groupedSlots.morning },
                      { title: 'Afternoon', icon: Sun, color: 'text-orange-500', slots: groupedSlots.afternoon },
                      { title: 'Evening', icon: Moon, color: 'text-blue-500', slots: groupedSlots.evening },
                    ].map((section) => section.slots.length > 0 && (
                      <div key={section.title} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <section.icon className={cn("w-4 h-4", section.color)} />
                          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{section.title} Slots</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {section.slots.map((slot: any, idx: number) => {
                            const isSelected = selectedTime === slot.startTime;
                            return (
                              <button
                                key={idx}
                                disabled={!slot.available}
                                onClick={() => setSelectedTime(slot.startTime)}
                                className={cn(
                                  'group p-3.5 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden',
                                  !slot.available ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-100' :
                                  isSelected
                                    ? 'border-accent bg-accent/5 shadow-sm'
                                    : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                                )}
                              >
                                {isSelected && <motion.div layoutId="activeSlot" className="absolute inset-0 bg-accent/5 z-0" />}
                                <div className="relative z-10">
                                  <div className={cn(
                                    "text-sm font-black mb-0.5 transition-colors",
                                    isSelected ? "text-accent" : "text-slate-900"
                                  )}>
                                    {formatTime(slot.startTime)}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400">
                                    {formatTime(slot.endTime)}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl sticky top-6">
                <div className="p-5 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/10 shrink-0">
                      <img src={trainerImage} className="w-full h-full object-cover" alt={trainer.name} referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-white font-black">{trainer.name}</p>
                      <p className="text-white/40 text-xs font-medium">{trainer.specialties[0]}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {selectedDate && (
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                      <Calendar className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-white font-bold text-sm">{format(selectedDate, 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                  {selectedTime && selectedSlot && (
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                      <Clock className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-white font-bold text-sm">
                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                      </span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Session Fee</span>
                      <span className="text-white font-bold">${trainer.pricePerHour}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Platform Fee</span>
                      <span className="text-white font-bold">$5.00</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-white/5">
                      <span className="text-white/40 text-xs font-black uppercase tracking-wider">Total</span>
                      <span className="text-3xl font-black text-accent tracking-tighter">${trainer.pricePerHour + 5}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold shadow-xl shadow-accent/20"
                    disabled={!selectedTime}
                    onClick={() => setStep('payment')}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="font-black text-slate-900 text-xl tracking-tight mb-6">Payment Method</h2>

                <div className="p-5 rounded-2xl border-2 border-slate-900 bg-slate-50 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
                      <span className="text-white font-black italic text-xs tracking-tighter">VISA</span>
                    </div>
                    <div>
                      <p className="font-black text-slate-900 tracking-[0.15em]">•••• •••• •••• 4242</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Expires 12/28</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                <button className="w-full border-2 border-dashed border-slate-200 h-14 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Add New Card
                </button>

                <div className="mt-5 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-emerald-700 text-sm font-bold">Secured with 256-bit SSL encryption</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-6">
                <h3 className="font-black text-slate-900 mb-5">Booking Summary</h3>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 mb-5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img src={trainerImage} className="w-full h-full object-cover" alt={trainer.name} referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{trainer.name}</p>
                    <p className="text-slate-400 text-xs">{trainer.specialties[0]}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-600">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-600">
                      {selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : selectedTime}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2.5 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Session</span>
                    <span className="font-bold text-slate-900">${trainer.pricePerHour}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Platform Fee</span>
                    <span className="font-bold text-slate-900">$5.00</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="font-black text-slate-900">Total</span>
                    <span className="font-black text-2xl text-slate-900">${trainer.pricePerHour + 5}</span>
                  </div>
                </div>
                <Button
                  className="w-full h-12 rounded-xl font-bold shadow-md shadow-slate-900/10"
                  disabled={isProcessing}
                  onClick={handleConfirm}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : 'Confirm & Pay'}
                </Button>
                <button
                  onClick={() => setStep('select-slot')}
                  className="w-full mt-3 h-10 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="flex items-center justify-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Edit Schedule</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-16 space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className="relative w-28 h-28 mx-auto"
            >
              <div className="w-28 h-28 bg-accent rounded-[2rem] flex items-center justify-center shadow-2xl shadow-accent/25">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg rotate-12"
              >
                <Zap className="w-5 h-5 text-white fill-current" />
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <p className="text-accent text-xs font-black uppercase tracking-[0.2em] mb-3">Booking Confirmed!</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">You're all set!</h2>
              <p className="text-slate-400 text-base font-medium leading-relaxed">
                Your session with <span className="text-slate-900 font-black">{trainer.name}</span> is confirmed. Check your email for details.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Trainer</p>
                  <p className="font-black text-slate-900">{trainer.name}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Date & Time</p>
                  <p className="font-black text-slate-900">
                    {bookingResult
                      ? `${bookingResult.clientLocalDate} · ${bookingResult.clientLocalStartTime} - ${bookingResult.clientLocalEndTime} (${bookingResult.clientTimezone || 'UTC'})`
                      : `${format(selectedDate, 'MMMM d')} · ${selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : selectedTime}`}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total</p>
                  <p className="font-black text-slate-900">${trainer.pricePerHour + 5}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {bookingResult?.meetingId && (
                <Button size="lg" className="h-12 rounded-2xl px-10 font-bold bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 gap-2" asChild>
                  <Link to={`/session/${bookingResult.meetingId}`} state={{ bookingId: bookingResult.id }}>
                    <Play className="w-4 h-4 fill-current" />
                    Join Session Now
                  </Link>
                </Button>
              )}
              <Button size="lg" variant={bookingResult?.meetingId ? "outline" : "default"} className="h-12 rounded-2xl px-10 font-bold shadow-lg shadow-slate-900/10" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Skeleton className="h-4 w-32" />
      <div className="flex justify-center gap-3">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-1 w-12 self-center" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
