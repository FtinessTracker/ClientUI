import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar, Dumbbell, Utensils, ClipboardList, User,
  LogOut, Bell, Menu, X, ChevronDown, Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerk, useUser } from '@clerk/clerk-react';
import { cn } from '../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Workouts', href: '/workouts', icon: Dumbbell },
  { label: 'Nutrition', href: '/nutrition', icon: Utensils },
  { label: 'Plans', href: '/plans', icon: ClipboardList },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = clerkUser?.fullName || clerkUser?.firstName || 'User';
  const avatarUrl = clerkUser?.imageUrl;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/calendar" className="flex items-center gap-2.5 shrink-0">
                <div className="bg-slate-900 p-1.5 rounded-xl">
                  <Dumbbell className="text-accent w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-tighter text-slate-900">FlexFit</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                  const isActive = location.pathname === href;
                  return (
                    <Link
                      key={href}
                      to={href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200',
                        isActive
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : '')} />
                      {label}
                      {isActive && (
                        <motion.div
                          layoutId="activeClientNav"
                          className="absolute bottom-0 left-0 right-0"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-xl object-cover ring-2 ring-white shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-bold text-slate-800">
                    {displayName.split(' ')[0]}
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', profileOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100">
                        <p className="font-bold text-slate-900 text-sm">{displayName}</p>
                        <p className="text-slate-400 text-xs mt-0.5 truncate">
                          {clerkUser?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">My Profile</span>
                        </Link>
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

              <button
                className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                onClick={() => setMobileOpen(v => !v)}
              >
                {mobileOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-100 bg-white"
            >
              <nav className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                  const isActive = location.pathname === href;
                  return (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : '')} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
