import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { User, Star, Award, Globe, Instagram, MapPin, Clock, DollarSign, CreditCard as Edit3, Check, X, Camera, ExternalLink, Plus, Trash2, ChevronRight, Languages, Briefcase, Shield, TrendingUp, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { trainerService } from '../../services/trainerService';
import { useAppUser } from '../../hooks/useAppUser';
import { TrainerProfileRow } from '../../types/trainer';

const SPECIALTIES_OPTIONS = [
  'Strength Training', 'HIIT', 'Yoga', 'Pilates', 'Cardio', 'Nutrition',
  'CrossFit', 'Mobility', 'Rehab', 'Senior Fitness', 'Sports Performance',
  'Weight Loss', 'Muscle Gain', 'Mindfulness', 'Boxing',
];

const DEFAULT_PROFILE: Partial<TrainerProfileRow> = {
  display_name: 'Alex Coach',
  bio: 'Passionate fitness trainer with 5+ years helping clients achieve their goals. I believe in a holistic approach combining strength, cardio, and mindfulness for sustainable results.',
  location: 'New York, USA',
  years_experience: 5,
  specialties: ['Strength Training', 'HIIT', 'Nutrition'],
  certifications: ['NASM-CPT', 'Precision Nutrition L1'],
  languages: ['English', 'Spanish'],
  price_per_hour: 75,
  is_accepting_clients: true,
  rating: 4.9,
  review_count: 87,
  total_sessions: 312,
  instagram_url: '',
  website_url: '',
};

export default function TrainerProfile() {
  const { appUser } = useAppUser();
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<Partial<TrainerProfileRow>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', appUser?.id],
    queryFn: () => trainerService.getProfile(appUser!.id),
    enabled: !!appUser,
    placeholderData: DEFAULT_PROFILE as TrainerProfileRow,
  });

  const saveMutation = useMutation({
    mutationFn: (updates: Partial<TrainerProfileRow>) =>
      trainerService.upsertProfile({ clerk_user_id: appUser!.id, ...updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditingSection(null);
    },
  });

  const data = { ...DEFAULT_PROFILE, ...profile };

  const startEdit = (section: string) => {
    setDraftData({ ...data });
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setDraftData({});
  };

  const saveEdit = () => {
    saveMutation.mutate(draftData);
  };

  const toggleSpecialty = (s: string) => {
    const current = draftData.specialties || data.specialties || [];
    setDraftData(p => ({
      ...p,
      specialties: current.includes(s) ? current.filter(x => x !== s) : [...current, s],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">My Profile</h1>
          <p className="text-slate-400 font-medium mt-1">How clients see you on TrainLiv</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold',
            data.is_accepting_clients
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-slate-100 text-slate-500'
          )}>
            <span className={cn('w-2 h-2 rounded-full', data.is_accepting_clients ? 'bg-emerald-500' : 'bg-slate-400')} />
            {data.is_accepting_clients ? 'Accepting clients' : 'Not accepting'}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900" />
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-200">
                    {clerkUser?.imageUrl ? (
                      <img src={clerkUser.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    {data.rating}
                    <span className="text-slate-400 font-medium">({data.review_count} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{data.display_name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm flex-wrap">
                    {data.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {data.location}
                      </span>
                    )}
                    {(data.years_experience ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {data.years_experience}+ years
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-black text-slate-900">
                      <DollarSign className="w-3.5 h-3.5 text-accent" />
                      ${data.price_per_hour}/hr
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio Section */}
          <ProfileSection
            title="About Me"
            icon={User}
            onEdit={() => startEdit('bio')}
            isEditing={editingSection === 'bio'}
            onSave={saveEdit}
            onCancel={cancelEdit}
            saving={saveMutation.isPending}
          >
            {editingSection === 'bio' ? (
              <div className="space-y-4">
                <textarea
                  value={draftData.display_name ?? data.display_name ?? ''}
                  onChange={e => setDraftData(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="Display Name"
                  rows={1}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                />
                <textarea
                  value={draftData.bio ?? data.bio ?? ''}
                  onChange={e => setDraftData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Write something about yourself..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none font-medium text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Location</label>
                    <input
                      value={draftData.location ?? data.location ?? ''}
                      onChange={e => setDraftData(p => ({ ...p, location: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Years Experience</label>
                    <input
                      type="number"
                      value={draftData.years_experience ?? data.years_experience ?? 0}
                      onChange={e => setDraftData(p => ({ ...p, years_experience: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 leading-relaxed">{data.bio}</p>
            )}
          </ProfileSection>

          {/* Specialties */}
          <ProfileSection
            title="Specialties"
            icon={Briefcase}
            onEdit={() => startEdit('specialties')}
            isEditing={editingSection === 'specialties'}
            onSave={saveEdit}
            onCancel={cancelEdit}
            saving={saveMutation.isPending}
          >
            {editingSection === 'specialties' ? (
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES_OPTIONS.map(s => {
                  const active = (draftData.specialties || data.specialties || []).includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSpecialty(s)}
                      className={cn(
                        'px-3.5 py-2 rounded-full text-sm font-bold transition-all',
                        active ? 'bg-accent text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(data.specialties || []).map(s => (
                  <span key={s} className="px-3.5 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </ProfileSection>

          {/* Certifications */}
          <ProfileSection
            title="Certifications"
            icon={Award}
            onEdit={() => startEdit('certs')}
            isEditing={editingSection === 'certs'}
            onSave={saveEdit}
            onCancel={cancelEdit}
            saving={saveMutation.isPending}
          >
            <div className="space-y-2">
              {(data.certifications || []).map(cert => (
                <div key={cert} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{cert}</span>
                  {editingSection === 'certs' && (
                    <button
                      onClick={() => setDraftData(p => ({ ...p, certifications: (p.certifications || data.certifications || []).filter(c => c !== cert) }))}
                      className="ml-auto text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </ProfileSection>
        </div>

        {/* Right: Business Details */}
        <div className="space-y-4">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 rounded-3xl p-6 text-white"
          >
            <p className="text-slate-400 text-xs font-black uppercase tracking-wider mb-4">Performance</p>
            <div className="space-y-4">
              {[
                { label: 'Total Sessions', value: data.total_sessions || 0, icon: TrendingUp },
                { label: 'Reviews', value: data.review_count || 0, icon: Star },
                { label: 'Rating', value: data.rating?.toFixed(1) || '0.0', icon: Star },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <stat.icon className="w-4 h-4 text-accent" />
                    <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                  </div>
                  <span className="font-black text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pricing */}
          <ProfileSection
            title="Pricing"
            icon={DollarSign}
            onEdit={() => startEdit('pricing')}
            isEditing={editingSection === 'pricing'}
            onSave={saveEdit}
            onCancel={cancelEdit}
            saving={saveMutation.isPending}
          >
            {editingSection === 'pricing' ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Price per hour ($)</label>
                <input
                  type="number"
                  value={draftData.price_per_hour ?? data.price_per_hour ?? 0}
                  onChange={e => setDraftData(p => ({ ...p, price_per_hour: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-2xl font-black focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <div className="mt-4 flex items-center justify-between p-3 bg-accent/5 rounded-xl">
                  <span className="text-sm font-bold text-slate-700">Accepting clients</span>
                  <button
                    onClick={() => setDraftData(p => ({ ...p, is_accepting_clients: !p.is_accepting_clients }))}
                    className={cn(
                      'w-11 h-6 rounded-full transition-all relative',
                      (draftData.is_accepting_clients ?? data.is_accepting_clients) ? 'bg-accent' : 'bg-slate-300'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                      (draftData.is_accepting_clients ?? data.is_accepting_clients) ? 'left-5.5' : 'left-0.5'
                    )} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-4xl font-black text-slate-900">${data.price_per_hour}
                  <span className="text-slate-400 text-lg font-medium">/hr</span>
                </p>
              </div>
            )}
          </ProfileSection>

          {/* Languages */}
          <ProfileSection
            title="Languages"
            icon={Languages}
            onEdit={() => startEdit('languages')}
            isEditing={editingSection === 'languages'}
            onSave={saveEdit}
            onCancel={cancelEdit}
            saving={saveMutation.isPending}
          >
            <div className="flex flex-wrap gap-2">
              {(data.languages || []).map(lang => (
                <span key={lang} className="px-3.5 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
                  {lang}
                </span>
              ))}
            </div>
          </ProfileSection>

          {/* Links */}
          <ProfileSection
            title="Links & Social"
            icon={Globe}
            onEdit={() => startEdit('links')}
            isEditing={editingSection === 'links'}
            onSave={saveEdit}
            onCancel={cancelEdit}
            saving={saveMutation.isPending}
          >
            {editingSection === 'links' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Instagram URL</label>
                  <input
                    value={draftData.instagram_url ?? data.instagram_url ?? ''}
                    onChange={e => setDraftData(p => ({ ...p, instagram_url: e.target.value }))}
                    placeholder="https://instagram.com/..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Website URL</label>
                  <input
                    value={draftData.website_url ?? data.website_url ?? ''}
                    onChange={e => setDraftData(p => ({ ...p, website_url: e.target.value }))}
                    placeholder="https://yoursite.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.instagram_url ? (
                  <a href={data.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-slate-700 hover:text-accent transition-colors">
                    <Instagram className="w-4 h-4" />
                    Instagram
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                ) : null}
                {data.website_url ? (
                  <a href={data.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-slate-700 hover:text-accent transition-colors">
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                ) : null}
                {!data.instagram_url && !data.website_url && (
                  <p className="text-slate-400 text-sm">No links added yet</p>
                )}
              </div>
            )}
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({
  title, icon: Icon, children, onEdit, isEditing, onSave, onCancel, saving
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onEdit: () => void;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="font-black text-slate-900">{title}</h3>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <Button
              onClick={onSave}
              isLoading={saving}
              className="h-8 px-4 text-xs font-bold rounded-xl gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </Button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}
