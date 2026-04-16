import React from 'react';
import { motion } from 'framer-motion';
import {
  Star, Clock, TrendingUp, Users, ShoppingCart
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  videoCount: number;
  rating: number; // out of 5
  reviews: number;
  thumbnail?: string;
  isTrending: boolean;
  purchasesIn24h: number;
  price?: number;
}

export default function WorkoutPlans() {
  // Mock data for workout plans
  const workoutPlans: WorkoutPlan[] = [
    {
      id: '1',
      title: 'Full Body HIIT Bootcamp',
      description: 'High-intensity interval training focusing on full body strengthening and cardio endurance',
      duration: 180,
      videoCount: 12,
      rating: 4.8,
      reviews: 342,
      isTrending: true,
      purchasesIn24h: 127,
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    },
    {
      id: '2',
      title: 'Core Strength Foundation',
      description: 'Build a strong core with targeted exercises and progressive difficulty levels',
      duration: 120,
      videoCount: 8,
      rating: 4.6,
      reviews: 218,
      isTrending: true,
      purchasesIn24h: 89,
      thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=300&fit=crop',
    },
    {
      id: '3',
      title: 'Yoga Flow & Flexibility',
      description: 'Improve flexibility, balance, and mental clarity with guided yoga sessions',
      duration: 150,
      videoCount: 10,
      rating: 4.9,
      reviews: 456,
      isTrending: false,
      purchasesIn24h: 156,
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    },
    {
      id: '4',
      title: 'Cardio Blast Series',
      description: 'Intense cardio workouts to boost metabolism and improve cardiovascular health',
      duration: 200,
      videoCount: 14,
      rating: 4.7,
      reviews: 289,
      isTrending: true,
      purchasesIn24h: 203,
      thumbnail: 'https://images.unsplash.com/photo-1552821206-7f6b5c1b27b8?w=400&h=300&fit=crop',
    },
    {
      id: '5',
      title: 'Strength Training Essentials',
      description: 'Master proper form and build muscle with comprehensive strength training guide',
      duration: 240,
      videoCount: 16,
      rating: 4.8,
      reviews: 521,
      isTrending: false,
      purchasesIn24h: 98,
      thumbnail: 'https://images.unsplash.com/photo-1540497238246-169051072451?w=400&h=300&fit=crop',
    },
    {
      id: '6',
      title: 'Post-Workout Recovery',
      description: 'Essential stretching and recovery techniques to prevent injury and enhance performance',
      duration: 90,
      videoCount: 6,
      rating: 4.5,
      reviews: 167,
      isTrending: false,
      purchasesIn24h: 45,
      thumbnail: 'https://images.unsplash.com/photo-1571384368434-4cf8821873d2?w=400&h=300&fit=crop',
    },
  ];

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-3.5 h-3.5',
              i < Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Workout Plans
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">
            {workoutPlans.length} workout plans available
          </p>
        </div>
      </motion.div>

      {/* Workout Plans List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {workoutPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.05 }}
          >
            <Card className="border-slate-200 hover:border-accent/50 hover:shadow-md transition-all duration-300 overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-40 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                    {plan.thumbnail ? (
                      <img
                        src={plan.thumbnail}
                        alt={plan.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <span className="text-slate-400 font-bold text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    {/* Title & Description */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <h3 className="text-lg font-black text-slate-900 line-clamp-1">
                          {plan.title}
                        </h3>
                        {plan.isTrending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 font-medium line-clamp-2">
                        {plan.description}
                      </p>
                    </div>

                    {/* Rating, Duration, Video Count */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {/* Rating */}
                      <div className="flex items-center gap-1.5">
                        {renderStars(plan.rating)}
                        <span className="text-sm font-bold text-slate-900">
                          {plan.rating}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          ({plan.reviews})
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatDuration(plan.duration)}
                      </div>

                      {/* Video Count */}
                      <div className="text-sm font-bold text-slate-600">
                        {plan.videoCount} videos
                      </div>

                      {/* Purchases in 24h */}
                      <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <Users className="w-3.5 h-3.5" />
                        100+ bought in 24h
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col items-center justify-between gap-3">
                    <div className="text-center">
                      <p className="text-sm text-slate-400 font-medium">Price</p>
                      <p className="text-2xl font-black text-slate-900">
                        {plan.price ? `$${plan.price}` : 'Free'}
                      </p>
                    </div>
                    <Button className="rounded-xl font-bold w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Explore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State (for future use when no plans exist) */}
      {workoutPlans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-dashed border-slate-200 rounded-2xl">
            <CardContent className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">No workout plans yet</h3>
              <p className="text-sm text-slate-400 font-medium">
                Create your first workout plan to get started
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
