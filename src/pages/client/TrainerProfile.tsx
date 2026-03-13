import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star, Globe, Award, ShieldCheck, MessageSquare, Calendar,
  PlayCircle, CheckCircle2, ArrowLeft, Clock, Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockApi } from '../../services/mockApi';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';

const TRAINER_IMAGES: Record<string, string> = {
  t1: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=800',
  t2: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800',
  t3: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const REVIEWS = [
  { name: 'Alex Johnson', time: '2 weeks ago', text: 'Incredible session! Sarah really knows how to push you while making sure your form is perfect. I\'ve seen more progress in 2 weeks than in 2 months alone.', stars: 5, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Emma Williams', time: '1 month ago', text: 'The personalized approach is unlike anything I\'ve experienced. Every session is tailored to exactly where I am that day.', stars: 5, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Ryan Carter', time: '6 weeks ago', text: 'Professional, encouraging, and results-driven. My strength has improved dramatically. Highly recommend to anyone serious about fitness.', stars: 5, avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100' },
];

type Tab = 'about' | 'availability' | 'reviews';

export default function TrainerProfile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('about');

  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer', id],
    queryFn: () => mockApi.getTrainerById(id!),
  });

  if (isLoading) return <ProfileSkeleton />;
  if (!trainer) return (
    <div className="text-center py-32">
      <p className="text-slate-500 font-medium">Trainer not found.</p>
      <Button asChild variant="outline" className="mt-6 rounded-2xl"><Link to="/trainers">Back to trainers</Link></Button>
    </div>
  );

  const heroImage = TRAINER_IMAGES[trainer.id] || trainer.avatar;

  return (
    <div className="space-y-8">
      {/* Back link */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link to="/trainers" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-semibold transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to trainers
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2rem] overflow-hidden bg-slate-900"
      >
        <div className="absolute inset-0">
          <img src={heroImage} alt={trainer.name} className="w-full h-full object-cover opacity-30" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-transparent" />
        </div>

        <div className="relative z-10 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-28 h-28 lg:w-36 lg:h-36 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl shrink-0"
            >
              <img src={heroImage} alt={trainer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                {trainer.specialties.map((s) => (
                  <span key={s} className="bg-white/8 backdrop-blur border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">{trainer.name}</h1>
              <div className="flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/25 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-black text-white">{trainer.rating}</span>
                  </div>
                  <span className="text-white/40 font-medium">{trainer.reviewCount} reviews</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">{trainer.languages.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span className="text-accent font-black text-xs uppercase tracking-widest">Verified Expert</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/8 backdrop-blur-xl border border-white/10 p-7 rounded-2xl text-center shrink-0 min-w-[200px] lg:min-w-[220px]"
            >
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-1">Session Rate</p>
              <p className="text-5xl font-black text-white tracking-tighter mb-1">${trainer.pricePerHour}</p>
              <p className="text-white/30 text-xs font-medium mb-6">per hour</p>
              <Button
                className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold shadow-2xl shadow-accent/25"
                asChild
              >
                <Link to={`/book/${trainer.id}`}>Book Now</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Tabs + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Nav */}
          <div className="flex bg-slate-100 rounded-2xl p-1.5 w-fit gap-1">
            {(['about', 'availability', 'reviews'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 capitalize',
                  activeTab === tab ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">About</h2>
                  <p className="text-slate-500 leading-relaxed text-base font-medium">
                    With over 8 years of experience in the fitness industry, I specialize in helping busy professionals achieve their health goals through sustainable, science-backed training methods. My approach focuses on functional movement, strength building, and mental resilience — helping you build habits that last a lifetime.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Certifications</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {trainer.certifications.map((cert) => (
                      <div key={cert} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                        <div className="p-3 bg-accent/8 rounded-xl group-hover:scale-110 transition-transform duration-300">
                          <Award className="w-5 h-5 text-accent" />
                        </div>
                        <span className="font-black text-slate-800 text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Intro Video</h2>
                  <div className="aspect-video rounded-2xl bg-slate-900 flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-xl">
                    <img
                      src="https://images.pexels.com/photos/6998879/pexels-photo-6998879.jpeg?auto=compress&cs=tinysrgb&w=900"
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-60"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-10 h-10 text-slate-900 ml-0.5" />
                      </div>
                      <p className="text-white font-black uppercase tracking-[0.25em] text-xs">Watch Introduction</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'availability' && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Weekly Schedule</h2>
                <div className="space-y-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xl text-slate-300">
                          {day[0]}
                        </div>
                        <span className="font-black text-slate-900">{day}</span>
                      </div>
                      <div className="flex gap-2">
                        {i % 2 === 0 ? (
                          <>
                            <span className="px-4 py-2 bg-accent/8 text-accent rounded-xl text-xs font-black border border-accent/15">09:00 AM</span>
                            <span className="px-4 py-2 bg-accent/8 text-accent rounded-xl text-xs font-black border border-accent/15">02:00 PM</span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-slate-300 italic">Unavailable</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button className="w-full h-12 rounded-2xl font-bold shadow-md shadow-slate-900/10" asChild>
                  <Link to={`/book/${trainer.id}`}>Book a Slot</Link>
                </Button>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reviews</h2>
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-2xl">
                    <Star className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="text-xl font-black text-slate-900">{trainer.rating}</span>
                    <span className="text-slate-400 font-medium text-sm">/ 5.0</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {REVIEWS.map((review, i) => (
                    <motion.div
                      key={review.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <img src={review.avatar} className="w-11 h-11 rounded-xl object-cover border border-slate-100" alt={review.name} referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-black text-slate-900">{review.name}</p>
                            <p className="text-xs font-medium text-slate-400">Verified Client · {review.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.stars }).map((_, s) => (
                            <Star key={s} className="w-4 h-4 text-amber-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500 leading-relaxed font-medium italic text-sm">"{review.text}"</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-slate-900 rounded-2xl overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4 border-b border-white/5">
              <h3 className="font-black text-white">Quick Contact</h3>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full flex items-center gap-4 h-13 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                <div className="p-2 bg-white/10 rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Message {trainer.name.split(' ')[0]}</span>
              </button>
              <button className="w-full flex items-center gap-4 h-13 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Custom Request</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4 border-b border-slate-50">
              <h3 className="font-black text-slate-900">Session Policies</h3>
            </div>
            <div className="p-6 space-y-5">
              {[
                { title: '24h Cancellation', desc: 'Full refund if cancelled at least 24 hours before session.' },
                { title: 'Late Arrivals', desc: 'Sessions start on time. Late arrival reduces duration.' },
                { title: 'Equipment', desc: 'A mat and water bottle are all you need to get started.' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="p-1.5 bg-accent/10 rounded-lg mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm mb-0.5">{title}</p>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-accent/5 border border-accent/15 rounded-2xl p-6 text-center"
          >
            <Clock className="w-6 h-6 text-accent mx-auto mb-3" />
            <p className="text-sm font-black text-slate-900 mb-1">Next available slot</p>
            <p className="text-accent font-black">Monday, 9:00 AM</p>
            <p className="text-slate-400 text-xs font-medium mt-1">March 17, 2026</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-56 rounded-[2rem]" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-12 w-64 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
