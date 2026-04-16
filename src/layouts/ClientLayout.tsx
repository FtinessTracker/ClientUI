import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar, Dumbbell, Utensils, ClipboardList, User,
  LogOut, Bell, Menu, X, Settings, ChevronRight, ShoppingBag, BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { authService } from '../services/authService';
import { useAppUser } from '../hooks/useAppUser';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Workouts', href: '/workouts', icon: Dumbbell },
  { label: 'Nutrition', href: '/nutrition', icon: Utensils },
  { label: 'Plans', href: '/plans', icon: ClipboardList },
  { label: 'Products', href: '/products', icon: ShoppingBag },
  { label: 'Research', href: '/research', icon: BookOpen },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { appUser } = useAppUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = appUser?.name || 'User';
  const avatarUrl: string | undefined = undefined;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    setProfileOpen(false);
    authService.signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <header
        className={cn(
          'bg-white sticky top-0 z-40 transition-all duration-300',
          scrolled ? 'border-b border-slate-200/80 shadow-sm shadow-slate-900/[0.04]' : 'border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[62px]">

            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-10">
              <Link to="/calendar" className="flex items-center gap-2.5 shrink-0 group">
                <div className="bg-slate-900 p-1.5 rounded-xl transition-transform group-hover:scale-105 duration-200">
                  <Dumbbell className="text-accent w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-tighter text-slate-900">TrainLiv</span>
              </Link>

              <nav className="hidden md:flex items-center h-[62px]">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                  const isActive = location.pathname === href;
                  return (
                    <Link
                      key={href}
                      to={href}
                      className={cn(
                        'relative flex items-center gap-2 h-full px-4 text-[13.5px] font-semibold transition-colors duration-150',
                        isActive
                          ? 'text-slate-900'
                          : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-[15px] h-[15px] transition-colors',
                          isActive ? 'text-accent' : 'text-slate-400'
                        )}
                      />
                      {label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-t-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                aria-label="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-accent rounded-full border-[1.5px] border-white" />
              </button>

              {/* Profile */}
              <div className="relative ml-1" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className={cn(
                    'flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl transition-colors',
                    profileOpen ? 'bg-slate-100' : 'hover:bg-slate-100'
                  )}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-[11px] tracking-wide">
                      {initials}
                    </div>
                  )}
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-[13px] font-bold text-slate-800 leading-none">
                      {displayName.split(' ')[0]}
                    </p>
                    <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">Member</p>
                  </div>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/60">
                        <p className="font-bold text-slate-900 text-sm leading-none mb-1">{displayName}</p>
                        <p className="text-slate-400 text-[11.5px] truncate font-medium">
                          {clerkUser?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700">My Profile</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </Link>
                        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <Settings className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700">Settings</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </button>
                      </div>
                      <div className="p-1.5 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                          </div>
                          <span className="text-[13px] font-semibold text-red-500">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors ml-1"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen
                  ? <X className="w-[18px] h-[18px] text-slate-600" />
                  : <Menu className="w-[18px] h-[18px] text-slate-600" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
            >
              <nav className="px-3 py-2 space-y-0.5">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                  const isActive = location.pathname === href;
                  return (
                    <Link
                      key={href}
                      to={href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-semibold transition-all',
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-slate-400')} />
                      {label}
                    </Link>
                  );
                })}
                <div className="pt-2 pb-1 border-t border-slate-100 mt-2 space-y-0.5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-semibold text-red-500 hover:bg-red-50 transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
