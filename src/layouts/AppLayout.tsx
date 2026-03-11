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
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { mockApi } from '../services/mockApi';

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

export default function AppLayout({ children, user }: { children: React.ReactNode, user: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await mockApi.logout();
    navigate('/login');
    window.location.reload();
  };

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-white/5",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center gap-3">
            <div className="bg-accent p-2 rounded-xl shadow-lg shadow-accent/20">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tighter">FlexFit</span>
          </div>

          <div className="px-6 mb-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Award className="text-accent w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Membership</p>
                  <p className="text-sm font-bold">FlexFit Pro</p>
                </div>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-accent h-full w-3/4" />
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1.5">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                      : "hover:bg-white/5 text-slate-400 hover:text-white"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {isActive && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-accent rounded-r-full" />}
                  <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-accent" : "text-slate-500 group-hover:text-slate-300")} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 mt-auto">
            <div className="bg-slate-900 rounded-2xl p-4 border border-white/5 mb-4">
              <p className="text-xs font-bold text-slate-500 mb-2">SUPPORT</p>
              <Button variant="ghost" className="w-full justify-start h-9 text-slate-400 hover:text-white hover:bg-white/5 px-2 rounded-lg text-sm">
                <Settings className="mr-3 w-4 h-4" />
                Settings
              </Button>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-4"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 w-5 h-5" />
              <span className="font-bold">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              className="lg:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden md:flex items-center gap-3 text-sm font-medium">
              <span className="text-slate-400">Pages</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold capitalize">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="pl-11 pr-6 py-2.5 bg-slate-100 border-transparent rounded-full text-sm w-72 focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all outline-none font-medium"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-slate-100 rounded-xl relative transition-colors group">
                <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
              </button>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
                <MessageSquare className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
              </button>
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                <p className="text-[10px] font-extrabold text-accent uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-lg shadow-slate-900/20 ring-2 ring-white">
                {user.name[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto p-6 lg:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
