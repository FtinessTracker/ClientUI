import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  Clock, 
  Star, 
  ArrowRight, 
  TrendingUp, 
  Activity,
  Award,
  Video,
  Search,
  Zap,
  ChevronRight,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { mockApi } from '../../services/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAppUser } from '../../hooks/useAppUser';

export default function ClientDashboard() {
  const { appUser: user } = useAppUser();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => mockApi.getBookings(user!.id, 'client'),
    enabled: !!user
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-slate-500 font-medium text-lg">You're making great progress. Here's what's happening today.</p>
        </div>
        <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8" asChild>
          <Link to="/trainers">
            <Search className="mr-2 w-5 h-5" />
            Find New Trainer
          </Link>
        </Button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sessions', value: '24', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
          { label: 'Hours Trained', value: '18.5', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+5.2h' },
          { label: 'Achievements', value: '12', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'New!' },
          { label: 'Calories Burned', value: '8.4k', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+1.2k' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[2rem] overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", stat.bg, stat.color)}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Sessions</h2>
            <Button variant="ghost" className="font-bold text-accent hover:text-accent hover:bg-accent/10 rounded-xl" asChild>
              <Link to="/schedule">View Schedule <ChevronRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="space-y-4">
            {bookings?.map((booking, i) => (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-none shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 rounded-3xl overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-32 bg-slate-50 flex flex-col items-center justify-center p-6 border-r border-slate-100 group-hover:bg-accent/5 transition-colors">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mar</span>
                        <span className="text-3xl font-black text-slate-900">05</span>
                      </div>
                      <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                            <img src={`https://picsum.photos/seed/trainer${i}/100`} className="w-full h-full object-cover" alt="Trainer" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Yoga & Mindfulness</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent" /> 4:00 PM</span>
                              <span className="flex items-center gap-1.5"><Video className="w-4 h-4 text-blue-500" /> Live Video</span>
                              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400" /> Sarah Jenkins</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" className="rounded-xl border-slate-200 font-bold hover:bg-slate-50">Reschedule</Button>
                          <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 px-6" asChild>
                            <Link to={`/session/${booking.id}`}>Join Room</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No sessions scheduled</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Start your fitness journey by booking a session with one of our elite trainers.</p>
                <Button className="rounded-xl px-8 h-12 font-bold" asChild>
                  <Link to="/trainers">Explore Trainers</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="lg:col-span-4 space-y-10">
          {/* Progress Card */}
          <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl -z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl">Weekly Goal</CardTitle>
              <CardDescription className="text-white/60">You're almost there!</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black">85%</p>
                <p className="text-sm font-bold text-white/60">4/5 Sessions</p>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-accent h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                />
              </div>
              <p className="text-sm font-medium text-white/70 leading-relaxed">
                Complete one more session this week to hit your target and earn a <span className="text-accent font-bold">Consistency Badge</span>.
              </p>
            </CardContent>
          </Card>

          {/* Recommended Trainers */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recommended</h2>
              <Button variant="link" className="text-accent font-bold p-0 h-auto" asChild>
                <Link to="/trainers">See all</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group">
                  <div className="relative h-32 overflow-hidden">
                    <img src={`https://picsum.photos/seed/trainer${i+5}/400/200`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
                      <span className="text-white font-bold text-sm">Marcus Chen</span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/20 backdrop-blur-md px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 fill-current" /> 4.9
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">HIIT • Strength</p>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">Transform your body with high-intensity functional training.</p>
                    <Button variant="secondary" size="sm" className="w-full rounded-xl font-bold h-10" asChild>
                      <Link to="/trainers">View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
