import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Star, 
  Clock, 
  Globe, 
  Award, 
  ShieldCheck, 
  MessageSquare,
  Calendar,
  ChevronRight,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockApi } from '../../services/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';

export default function TrainerProfile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'about' | 'availability' | 'reviews'>('about');

  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer', id],
    queryFn: () => mockApi.getTrainerById(id!)
  });

  if (isLoading) return <ProfileSkeleton />;
  if (!trainer) return <div>Trainer not found</div>;

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white p-10 lg:p-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent blur-3xl -z-10" />
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-64 h-64 rounded-[2.5rem] overflow-hidden border-8 border-white/5 shadow-2xl shrink-0"
          >
            <img src={trainer.avatar} alt={trainer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6"
            >
              {trainer.specialties.map(s => (
                <span key={s} className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {s}
                </span>
              ))}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter"
            >
              {trainer.name}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center lg:justify-start items-center gap-8 text-white/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-amber-400/10 px-3 py-1 rounded-xl">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                  <span className="font-black text-white text-lg">{trainer.rating}</span>
                </div>
                <span className="text-sm font-bold tracking-wide uppercase">{trainer.reviewCount} Reviews</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">{trainer.languages.join(', ')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-accent">Verified Expert</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="shrink-0 bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 text-center min-w-[280px]"
          >
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Session Rate</p>
            <p className="text-6xl font-black mb-8 tracking-tighter">${trainer.pricePerHour}<span className="text-xl font-medium text-white/40">/hr</span></p>
            <Button size="lg" className="w-full h-16 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 font-black text-lg shadow-2xl shadow-accent/20" asChild>
              <Link to={`/book/${trainer.id}`}>Book Now</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-center lg:justify-start gap-4 bg-slate-50 p-2 rounded-[2rem] w-fit mx-auto lg:mx-0">
        {['about', 'availability', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeTab === tab 
                ? "bg-white text-slate-900 shadow-xl" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div 
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <section>
                  <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">The Story</h2>
                  <p className="text-slate-500 leading-relaxed text-xl font-medium">
                    With over 8 years of experience in the fitness industry, I specialize in helping busy professionals achieve their health goals through sustainable, science-backed training methods. My approach focuses on functional movement, strength building, and mental resilience.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Certifications</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {trainer.certifications.map(cert => (
                      <div key={cert} className="flex items-center gap-5 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="p-4 bg-accent/5 rounded-2xl group-hover:scale-110 transition-transform">
                          <Award className="w-6 h-6 text-accent" />
                        </div>
                        <span className="font-black text-slate-700 tracking-tight">{cert}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Intro Video</h2>
                  <div className="aspect-video rounded-[3rem] bg-slate-900 flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-2xl">
                    <img src="https://picsum.photos/seed/video/1200/675" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="relative z-10 flex flex-col items-center gap-6">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-12 h-12 text-slate-900 ml-1" />
                      </div>
                      <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Watch Introduction</p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'availability' && (
              <motion.div 
                key="availability"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Weekly Schedule</h2>
                <div className="grid gap-6">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                    <div key={day} className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-2xl text-slate-300">
                          {day[0]}
                        </div>
                        <span className="font-black text-2xl text-slate-900 tracking-tight">{day}</span>
                      </div>
                      <div className="flex gap-3">
                        {i % 2 === 0 ? (
                          <>
                            <span className="px-6 py-3 bg-accent/5 text-accent rounded-2xl text-sm font-black tracking-tight border border-accent/10">09:00 - 10:00</span>
                            <span className="px-6 py-3 bg-accent/5 text-accent rounded-2xl text-sm font-black tracking-tight border border-accent/10">14:00 - 15:00</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-slate-300 italic">No availability</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div 
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Client Reviews</h2>
                  <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl">
                    <Star className="w-6 h-6 text-amber-400 fill-current" />
                    <span className="text-3xl font-black text-slate-900">{trainer.rating}</span>
                    <span className="text-slate-400 font-bold">/ 5.0</span>
                  </div>
                </div>
                <div className="grid gap-8">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                      <CardContent className="p-10">
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200" />
                            <div>
                              <p className="font-black text-slate-900 text-lg tracking-tight">Alex Johnson</p>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Client • 2 weeks ago</p>
                            </div>
                          </div>
                          <div className="flex gap-1 bg-amber-50 px-3 py-1.5 rounded-xl">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-amber-400 fill-current" />)}
                          </div>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-lg font-medium italic">
                          "Incredible session! Sarah really knows how to push you while making sure your form is perfect. I've seen more progress in 2 weeks than I did in 2 months on my own."
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl shadow-primary/5 bg-slate-900 text-white rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-2xl font-black tracking-tight">Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-4">
              <Button variant="ghost" className="w-full justify-start gap-4 h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white border-none font-bold">
                <div className="p-2 bg-white/10 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                Message {trainer.name.split(' ')[0]}
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-4 h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white border-none font-bold">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                Custom Request
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-2xl font-black tracking-tight">Policies</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm mb-1">24h Cancellation</p>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">Full refund if cancelled at least 24 hours before the session starts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm mb-1">Late Policy</p>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">Sessions start on time. Late arrival will reduce the total session duration.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-12">
      <Skeleton className="h-96 rounded-[3rem]" />
      <div className="flex gap-4 bg-slate-50 p-2 rounded-[2rem] w-fit">
        <Skeleton className="h-14 w-40 rounded-[1.5rem]" />
        <Skeleton className="h-14 w-40 rounded-[1.5rem]" />
        <Skeleton className="h-14 w-40 rounded-[1.5rem]" />
      </div>
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <Skeleton className="h-48 rounded-[2rem]" />
          <Skeleton className="h-96 rounded-[3rem]" />
        </div>
        <div className="lg:col-span-4 space-y-8">
          <Skeleton className="h-64 rounded-[3rem]" />
          <Skeleton className="h-64 rounded-[3rem]" />
        </div>
      </div>
    </div>
  );
}
