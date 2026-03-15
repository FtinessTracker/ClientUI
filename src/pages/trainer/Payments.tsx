import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Download, ListFilter as Filter, ArrowUpRight, ArrowDownRight, CreditCard, CircleCheck as CheckCircle, Clock, Circle as XCircle, ChartBar as BarChart3, Calendar, ChevronDown } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { trainerService } from '../../services/trainerService';
import { useAppUser } from '../../hooks/useAppUser';
import { PaymentRow } from '../../types/trainer';

const MONTHLY_DATA = [
  { month: 'Oct', earnings: 2100, sessions: 28 },
  { month: 'Nov', earnings: 2850, sessions: 36 },
  { month: 'Dec', earnings: 3200, sessions: 42 },
  { month: 'Jan', earnings: 2700, sessions: 34 },
  { month: 'Feb', earnings: 3650, sessions: 45 },
  { month: 'Mar', earnings: 4250, sessions: 52 },
];

const INCOME_BREAKDOWN = [
  { name: 'Virtual Sessions', value: 58, color: '#10b981' },
  { name: 'In-Person', value: 28, color: '#0ea5e9' },
  { name: 'Packages', value: 14, color: '#f59e0b' },
];

const MOCK_PAYMENTS: PaymentRow[] = [
  { id: 'p1', booking_id: 'b1', trainer_clerk_id: 't1', client_clerk_id: 'u1', client_name: 'Emma Wilson', amount: 75, platform_fee: 7.50, net_amount: 67.50, status: 'completed', payment_method: 'card', paid_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'p2', booking_id: 'b2', trainer_clerk_id: 't1', client_clerk_id: 'u2', client_name: 'James Rodriguez', amount: 90, platform_fee: 9, net_amount: 81, status: 'completed', payment_method: 'card', paid_at: new Date(Date.now() - 172800000).toISOString(), created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'p3', booking_id: 'b3', trainer_clerk_id: 't1', client_clerk_id: 'u3', client_name: 'Sofia Chen', amount: 75, platform_fee: 7.50, net_amount: 67.50, status: 'completed', payment_method: 'card', paid_at: new Date(Date.now() - 259200000).toISOString(), created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 'p4', booking_id: 'b4', trainer_clerk_id: 't1', client_clerk_id: 'u4', client_name: 'Marcus Thompson', amount: 75, platform_fee: 7.50, net_amount: 67.50, status: 'pending', payment_method: 'card', paid_at: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'p5', booking_id: 'b5', trainer_clerk_id: 't1', client_clerk_id: 'u6', client_name: 'David Kim', amount: 90, platform_fee: 9, net_amount: 81, status: 'completed', payment_method: 'card', paid_at: new Date(Date.now() - 432000000).toISOString(), created_at: new Date(Date.now() - 432000000).toISOString() },
  { id: 'p6', booking_id: 'b6', trainer_clerk_id: 't1', client_clerk_id: 'u5', client_name: 'Aria Patel', amount: 75, platform_fee: 7.50, net_amount: 67.50, status: 'refunded', payment_method: 'card', paid_at: new Date(Date.now() - 604800000).toISOString(), created_at: new Date(Date.now() - 604800000).toISOString() },
];

const STATUS_CONFIG = {
  completed: { label: 'Paid', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  refunded: { label: 'Refunded', icon: ArrowDownRight, color: 'text-red-500', bg: 'bg-red-50' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
};

const CLIENT_AVATARS: Record<string, string> = {
  'Emma Wilson': 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60',
  'James Rodriguez': 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60',
  'Sofia Chen': 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=60',
  'Marcus Thompson': 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60',
  'David Kim': 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60',
  'Aria Patel': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60',
};

export default function TrainerPayments() {
  const { appUser } = useAppUser();
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'refunded'>('all');
  const [chartType, setChartType] = useState<'earnings' | 'sessions'>('earnings');

  const { data: payments = MOCK_PAYMENTS } = useQuery({
    queryKey: ['payments', appUser?.id],
    queryFn: () => trainerService.getPayments(appUser!.id),
    enabled: !!appUser,
    placeholderData: MOCK_PAYMENTS,
  });

  const filtered = payments.filter(p => filterStatus === 'all' || p.status === filterStatus);
  const totalEarned = payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.net_amount), 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const thisMonthEarned = 4250;
  const lastMonthEarned = 3650;
  const monthlyChange = ((thisMonthEarned - lastMonthEarned) / lastMonthEarned * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Payments</h1>
          <p className="text-slate-400 font-medium mt-1">Track your earnings and payouts</p>
        </div>
        <Button variant="outline" className="rounded-2xl font-bold gap-2 w-fit border-slate-200">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Earned', value: `$${totalEarned.toLocaleString('en', { minimumFractionDigits: 2 })}`,
            change: `+${monthlyChange}%`, up: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50',
          },
          {
            label: 'This Month', value: `$${thisMonthEarned.toLocaleString()}`,
            change: '+16.4%', up: true, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50',
          },
          {
            label: 'Pending', value: `$${pendingAmount.toFixed(2)}`,
            change: '1 payment', up: true, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50',
          },
          {
            label: 'Avg per Session', value: '$82',
            change: '+$5 vs last mo.', up: true, icon: BarChart3, color: 'text-slate-600', bg: 'bg-slate-100',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <span className={cn(
                'text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1',
                stat.up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
              )}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-black text-slate-900 text-lg">Revenue Overview</h2>
              <p className="text-slate-400 text-sm font-medium">Last 6 months</p>
            </div>
            <div className="flex bg-slate-100 rounded-xl p-1">
              {(['earnings', 'sessions'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all',
                    chartType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            {chartType === 'earnings' ? (
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: 13, fontWeight: 700 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Earnings']}
                />
                <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2.5} fill="url(#earningsGrad)" dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#10b981' }} />
              </AreaChart>
            ) : (
              <BarChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: 13, fontWeight: 700 }}
                  formatter={(v: number) => [v, 'Sessions']}
                />
                <Bar dataKey="sessions" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Income Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-black text-slate-900 text-lg mb-1">Income Breakdown</h2>
          <p className="text-slate-400 text-sm font-medium mb-4">By session type</p>
          <div className="flex justify-center mb-4">
            <PieChart width={160} height={160}>
              <Pie
                data={INCOME_BREAKDOWN}
                cx={80} cy={80}
                innerRadius={50} outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {INCOME_BREAKDOWN.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${v}%`, '']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </div>
          <div className="space-y-2.5">
            {INCOME_BREAKDOWN.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="font-black text-slate-900 text-sm">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-lg">Recent Transactions</h2>
          <div className="flex gap-2">
            {(['all', 'completed', 'pending', 'refunded'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all',
                  filterStatus === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((payment, i) => {
            const status = STATUS_CONFIG[payment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.completed;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <img
                  src={CLIENT_AVATARS[payment.client_name] || ''}
                  alt={payment.client_name}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{payment.client_name}</p>
                  <p className="text-sm text-slate-400 font-medium">
                    {payment.paid_at ? format(new Date(payment.paid_at), 'MMM d, yyyy · h:mm a') : format(new Date(payment.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-slate-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{payment.payment_method}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-slate-900">${payment.net_amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">fee: ${payment.platform_fee.toFixed(2)}</p>
                </div>
                <span className={cn(
                  'text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0',
                  status.bg, status.color
                )}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
