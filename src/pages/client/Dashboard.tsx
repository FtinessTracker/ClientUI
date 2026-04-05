import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Clock, Star, ArrowRight, TrendingUp, Activity,
  Award, Video, Search, ChevronRight, Zap, Flame, Target,
  Users, Play,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { mockApi } from '../../services/mockApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAppUser } from '../../hooks/useAppUser';
import { cn } from '../../lib/utils';

const TRAINER_RECS = [
  {
    name: 'Marcus Chen',
    specialty: 'HIIT & Strength',
    rating: 4.8,
    price: 90,
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    id: 't2',
  },
  {
    name: 'Elena Rodriguez',
    specialty: 'Rehab & Mobility',
    rating: 5.0,
    price: 85,
    image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
    id: 't3',
  },
];

const StatCard: React.FC<{
  label: string; value: string; icon: React.ElementType;
  color: string; bg: string; trend: string; delay: number;
}> = ({
  label, value, icon: Icon, color, bg, trend, delay,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden group bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div className={cn('p-3 rounded-xl transition-transform group-hover:scale-110 duration-300', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', bg, color)}>
              {trend}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ClientDashboard() {
  const { appUser: user } = useAppUser();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => mockApi.getBookings(user!.id, 'client'),
    enabled: !!user,
  });

  if (isLoading) return <DashboardSkeleton />;

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-5"
      >
        <div>
          <p className="text-accent text-xs font-black uppercase tracking-[0.2em] mb-1.5">{greeting}</p>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-1.5">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-400 font-medium">Here's what's happening in your fitness journey today.</p>
        </div>
        <Button size="lg" className="rounded-2xl shadow-xl shadow-slate-900/15 h-12 px-7 font-bold shrink-0 group" asChild>
          <Link to="/trainers">
            <Search className="mr-2 w-4 h-4" />
            Find a Trainer
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: '24', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', delay: 0.05 },
          { label: 'Hours Trained', value: '18.5h', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+5.2h', delay: 0.1 },
          { label: 'Achievements', value: '12', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'New!', delay: 0.15 },
          { label: 'Calories Burned', value: '8.4k', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+1.2k', delay: 0.2 },
        ].map((stat) => (
          <StatCard 
            key={stat.label} 
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bg={stat.bg}
            trend={stat.trend}
            delay={stat.delay}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Upcoming Sessions</h2>
            <Button variant="ghost" size="sm" className="font-bold text-accent hover:text-accent hover:bg-accent/8 rounded-xl text-sm" asChild>
              <Link to="/schedule">View all <ChevronRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="space-y-3">
            {bookings?.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <div className="bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
                  <div className="flex">
                    <div className="w-20 shrink-0 bg-slate-50 border-r border-slate-100 flex flex-col items-center justify-center py-5 group-hover:bg-accent/5 transition-colors">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mar</span>
                      <span className="text-2xl font-black text-slate-900">15</span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0">
                          <img
                            src="https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=100"
                            className="w-full h-full object-cover"
                            alt="Trainer"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 mb-0.5">Yoga & Mindfulness</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent" /> 4:00 PM</span>
                            <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-blue-500" /> Live Video</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Sarah Jenkins</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="h-9 px-4 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                          Reschedule
                        </button>
                        <Button className="h-9 rounded-xl font-bold text-xs px-5 shadow-md shadow-slate-900/10" asChild>
                          <Link to={`/session/${booking.id}`}>
                            <Play className="w-3 h-3 mr-1.5 fill-current" />
                            Join
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {(!bookings || bookings.length === 0) && (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-black text-slate-900 mb-1.5">No sessions yet</h3>
                <p className="text-slate-400 text-sm font-medium mb-6 max-w-xs mx-auto">Start your journey by booking your first session with an elite trainer.</p>
                <Button className="rounded-xl px-7 h-10 font-bold text-sm" asChild>
                  <Link to="/trainers">Browse Trainers</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Weekly goal */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/15 blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Weekly Goal</p>
                  <p className="text-white font-black text-xl tracking-tight">4 of 5 Sessions Complete</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-accent tracking-tighter">85%</p>
                </div>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  className="bg-gradient-to-r from-accent to-emerald-400 h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                />
              </div>
              <p className="text-slate-500 text-xs font-semibold mt-3">
                One more session to earn your <span className="text-accent font-black">Consistency Badge</span>!
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar: Recommended */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">For You</h2>
            <Button variant="ghost" size="sm" className="font-bold text-accent hover:text-accent hover:bg-accent/8 rounded-xl text-sm" asChild>
              <Link to="/trainers">See all</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {TRAINER_RECS.map((trainer, i) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={trainer.image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={trainer.name}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                      <div>
                        <p className="text-white font-black text-sm">{trainer.name}</p>
                        <p className="text-white/70 text-xs font-medium">{trainer.specialty}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <span className="text-white text-xs font-black">{trainer.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <p className="font-black text-slate-900">${trainer.price}<span className="text-xs text-slate-400 font-semibold">/hr</span></p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold border-slate-200 px-3" asChild>
                        <Link to={`/trainer/${trainer.id}`}>View</Link>
                      </Button>
                      <Button size="sm" className="h-8 rounded-xl text-xs font-bold px-4 shadow-md shadow-slate-900/10" asChild>
                        <Link to={`/book/${trainer.id}`}>Book</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick stats card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-slate-100 p-5"
          >
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">This Month</p>
            <div className="space-y-4">
              {[
                { label: 'Calories Burned', value: '2,840', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' },
                { label: 'Sessions Done', value: '8', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Streak Days', value: '12', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', bg)}>
                      <Icon className={cn('w-4 h-4', color)} />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{label}</span>
                  </div>
                  <span className="font-black text-slate-900 text-sm">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
