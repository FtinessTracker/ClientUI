import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Star, MapPin, Clock, SlidersHorizontal, Grid, List as ListIcon, X, Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockApi } from '../../services/mockApi';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';

const SPECIALTIES = ['All', 'Yoga', 'HIIT', 'Strength', 'Pilates', 'Nutrition', 'Rehab', 'Mindfulness'];

const TRAINER_IMAGES: Record<string, string> = {
  t1: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=600',
  t2: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600',
  t3: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600',
};

export default function TrainerDiscovery() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState('All');

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['trainers', search],
    queryFn: () => mockApi.getTrainers({ search }),
  });

  const filtered = trainers?.filter((t) =>
    activeSpecialty === 'All' || t.specialties.some((s) => s.toLowerCase().includes(activeSpecialty.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-accent text-xs font-black uppercase tracking-[0.2em] mb-2">Discover</p>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-1.5">Find Your Expert</h1>
        <p className="text-slate-400 font-medium">Explore world-class trainers matched to your fitness goals.</p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="flex gap-3"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search by name, specialty, or goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent/40 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'h-12 px-5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all border',
            showFilters
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 shadow-sm'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
        <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          {(['grid', 'list'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center transition-all',
                viewMode === mode ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {mode === 'grid' ? <Grid className="w-4 h-4" /> : <ListIcon className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Specialty Filter Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        {SPECIALTIES.map((spec) => (
          <button
            key={spec}
            onClick={() => setActiveSpecialty(spec)}
            className={cn(
              'shrink-0 h-9 px-4 rounded-full text-xs font-bold transition-all border',
              activeSpecialty === spec
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            )}
          >
            {spec}
          </button>
        ))}
      </motion.div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-4 gap-5 shadow-sm">
              {[
                { label: 'Price Range', options: ['Any Price', 'Under $60/hr', '$60–$90/hr', '$90+/hr'] },
                { label: 'Rating', options: ['Any Rating', '4.5+ Stars', '4.8+ Stars', '5.0 Stars'] },
                { label: 'Language', options: ['Any Language', 'English', 'Spanish', 'Mandarin'] },
                { label: 'Availability', options: ['Any Time', 'Morning', 'Afternoon', 'Evening'] },
              ].map(({ label, options }) => (
                <div key={label}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent/40 transition-all">
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {!isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-semibold text-slate-400"
        >
          {filtered?.length ?? 0} trainers found
          {activeSpecialty !== 'All' && <span> in <span className="text-accent font-black">{activeSpecialty}</span></span>}
        </motion.p>
      )}

      {/* Trainer Grid/List */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'flex flex-col gap-4')}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className={cn('rounded-2xl', viewMode === 'grid' ? 'h-[440px]' : 'h-40')} />
          ))}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'flex flex-col gap-4'
        )}>
          <AnimatePresence>
            {filtered?.map((trainer, idx) => (
              <motion.div
                key={trainer.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
              >
                {viewMode === 'grid' ? (
                  <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-400">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={TRAINER_IMAGES[trainer.id] || trainer.avatar}
                        alt={trainer.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent" />

                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-full shadow-md">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        <span className="text-xs font-black text-slate-900">{trainer.rating}</span>
                        <span className="text-xs text-slate-400 font-medium">({trainer.reviewCount})</span>
                      </div>

                      {idx === 0 && (
                        <div className="absolute top-4 left-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                          Featured
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-white font-black text-xl tracking-tight mb-0.5">{trainer.name}</h3>
                        <div className="flex gap-1.5 flex-wrap">
                          {trainer.specialties.slice(0, 2).map((s) => (
                            <span key={s} className="bg-white/15 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-black text-slate-900">${trainer.pricePerHour}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">per hour</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          Online
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold text-sm border-slate-200" asChild>
                          <Link to={`/trainer/${trainer.id}`}>Profile</Link>
                        </Button>
                        <Button className="flex-1 h-10 rounded-xl font-bold text-sm shadow-md shadow-slate-900/10" asChild>
                          <Link to={`/book/${trainer.id}`}>Book Now</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex">
                    <div className="w-36 shrink-0 relative overflow-hidden">
                      <img
                        src={TRAINER_IMAGES[trainer.id] || trainer.avatar}
                        alt={trainer.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-black text-slate-900 text-lg">{trainer.name}</h3>
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-xs font-black text-amber-700">{trainer.rating}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {trainer.specialties.map((s) => (
                            <span key={s} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {s}
                            </span>
                          ))}
                        </div>
                        <p className="text-slate-400 text-sm font-medium">{trainer.reviewCount} reviews · ${trainer.pricePerHour}/hr</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" className="h-10 rounded-xl font-bold text-sm border-slate-200 px-5" asChild>
                          <Link to={`/trainer/${trainer.id}`}>Profile</Link>
                        </Button>
                        <Button className="h-10 rounded-xl font-bold text-sm px-5 shadow-md shadow-slate-900/10" asChild>
                          <Link to={`/book/${trainer.id}`}>Book</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered?.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="w-9 h-9 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No trainers found</h3>
              <p className="text-slate-400 font-medium mb-6 max-w-xs mx-auto">Try broadening your search or clearing filters.</p>
              <Button
                variant="outline"
                className="rounded-2xl h-11 px-7 font-bold border-slate-200"
                onClick={() => { setSearch(''); setActiveSpecialty('All'); }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
