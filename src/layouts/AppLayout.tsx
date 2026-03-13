import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Calendar,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Dumbbell,
  MessageSquare,
  CreditCard,
  Award,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ('client' | 'trainer')[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['client', 'trainer'] },
  { label: 'Find Trainers', href: '/trainers', icon: Search, roles: ['client'] },
  { label: 'My Schedule', href: '/schedule', icon: Calendar, roles: ['client', 'trainer'] },
  { label: 'Messages', href: '/messages', icon: MessageSquare, roles: ['client', 'trainer'] },
  { label: 'Payments', href: '/payments', icon: CreditCard, roles: ['client', 'trainer'] },
  { label: 'Profile', href: '/profile', icon: User, roles: ['client', 'trainer'] },
];

export default function AppLayout({ children, user }: { children: React.ReactNode; user: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const userRole = user?.role || 'client';
  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));
  const displayName = user?.name || clerkUser?.fullName || 'User';
  const avatarUrl = clerkUser?.imageUrl;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-white/5 flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="p-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-xl shadow-lg shadow-accent/25">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tighter">FlexFit</span>
          </div>
          <button
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="px-5 mb-6">
          <div className="bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl p-4 border border-accent/15">
            <div className="flex items-center gap-3 mb-3">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt={displayName} className="w-10 h-10 rounded-xl object-cover border-2 border-white/15 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-accent/30 border border-accent/25 flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-sm">{initials}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">{displayName.split(' ')[0]}</p>
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.15em]">Pro Member</p>
              </div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="bg-gradient-to-r from-accent to-emerald-400 h-full rounded-full"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 font-semibold">75% of monthly goal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] mb-3">
            Main Menu
          </p>
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-0.5 h-5 bg-accent rounded-r-full"
                  />
                )}
                <item.icon
                  className={cn(
                    'w-4 h-4 transition-colors shrink-0',
                    isActive ? 'text-accent' : 'text-slate-600 group-hover:text-slate-300'
                  )}
                />
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-5 mt-auto border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl px-4 mb-2 text-sm"
          >
            <Settings className="mr-3 w-4 h-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-4"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 w-4 h-4" />
            <span className="font-bold text-sm">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-18 bg-white/80 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between px-6 lg:px-8 shrink-0 z-30 h-[72px]">
          <div className="flex items-center gap-5">
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="hidden md:flex items-center gap-2.5 text-sm">
              <span className="text-slate-400 font-medium">Pages</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold capitalize">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search everything..."
                className="pl-10 pr-5 py-2 bg-slate-100 border-transparent rounded-full text-sm w-64 focus:bg-white focus:ring-2 focus:ring-accent/15 focus:border-accent/20 transition-all outline-none font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-slate-100 rounded-xl relative transition-colors group">
                <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
                <MessageSquare className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
              </button>
            </div>

            {/* User Profile */}
            <div className="pl-4 border-l border-slate-200 relative">
              <button
                className="flex items-center gap-3 hover:bg-slate-50 rounded-xl px-3 py-2 transition-colors group"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">{displayName}</p>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-0.5">{userRole}</p>
                </div>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-white shadow-md"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white text-sm">
                    {initials}
                  </div>
                )}
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', userMenuOpen && 'rotate-180')} />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">{displayName}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">View Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-500">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/80">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
