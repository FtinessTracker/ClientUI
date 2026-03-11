import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  ArrowUpRight, 
  Clock, 
  Video,
  ChevronRight,
  MoreHorizontal,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { mockApi } from '../../services/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';

const CHART_DATA = [
  { name: 'Mon', earnings: 150 },
  { name: 'Tue', earnings: 230 },
  { name: 'Wed', earnings: 180 },
  { name: 'Thu', earnings: 320 },
  { name: 'Fri', earnings: 250 },
  { name: 'Sat', earnings: 400 },
  { name: 'Sun', earnings: 300 },
];

export default function TrainerDashboard() {
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: mockApi.getCurrentUser });
  const { data: bookings, isLoading } = useQuery({ 
    queryKey: ['bookings', user?.id], 
    queryFn: () => mockApi.getBookings(user!.id, 'trainer'),
    enabled: !!user
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Trainer Dashboard</h1>
          <p className="text-slate-500 font-medium text-lg">Good morning, {user?.name}. Here's your business at a glance.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-200 hover:bg-slate-50">
            <Calendar className="mr-2 w-4 h-4" />
            Edit Availability
          </Button>
          <Button className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20">
            View Public Profile
          </Button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Earnings', value: '$4,250', change: '+12.5%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Clients', value: '18', change: '+2', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Rating', value: '4.9', change: '0.1', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sessions Done', value: '124', change: '+18', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[2rem] overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Earnings Chart */}
        <Card className="lg:col-span-8 border-none shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Earnings Overview</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Your revenue for the last 7 days.</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold bg-white shadow-sm">Week</Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold text-slate-400">Month</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] p-8 pt-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 600}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ fontWeight: 700, color: '#0f172a' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="lg:col-span-4 border-none shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Today's Schedule</CardTitle>
              <CardDescription className="text-slate-500 font-medium">March 04, 2026</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50"><MoreHorizontal className="w-5 h-5 text-slate-400" /></Button>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-8">
            {bookings?.map((booking, i) => (
              <div key={booking.id} className="relative pl-8 border-l-2 border-accent/30 space-y-4 group">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-accent ring-4 ring-accent/10 group-hover:scale-150 transition-transform" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Client: John Doe</p>
                    <p className="text-xs font-medium text-slate-500">HIIT Training • 60 min</p>
                  </div>
                  <span className="text-xs font-black text-accent bg-accent/5 px-2 py-1 rounded-lg">4:00 PM</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" className="h-9 text-xs rounded-xl font-bold px-4 shadow-lg shadow-primary/10" asChild>
                    <Link to={`/session/${booking.id}`}>Join Room</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl font-bold px-4 border-slate-200">Notes</Button>
                </div>
              </div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm text-slate-400 font-medium italic">No sessions scheduled today</p>
              </div>
            )}
            <Button variant="secondary" className="w-full rounded-2xl h-12 font-bold text-slate-600">
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { type: 'booking', text: 'New booking from Sarah Miller', time: '2 hours ago', icon: Calendar, bg: 'bg-blue-50', color: 'text-blue-600' },
              { type: 'review', text: 'You received a 5-star review from Mike', time: '5 hours ago', icon: Star, bg: 'bg-amber-50', color: 'text-amber-600' },
              { type: 'payout', text: 'Payout of $850.00 processed', time: 'Yesterday', icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", activity.bg)}>
                    <activity.icon className={cn("w-5 h-5", activity.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{activity.text}</p>
                    <p className="text-xs font-medium text-slate-400">{activity.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-900"><ChevronRight className="w-5 h-5" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <Skeleton className="col-span-2 h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}
