import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, DollarSign, Star, Clock, Video, ChevronRight, Activity, ArrowUpRight, TrendingUp, MoveHorizontal as MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { mockApi } from '../../services/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';
import { useAppUser } from '../../hooks/useAppUser';

const CHART_DATA = [
  { name: 'Mon', earnings: 150 },
  { name: 'Tue', earnings: 230 },
  { name: 'Wed', earnings: 180 },
  { name: 'Thu', earnings: 320 },
  { name: 'Fri', earnings: 250 },
  { name: 'Sat', earnings: 400 },
  { name: 'Sun', earnings: 300 },
];

const CLIENT_IMAGES = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100',
];

export default function TrainerDashboard() {
  const { appUser: user } = useAppUser();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => mockApi.getBookings(user!.id, 'trainer'),
    enabled: !!user,
  });

  if (isLoading) return <DashboardSkeleton />;

  const firstName = user?.name?.split(' ')[0] || 'Coach';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-5"
      >
        <div>
          <p className="text-accent text-xs font-black uppercase tracking-[0.2em] mb-1.5">{greeting}, {firstName}</p>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-1.5">Trainer Dashboard</h1>
          <p className="text-slate-400 font-medium">Your business overview for today.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="rounded-2xl h-11 px-5 font-bold border-slate-200 hover:bg-white text-sm">
            <Calendar className="mr-2 w-4 h-4" />
            Availability
          </Button>
          <Button className="rounded-2xl h-11 px-5 font-bold shadow-lg shadow-slate-900/10 text-sm">
            View Profile
          </Button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: '$4,250', change: '+12.5%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', up: true, delay: 0.05 },
          { label: 'Active Clients', value: '18', change: '+2 this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', up: true, delay: 0.1 },
          { label: 'Avg Rating', value: '4.9', change: '↑ 0.1', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', up: true, delay: 0.15 },
          { label: 'Sessions Done', value: '124', change: '+18 this month', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-100', up: true, delay: 0.2 },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.5 }}
          >
            <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden group bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div className={cn('p-3 rounded-xl group-hover:scale-110 transition-transform duration-300', stat.bg)}>
                    <stat.icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1', stat.bg, stat.color)}>
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden h-full">
            <CardHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Earnings</CardTitle>
                  <CardDescription className="text-slate-400 font-medium text-sm">Revenue for the last 7 days</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {['Week', 'Month'].map((t, i) => (
                    <button key={t} className={cn(
                      'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                      i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    )}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-64 p-6 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dx={-8} />
                  <Tooltip
                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '10px 14px' }}
                    itemStyle={{ fontWeight: 700, color: '#0f172a' }}
                    labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 600 }}
                    formatter={(v: number) => [`$${v}`, 'Earnings']}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden h-full">
            <CardHeader className="p-6 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Today</CardTitle>
                <CardDescription className="text-slate-400 font-medium text-sm">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </CardDescription>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {bookings?.map((booking, i) => (
                <div key={booking.id} className="relative pl-7 border-l-2 border-accent/25 group">
                  <div className="absolute -left-[5px] top-0.5 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-accent/10 group-hover:scale-125 transition-transform" />
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-black text-slate-900">John Doe</p>
                      <p className="text-xs text-slate-400 font-medium">HIIT Training · 60 min</p>
                    </div>
                    <span className="text-xs font-black text-accent bg-accent/8 px-2.5 py-1 rounded-lg border border-accent/15">4:00 PM</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 text-xs rounded-xl font-bold px-4 shadow-sm" asChild>
                      <Link to={`/session/${booking.id}`}>
                        <Video className="w-3 h-3 mr-1.5" />
                        Join
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl font-bold px-3 border-slate-200">
                      Notes
                    </Button>
                  </div>
                </div>
              ))}

              {(!bookings || bookings.length === 0) && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No sessions today</p>
                </div>
              )}

              <Button variant="secondary" className="w-full rounded-xl h-10 font-bold text-slate-600 text-sm">
                Full Calendar <ChevronRight className="ml-1.5 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity + Active Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              {[
                { type: 'booking', text: 'New booking from Sarah Miller', time: '2 hours ago', icon: Calendar, bg: 'bg-blue-50', color: 'text-blue-600' },
                { type: 'review', text: 'You received a 5-star review from Mike J.', time: '5 hours ago', icon: Star, bg: 'bg-amber-50', color: 'text-amber-600' },
                { type: 'payout', text: 'Payout of $850.00 processed successfully', time: 'Yesterday', icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
                { type: 'message', text: 'Emma Williams sent you a message', time: 'Yesterday', icon: Activity, bg: 'bg-slate-100', color: 'text-slate-600' },
              ].map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('p-2.5 rounded-xl transition-transform group-hover:scale-110', activity.bg)}>
                      <activity.icon className={cn('w-4 h-4', activity.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{activity.text}</p>
                      <p className="text-xs font-medium text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden h-full">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Clients</CardTitle>
                <span className="text-xs font-black text-accent bg-accent/8 px-2.5 py-1 rounded-full border border-accent/15">18 active</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              {[
                { name: 'Sarah Miller', sessions: 12, progress: 80 },
                { name: 'Mike Johnson', sessions: 8, progress: 60 },
                { name: 'Emma Williams', sessions: 5, progress: 40 },
              ].map(({ name, sessions, progress }, i) => (
                <div key={name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <img
                    src={CLIENT_IMAGES[i]}
                    alt={name}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{name}</p>
                    <p className="text-xs text-slate-400 font-medium">{sessions} sessions</p>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.9, delay: 0.4 + i * 0.1 }}
                        className="bg-accent h-full rounded-full"
                      />
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-accent transition-colors shrink-0" />
                </div>
              ))}
              <Button variant="ghost" className="w-full h-10 rounded-xl font-bold text-slate-400 hover:text-slate-600 text-sm">
                View all clients <ChevronRight className="ml-1.5 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
