import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, ChevronRight, Star, Calendar, MessageSquare,
  TrendingUp, Clock, MoreHorizontal, Plus, Activity, Target, Flame
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { trainerService } from '../../services/trainerService';
import { useAppUser } from '../../hooks/useAppUser';
import { TrainerClientRow } from '../../lib/supabase';

const CLIENT_AVATARS: Record<number, string> = {
  0: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120',
  1: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120',
  2: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120',
  3: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120',
  4: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120',
  5: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120',
  6: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=120',
  7: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=120',
};

function getAvatar(id: string) {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return CLIENT_AVATARS[hash % 8];
}

const MOCK_CLIENTS: TrainerClientRow[] = [
  {
    id: 'c1', trainer_clerk_id: 'trainer', client_clerk_id: 'u1',
    client_name: 'Emma Wilson', client_email: 'emma@example.com',
    client_avatar_url: CLIENT_AVATARS[0], status: 'active',
    goal: 'Weight Loss & Tone', notes: 'Prefers morning sessions. Knee injury - avoid deep squats.',
    total_sessions: 24, joined_at: '2024-09-15T00:00:00Z', last_session_at: '2025-03-10T09:00:00Z',
  },
  {
    id: 'c2', trainer_clerk_id: 'trainer', client_clerk_id: 'u2',
    client_name: 'James Rodriguez', client_email: 'james@example.com',
    client_avatar_url: CLIENT_AVATARS[1], status: 'active',
    goal: 'Muscle Gain', notes: 'Very motivated. Looking to compete in local powerlifting.',
    total_sessions: 18, joined_at: '2024-11-01T00:00:00Z', last_session_at: '2025-03-12T17:00:00Z',
  },
  {
    id: 'c3', trainer_clerk_id: 'trainer', client_clerk_id: 'u3',
    client_name: 'Sofia Chen', client_email: 'sofia@example.com',
    client_avatar_url: CLIENT_AVATARS[2], status: 'active',
    goal: 'Marathon Prep', notes: 'Training for NYC Marathon. High endurance focus.',
    total_sessions: 32, joined_at: '2024-07-20T00:00:00Z', last_session_at: '2025-03-13T07:00:00Z',
  },
  {
    id: 'c4', trainer_clerk_id: 'trainer', client_clerk_id: 'u4',
    client_name: 'Marcus Thompson', client_email: 'marcus@example.com',
    client_avatar_url: CLIENT_AVATARS[3], status: 'active',
    goal: 'Strength & Flexibility', notes: 'Sedentary job. Focus on posture and core.',
    total_sessions: 8, joined_at: '2025-01-10T00:00:00Z', last_session_at: '2025-03-11T12:00:00Z',
  },
  {
    id: 'c5', trainer_clerk_id: 'trainer', client_clerk_id: 'u5',
    client_name: 'Aria Patel', client_email: 'aria@example.com',
    client_avatar_url: CLIENT_AVATARS[4], status: 'inactive',
    goal: 'General Fitness', notes: 'On hold - travelling for 2 months.',
    total_sessions: 12, joined_at: '2024-10-05T00:00:00Z', last_session_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 'c6', trainer_clerk_id: 'trainer', client_clerk_id: 'u6',
    client_name: 'David Kim', client_email: 'david@example.com',
    client_avatar_url: CLIENT_AVATARS[5], status: 'active',
    goal: 'Athletic Performance', notes: 'Amateur soccer player. Speed and agility.',
    total_sessions: 45, joined_at: '2024-04-01T00:00:00Z', last_session_at: '2025-03-14T16:00:00Z',
  },
];

const CLIENT_STATS: Record<string, { streak: number; progress: number; nextGoal: string }> = {
  'c1': { streak: 8, progress: 72, nextGoal: 'Lose 5 lbs' },
  'c2': { streak: 12, progress: 58, nextGoal: 'Bench 250lbs' },
  'c3': { streak: 21, progress: 85, nextGoal: 'Sub-4hr marathon' },
  'c4': { streak: 3, progress: 30, nextGoal: 'Touch toes' },
  'c5': { streak: 0, progress: 45, nextGoal: 'Return to training' },
  'c6': { streak: 15, progress: 90, nextGoal: 'Sprint 100m under 11s' },
};

export default function TrainerClients() {
  const { appUser } = useAppUser();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClient, setSelectedClient] = useState<TrainerClientRow | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: clients = MOCK_CLIENTS } = useQuery({
    queryKey: ['clients', appUser?.id],
    queryFn: () => trainerService.getClients(appUser!.id),
    enabled: !!appUser,
    placeholderData: MOCK_CLIENTS,
  });

  const filtered = clients.filter(c => {
    const matchesSearch = c.client_name.toLowerCase().includes(search.toLowerCase()) ||
      c.client_email.toLowerCase().includes(search.toLowerCase()) ||
      c.goal.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = clients.filter(c => c.status === 'active').length;
  const totalSessions = clients.reduce((s, c) => s + c.total_sessions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">My Clients</h1>
          <p className="text-slate-400 font-medium mt-1">Manage and track your client roster</p>
        </div>
        <Button className="rounded-2xl font-bold gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Clients', value: activeCount, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Sessions', value: totalSessions, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Sessions', value: clients.length > 0 ? Math.round(totalSessions / clients.length) : 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-slate-400 text-sm font-medium mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients by name, email, or goal..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
        <div className="flex bg-slate-100 rounded-2xl p-1">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all',
                statusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Client List */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="font-bold text-slate-500">No clients found</p>
            </div>
          ) : (
            filtered.map((client, i) => {
              const stats = CLIENT_STATS[client.id] || { streak: 0, progress: 0, nextGoal: '' };
              const isSelected = selectedClient?.id === client.id;
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedClient(isSelected ? null : client)}
                  className={cn(
                    'bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md',
                    isSelected ? 'border-accent/30 shadow-md shadow-accent/5 ring-1 ring-accent/20' : 'border-slate-100'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={client.client_avatar_url || getAvatar(client.id)}
                        alt={client.client_name}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                      <span className={cn(
                        'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white',
                        client.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-black text-slate-900 truncate">{client.client_name}</p>
                        {stats.streak > 7 && (
                          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {stats.streak}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm font-medium truncate">{client.goal}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-900">{client.total_sessions}</p>
                      <p className="text-xs text-slate-400 font-medium">sessions</p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === client.id ? null : client.id); }}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                      <AnimatePresence>
                        {openMenu === client.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden w-44 z-20"
                          >
                            {['View Profile', 'Send Message', 'Schedule Session', 'View Progress'].map(action => (
                              <button
                                key={action}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                onClick={e => { e.stopPropagation(); setOpenMenu(null); }}
                              >
                                {action}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-400">Progress toward goal</span>
                      <span className="text-xs font-black text-accent">{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progress}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 + 0.2 }}
                        className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Client Detail Sidebar */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedClient ? (
              <motion.div
                key={selectedClient.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-0"
              >
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={selectedClient.client_avatar_url || getAvatar(selectedClient.id)}
                      alt={selectedClient.client_name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
                    />
                    <div>
                      <p className="font-black text-white text-lg">{selectedClient.client_name}</p>
                      <p className="text-slate-400 text-sm">{selectedClient.client_email}</p>
                      <span className={cn(
                        'inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full',
                        selectedClient.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      )}>
                        {selectedClient.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Sessions', value: selectedClient.total_sessions },
                      { label: 'Streak', value: `${CLIENT_STATS[selectedClient.id]?.streak || 0}d` },
                      { label: 'Progress', value: `${CLIENT_STATS[selectedClient.id]?.progress || 0}%` },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-white font-black text-lg leading-none">{stat.value}</p>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Current Goal</p>
                    <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-xl border border-accent/10">
                      <Target className="w-4 h-4 text-accent shrink-0" />
                      <p className="text-slate-900 font-bold text-sm">{selectedClient.goal}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Trainer Notes</p>
                    <p className="text-slate-600 text-sm leading-relaxed p-3 bg-slate-50 rounded-xl">{selectedClient.notes || 'No notes yet'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-slate-400 text-xs font-medium">Joined</p>
                      <p className="font-bold text-slate-900 mt-0.5">{format(new Date(selectedClient.joined_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-slate-400 text-xs font-medium">Last Session</p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {selectedClient.last_session_at
                          ? formatDistanceToNow(new Date(selectedClient.last_session_at), { addSuffix: true })
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 rounded-xl font-bold gap-2 text-sm">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Button>
                    <Button className="flex-1 rounded-xl font-bold gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-slate-100 p-10 text-center"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-bold text-slate-500 mb-1">Select a client</p>
                <p className="text-slate-400 text-sm">Click any client to view their full profile and session history</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
