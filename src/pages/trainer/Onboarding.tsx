import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import {
  Dumbbell, ChevronRight, ChevronLeft, Check, User, Briefcase, DollarSign,
  Clock, MapPin, Instagram, Globe, Plus, X, Camera, Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { trainerService } from '../../services/trainerService';

const SPECIALTIES = [
  'Strength Training', 'HIIT', 'Yoga', 'Pilates', 'Cardio', 'Nutrition',
  'CrossFit', 'Mobility', 'Rehab', 'Senior Fitness', 'Sports Performance',
  'Weight Loss', 'Muscle Gain', 'Mindfulness', 'Boxing', 'Swimming',
];

const CERTIFICATIONS = [
  'NASM-CPT', 'ACE-CPT', 'NSCA-CSCS', 'ACSM-CPT', 'ISSA-CPT',
  'RYT-200', 'RYT-500', 'Precision Nutrition L1', 'FMS', 'CrossFit L1',
  'First Aid/CPR', 'TRX', 'Kettlebell Certified', 'DPT',
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Portuguese', 'Arabic', 'Hindi'];

interface FormState {
  displayName: string;
  bio: string;
  location: string;
  yearsExperience: number;
  specialties: string[];
  certifications: string[];
  languages: string[];
  pricePerHour: number;
  instagramUrl: string;
  websiteUrl: string;
  isAcceptingClients: boolean;
}

const STEPS = [
  { id: 1, label: 'About You', icon: User },
  { id: 2, label: 'Expertise', icon: Award },
  { id: 3, label: 'Business', icon: Briefcase },
];

export default function TrainerOnboarding() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    displayName: user?.fullName || '',
    bio: '',
    location: '',
    yearsExperience: 1,
    specialties: [],
    certifications: [],
    languages: ['English'],
    pricePerHour: 60,
    instagramUrl: '',
    websiteUrl: '',
    isAcceptingClients: true,
  });

  const toggleItem = (key: 'specialties' | 'certifications' | 'languages', item: string) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item],
    }));
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await trainerService.upsertProfile({
        clerk_user_id: user.id,
        display_name: form.displayName,
        bio: form.bio,
        location: form.location,
        years_experience: form.yearsExperience,
        specialties: form.specialties,
        certifications: form.certifications,
        languages: form.languages,
        price_per_hour: form.pricePerHour,
        instagram_url: form.instagramUrl,
        website_url: form.websiteUrl,
        is_accepting_clients: form.isAcceptingClients,
        avatar_url: user.imageUrl || '',
      });
      navigate('/dashboard');
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-accent p-2.5 rounded-2xl shadow-lg shadow-accent/30">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <span className="text-white text-2xl font-black tracking-tighter">TrainLiv</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Set Up Your Trainer Profile</h1>
          <p className="text-slate-400 font-medium">Let clients discover you in under 3 minutes</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all',
                  step === s.id ? 'bg-accent text-white' : step > s.id ? 'text-accent cursor-pointer' : 'text-slate-600'
                )}
              >
                {step > s.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                {s.label}
              </button>
              {idx < STEPS.length - 1 && (
                <div className={cn('w-12 h-px', step > s.id ? 'bg-accent' : 'bg-slate-800')} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Tell us about yourself</h2>
                <p className="text-slate-400 text-sm">Your public profile that clients will see</p>
              </div>

              {/* Avatar hint */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Profile photo</p>
                  <p className="text-slate-400 text-xs mt-0.5">Managed through your account settings</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Display Name</label>
                <input
                  value={form.displayName}
                  onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell clients about your training philosophy, background, and what makes you unique..."
                  rows={4}
                  className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-medium resize-none"
                />
                <p className="text-slate-500 text-xs mt-1.5 text-right">{form.bio.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">
                    <MapPin className="inline w-3.5 h-3.5 mr-1" />
                    Location
                  </label>
                  <input
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="City, Country"
                    className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">
                    <Clock className="inline w-3.5 h-3.5 mr-1" />
                    Years of Experience
                  </label>
                  <select
                    value={form.yearsExperience}
                    onChange={e => setForm(p => ({ ...p, yearsExperience: Number(e.target.value) }))}
                    className="w-full bg-slate-800 border border-white/15 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-accent/50 transition-all font-medium"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,15,20].map(n => (
                      <option key={n} value={n}>{n}+ year{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Your Expertise</h2>
                <p className="text-slate-400 text-sm">Help clients find you by your specialties</p>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-3">Specialties (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleItem('specialties', s)}
                      className={cn(
                        'px-3.5 py-2 rounded-full text-sm font-bold transition-all',
                        form.specialties.includes(s)
                          ? 'bg-accent text-white shadow-lg shadow-accent/25'
                          : 'bg-white/8 border border-white/15 text-slate-300 hover:border-accent/30 hover:text-white'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-3">Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleItem('certifications', c)}
                      className={cn(
                        'px-3.5 py-2 rounded-full text-sm font-bold transition-all',
                        form.certifications.includes(c)
                          ? 'bg-slate-700 text-white border border-white/20'
                          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-3">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => (
                    <button
                      key={l}
                      onClick={() => toggleItem('languages', l)}
                      className={cn(
                        'px-3.5 py-2 rounded-full text-sm font-bold transition-all',
                        form.languages.includes(l)
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Business Details</h2>
                <p className="text-slate-400 text-sm">Set your rates and online presence</p>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  <DollarSign className="inline w-3.5 h-3.5 mr-1" />
                  Price per Hour
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={form.pricePerHour}
                    onChange={e => setForm(p => ({ ...p, pricePerHour: Number(e.target.value) }))}
                    min={10}
                    max={1000}
                    className="w-full bg-white/8 border border-white/15 rounded-2xl pl-8 pr-4 py-3.5 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-bold text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">/ hr</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {[40, 60, 80, 100, 120, 150].map(price => (
                    <button
                      key={price}
                      onClick={() => setForm(p => ({ ...p, pricePerHour: price }))}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-bold transition-all',
                        form.pricePerHour === price
                          ? 'bg-accent text-white'
                          : 'bg-white/8 border border-white/15 text-slate-400 hover:text-white'
                      )}
                    >
                      ${price}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  <Instagram className="inline w-3.5 h-3.5 mr-1" />
                  Instagram (optional)
                </label>
                <input
                  value={form.instagramUrl}
                  onChange={e => setForm(p => ({ ...p, instagramUrl: e.target.value }))}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  <Globe className="inline w-3.5 h-3.5 mr-1" />
                  Website (optional)
                </label>
                <input
                  value={form.websiteUrl}
                  onChange={e => setForm(p => ({ ...p, websiteUrl: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-medium"
                />
              </div>

              <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">Accepting New Clients</p>
                  <p className="text-slate-400 text-xs mt-0.5">Toggle off if your schedule is full</p>
                </div>
                <button
                  onClick={() => setForm(p => ({ ...p, isAcceptingClients: !p.isAcceptingClients }))}
                  className={cn(
                    'w-12 h-6 rounded-full transition-all relative',
                    form.isAcceptingClients ? 'bg-accent' : 'bg-slate-700'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                    form.isAcceptingClients ? 'left-6.5' : 'left-0.5'
                  )} />
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
              className="text-slate-400 hover:text-white gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? 'Back to home' : 'Previous'}
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !form.displayName.trim()}
                className="bg-accent hover:bg-accent/90 text-white rounded-2xl px-6 font-bold gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                isLoading={saving}
                className="bg-accent hover:bg-accent/90 text-white rounded-2xl px-6 font-bold gap-2"
              >
                <Check className="w-4 h-4" />
                Launch My Profile
              </Button>
            )}
          </div>
        </motion.div>

        <p className="text-center text-slate-600 text-xs mt-6">
          You can update everything in Settings later
        </p>
      </div>
    </div>
  );
}
