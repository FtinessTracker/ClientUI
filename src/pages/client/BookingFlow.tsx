import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockApi } from '../../services/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';

type Step = 'select-slot' | 'payment' | 'confirmation';

export default function BookingFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select-slot');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer', id],
    queryFn: () => mockApi.getTrainerById(id!)
  });

  if (isLoading) return <BookingSkeleton />;
  if (!trainer) return <div>Trainer not found</div>;

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep('confirmation');
  };

  const steps = [
    { id: 'select-slot', label: 'Schedule' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmation', label: 'Success' }
  ];

  const currentStepIdx = steps.findIndex(s => s.id === step);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Progress Bar */}
      <div className="relative flex items-center justify-between px-10">
        <div className="absolute top-5 left-20 right-20 h-0.5 bg-slate-100 -z-10">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-3">
            <motion.div 
              initial={false}
              animate={{
                backgroundColor: i <= currentStepIdx ? '#0f172a' : '#f1f5f9',
                color: i <= currentStepIdx ? '#ffffff' : '#94a3b8',
                scale: step === s.id ? 1.2 : 1
              }}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-lg",
                step === s.id && "ring-8 ring-primary/5"
              )}
            >
              {i < currentStepIdx ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
            </motion.div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
              i <= currentStepIdx ? "text-slate-900" : "text-slate-300"
            )}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'select-slot' && (
          <motion.div 
            key="select-slot"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-12 gap-12"
          >
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden">
                <CardHeader className="p-10 pb-0">
                  <CardTitle className="text-3xl font-black tracking-tight">Pick Your Time</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-lg">Select a slot that fits your schedule perfectly.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                      <button 
                        key={day}
                        className={cn(
                          "flex flex-col items-center gap-2 p-5 rounded-[2rem] border-2 transition-all duration-300",
                          i === 0 ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" : "border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-400"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{day}</span>
                        <span className="text-2xl font-black tracking-tighter">{15 + i}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Available Sessions</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedSlot(time)}
                          className={cn(
                            "p-6 rounded-3xl border-2 font-black text-lg transition-all duration-300",
                            selectedSlot === time 
                              ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" 
                              : "border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-500"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card className="border-none shadow-2xl shadow-primary/5 bg-slate-900 text-white rounded-[3rem] overflow-hidden sticky top-8">
                <div className="p-8 bg-white/5 border-b border-white/5">
                  <h3 className="font-black uppercase tracking-widest text-xs text-white/40">Booking Summary</h3>
                </div>
                <CardContent className="p-10 space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white/10">
                      <img src={trainer.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-xl font-black tracking-tight">{trainer.name}</p>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{trainer.specialties[0]}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 font-bold">Session Fee</span>
                      <span className="font-black text-lg">${trainer.pricePerHour}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 font-bold">Service Fee</span>
                      <span className="font-black text-lg">$5.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                      <span className="text-white/40 font-black uppercase tracking-widest text-xs">Total Amount</span>
                      <span className="text-4xl font-black tracking-tighter text-accent">${trainer.pricePerHour + 5}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button 
                    className="w-full h-16 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 font-black text-lg shadow-2xl shadow-accent/20"
                    disabled={!selectedSlot}
                    onClick={() => setStep('payment')}
                  >
                    Continue
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-12 gap-12"
          >
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden">
                <CardHeader className="p-10 pb-0">
                  <CardTitle className="text-3xl font-black tracking-tight">Payment Method</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-lg">Your transaction is encrypted and secure.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="p-8 rounded-[2.5rem] border-4 border-primary bg-primary/5 flex items-center justify-between shadow-xl shadow-primary/5">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black italic text-xs tracking-tighter">VISA</div>
                      <div>
                        <p className="text-xl font-black tracking-widest text-slate-900">•••• •••• •••• 4242</p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Expires 12/28</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle2 className="text-white w-5 h-5" />
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full border-2 border-dashed border-slate-200 h-16 rounded-[2rem] gap-3 font-black text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
                    <CreditCard className="w-5 h-5" />
                    Add New Card
                  </Button>

                  <div className="pt-10 border-t border-slate-50">
                    <div className="flex items-center gap-4 p-6 bg-emerald-50 text-emerald-700 rounded-[2rem] border border-emerald-100">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-sm font-black tracking-tight">Enterprise-grade 256-bit SSL encryption active.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card className="border-none shadow-2xl shadow-primary/5 bg-white rounded-[3rem] overflow-hidden sticky top-8">
                <CardHeader className="p-10 pb-0">
                  <CardTitle className="text-2xl font-black tracking-tight">Final Check</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-black text-slate-900">March 15, 2026</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-black text-slate-900">{selectedSlot}</span>
                  </div>
                  <div className="pt-8 border-t border-slate-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold">Total Amount</span>
                      <span className="text-3xl font-black tracking-tighter text-slate-900">${trainer.pricePerHour + 5}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0 flex flex-col gap-4">
                  <Button 
                    className="w-full h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20" 
                    isLoading={isProcessing}
                    onClick={handleConfirmBooking}
                  >
                    Confirm & Pay
                  </Button>
                  <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-slate-400" onClick={() => setStep('select-slot')}>
                    Go Back
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div 
            key="confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center space-y-12 py-20"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-16 h-16 text-white" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-xl rotate-12"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            <div>
              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">You're All Set!</h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">
                Your session with {trainer.name} is confirmed. We've sent the details to your email and added it to your dashboard.
              </p>
            </div>
            
            <Card className="border-none shadow-sm bg-slate-50 rounded-[2.5rem] p-10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Trainer</p>
                  <p className="text-xl font-black text-slate-900">{trainer.name}</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Schedule</p>
                  <p className="text-xl font-black text-slate-900">{selectedSlot}, March 15</p>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="h-16 rounded-2xl px-12 font-black text-lg shadow-2xl shadow-primary/20" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 rounded-2xl px-12 font-black text-lg border-slate-200 hover:bg-slate-50 gap-3">
                <Calendar className="w-5 h-5" />
                Add to Calendar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <Skeleton className="h-20 w-full rounded-[2rem]" />
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <Skeleton className="h-[600px] rounded-[3rem]" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-[500px] rounded-[3rem]" />
        </div>
      </div>
    </div>
  );
}
