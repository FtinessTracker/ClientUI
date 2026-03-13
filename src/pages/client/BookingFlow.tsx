import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Clock, CreditCard, CheckCircle2,
  ArrowLeft, ShieldCheck, Zap, ChevronLeft, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockApi } from '../../services/mockApi';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';

type Step = 'select-slot' | 'payment' | 'confirmation';

const TRAINER_IMAGES: Record<string, string> = {
  t1: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=200',
  t2: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
  t3: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=200',
};

const DAYS = [
  { label: 'Mon', date: 15 }, { label: 'Tue', date: 16 }, { label: 'Wed', date: 17 },
  { label: 'Thu', date: 18 }, { label: 'Fri', date: 19 }, { label: 'Sat', date: 20 }, { label: 'Sun', date: 21 },
];
const TIMES = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

const STEPS = [
  { id: 'select-slot', label: 'Schedule' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Confirmed' },
];

export default function BookingFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select-slot');
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer', id],
    queryFn: () => mockApi.getTrainerById(id!),
  });

  if (isLoading) return <BookingSkeleton />;
  if (!trainer) return <div className="text-center py-32 text-slate-400">Trainer not found</div>;

  const handleConfirm = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsProcessing(false);
    setStep('confirmation');
  };

  const currentIdx = STEPS.findIndex((s) => s.id === step);
  const trainerImage = TRAINER_IMAGES[trainer.id] || trainer.avatar;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back link */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          to={`/trainer/${trainer.id}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-semibold transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {trainer.name}
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
                <h2 className="font-black text-slate-900 text-xl tracking-tight mb-5">Pick Your Day</h2>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map(({ label, date }) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDay(date)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 font-bold',
                        selectedDay === date
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                      )}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
                      <span className="text-xl font-black">{date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Picker */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="font-black text-slate-900 text-xl tracking-tight mb-5">
                  Available Times <span className="text-slate-400 font-semibold text-base">— March {selectedDay}</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TIMES.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        'p-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200',
                        selectedTime === time
                          ? 'border-accent bg-accent/8 text-accent shadow-sm'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white'
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
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
                  {selectedDay && (
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                      <Calendar className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-white font-bold text-sm">March {selectedDay}, 2026</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                      <Clock className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-white font-bold text-sm">{selectedTime}</span>
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
                    <span className="font-semibold text-slate-600">March {selectedDay}, 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-600">{selectedTime}</span>
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
                  <p className="font-black text-slate-900">March {selectedDay} · {selectedTime}</p>
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
              <Button size="lg" className="h-12 rounded-2xl px-10 font-bold shadow-lg shadow-slate-900/10" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 rounded-2xl px-10 font-bold border-slate-200 hover:bg-slate-50 gap-2">
                <Calendar className="w-4 h-4" />
                Add to Calendar
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
