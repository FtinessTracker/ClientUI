import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  ChevronRight,
  Grid,
  List as ListIcon,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockApi } from '../../services/mockApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';

export default function TrainerDiscovery() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['trainers', search],
    queryFn: () => mockApi.getTrainers({ search })
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Find Your Expert</h1>
          <p className="text-slate-500 font-medium text-lg">Discover world-class trainers tailored to your unique fitness goals.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "rounded-xl h-9 px-4 font-bold transition-all",
              viewMode === 'grid' ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
            )}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "rounded-xl h-9 px-4 font-bold transition-all",
              viewMode === 'list' ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
            )}
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by name, specialty, or goal..." 
            className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-primary/20 transition-all text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className={cn(
            "h-14 px-8 rounded-2xl gap-3 font-bold border-slate-200 transition-all",
            showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters (Expandable) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <Card className="border-none bg-slate-50 rounded-[2rem]">
              <CardContent className="p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Specialty</label>
                  <select className="w-full bg-white border-none shadow-sm rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary/20">
                    <option>All Specialties</option>
                    <option>Yoga & Mindfulness</option>
                    <option>HIIT & Cardio</option>
                    <option>Strength & Conditioning</option>
                    <option>Nutrition Coaching</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Price Range</label>
                  <select className="w-full bg-white border-none shadow-sm rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary/20">
                    <option>Any Price</option>
                    <option>$0 - $50</option>
                    <option>$50 - $100</option>
                    <option>$100+</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Rating</label>
                  <select className="w-full bg-white border-none shadow-sm rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary/20">
                    <option>Any Rating</option>
                    <option>4.5+ Stars</option>
                    <option>4.8+ Stars</option>
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <Button variant="ghost" className="flex-1 h-11 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-900" onClick={() => setShowFilters(false)}>Reset</Button>
                  <Button className="flex-1 h-11 rounded-xl text-xs font-bold">Apply</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trainer Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[450px] rounded-[2.5rem]" />)}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "flex flex-col gap-6"
        )}>
          {trainers?.map((trainer, idx) => (
            <motion.div
              key={trainer.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Card className={cn(
                "group overflow-hidden hover:shadow-2xl transition-all duration-500 border-none rounded-[2.5rem] bg-white",
                viewMode === 'list' && "flex flex-col md:flex-row"
              )}>
                <div className={cn(
                  "relative overflow-hidden",
                  viewMode === 'grid' ? "aspect-[4/5]" : "md:w-72 shrink-0 aspect-square md:aspect-auto"
                )}>
                  <img 
                    src={trainer.avatar} 
                    alt={trainer.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-sm font-black shadow-xl">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    {trainer.rating}
                  </div>

                  {idx === 0 && (
                    <div className="absolute top-6 left-6 bg-primary text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Featured
                    </div>
                  )}
                </div>
                
                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{trainer.name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>Online & In-person</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">${trainer.pricePerHour}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Per Hour</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {trainer.specialties.map(s => (
                        <span key={s} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                          {s}
                        </span>
                      ))}
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                      Expert trainer with over 8 years of experience helping clients achieve their peak performance through tailored programs.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                    <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-slate-200 hover:bg-slate-50" asChild>
                      <Link to={`/trainer/${trainer.id}`}>Profile</Link>
                    </Button>
                    <Button className="flex-1 h-12 rounded-2xl font-bold shadow-xl shadow-primary/20" asChild>
                      <Link to={`/book/${trainer.id}`}>Book Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {trainers?.length === 0 && (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="max-w-sm mx-auto">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Search className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">No trainers found</h3>
                <p className="text-slate-500 font-medium mb-8">We couldn't find any trainers matching your current search or filters. Try broadening your criteria.</p>
                <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold border-slate-200" onClick={() => { setSearch(''); setShowFilters(false); }}>
                  Clear all filters
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
