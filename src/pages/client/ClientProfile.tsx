import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, CreditCard as Edit3, Save, X, Camera, Shield, Target, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

interface ClientProfileData {
  displayName: string;
  phone: string;
  location: string;
  age: string;
  gender: string;
  weight: string;
  weightUnit: 'kg' | 'lbs';
  height: string;
  heightUnit: 'cm' | 'ft';
  primaryGoal: string;
  fitnessLevel: string;
  bio: string;
  medicalConditions: string;
}

const GOALS = ['Lose Weight', 'Build Muscle', 'Improve Endurance', 'Increase Flexibility', 'Stress Relief', 'General Fitness'];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athlete'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

function FieldRow({ label, value, editing, children }: {
  label: string; value: string; editing: boolean; children?: React.ReactNode;
}) {
  if (!editing) {
    return (
      <div className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
        <span className="text-sm font-semibold text-slate-400 w-36 shrink-0">{label}</span>
        <span className="text-sm font-semibold text-slate-800 text-right">{value || '—'}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 py-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export default function ClientProfile() {
  const { user } = useUser();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ClientProfileData>({
    displayName: user?.fullName || '',
    phone: user?.primaryPhoneNumber?.phoneNumber || '',
    location: '',
    age: '',
    gender: '',
    weight: '',
    weightUnit: 'kg',
    height: '',
    heightUnit: 'cm',
    primaryGoal: '',
    fitnessLevel: '',
    bio: '',
    medicalConditions: '',
  });

  const [draft, setDraft] = useState<ClientProfileData>({ ...profile });

  function startEdit() {
    setDraft({ ...profile });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft({ ...profile });
    setEditing(false);
  }

  async function saveEdit() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setProfile({ ...draft });
    setEditing(false);
    setSaving(false);
  }

  function set(key: keyof ClientProfileData, value: string) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  const displayData = editing ? draft : profile;
  const initials = (displayData.displayName || user?.fullName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">My Profile</h1>
          <p className="text-slate-400 font-medium mt-1">Manage your personal information and fitness details.</p>
        </div>
        {!editing ? (
          <Button onClick={startEdit} variant="outline" className="rounded-xl font-bold border-slate-200 gap-2">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={cancelEdit} variant="ghost" className="rounded-xl font-bold text-slate-500 gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving} className="rounded-xl font-bold gap-2 shadow-lg shadow-slate-900/15">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)' }}
            />
          </div>
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <span className="text-white font-black text-xl">{initials}</span>
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 rounded-xl flex items-center justify-center border-2 border-white hover:bg-accent transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Verified Member</span>
                </div>
              </div>
            </div>

            {editing ? (
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Display Name</label>
                <Input
                  value={draft.displayName}
                  onChange={e => set('displayName', e.target.value)}
                  className="mt-1.5 rounded-xl border-slate-200 font-semibold text-slate-900"
                  placeholder="Your name"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {profile.displayName || user?.fullName || 'Your Name'}
                </h2>
                <p className="text-slate-400 font-medium text-sm mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="rounded-2xl border-slate-100 shadow-sm h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Personal Info</h3>
              </div>

              <div className="space-y-1">
                <FieldRow label="Email" value={user?.primaryEmailAddress?.emailAddress || ''} editing={false} />

                <FieldRow label="Phone" value={displayData.phone} editing={editing}>
                  <Input
                    value={draft.phone}
                    onChange={e => set('phone', e.target.value)}
                    className="rounded-xl border-slate-200"
                    placeholder="+1 (555) 000-0000"
                  />
                </FieldRow>

                <FieldRow label="Location" value={displayData.location} editing={editing}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={draft.location}
                      onChange={e => set('location', e.target.value)}
                      className="rounded-xl border-slate-200 pl-9"
                      placeholder="City, Country"
                    />
                  </div>
                </FieldRow>

                <FieldRow label="Gender" value={displayData.gender} editing={editing}>
                  <select
                    value={draft.gender}
                    onChange={e => set('gender', e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </FieldRow>

                <FieldRow label="Age" value={displayData.age ? `${displayData.age} years` : ''} editing={editing}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      min="10"
                      max="100"
                      value={draft.age}
                      onChange={e => set('age', e.target.value)}
                      className="rounded-xl border-slate-200 pl-9"
                      placeholder="e.g. 28"
                    />
                  </div>
                </FieldRow>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="rounded-2xl border-slate-100 shadow-sm h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Body Stats</h3>
              </div>

              <div className="space-y-1">
                <FieldRow
                  label="Weight"
                  value={displayData.weight ? `${displayData.weight} ${displayData.weightUnit}` : ''}
                  editing={editing}
                >
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={draft.weight}
                      onChange={e => set('weight', e.target.value)}
                      className="rounded-xl border-slate-200 flex-1"
                      placeholder="e.g. 70"
                    />
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden shrink-0">
                      {(['kg', 'lbs'] as const).map(u => (
                        <button
                          key={u}
                          onClick={() => set('weightUnit', u)}
                          className={cn(
                            'px-3 py-2 text-sm font-bold transition-colors',
                            draft.weightUnit === u ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                          )}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </FieldRow>

                <FieldRow
                  label="Height"
                  value={displayData.height ? `${displayData.height} ${displayData.heightUnit}` : ''}
                  editing={editing}
                >
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={draft.height}
                      onChange={e => set('height', e.target.value)}
                      className="rounded-xl border-slate-200 flex-1"
                      placeholder="e.g. 175"
                    />
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden shrink-0">
                      {(['cm', 'ft'] as const).map(u => (
                        <button
                          key={u}
                          onClick={() => set('heightUnit', u)}
                          className={cn(
                            'px-3 py-2 text-sm font-bold transition-colors',
                            draft.heightUnit === u ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                          )}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </FieldRow>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Fitness Goals</h3>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">Primary Goal</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map(goal => (
                      <button
                        key={goal}
                        onClick={() => set('primaryGoal', goal)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all',
                          draft.primaryGoal === goal
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        )}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">Fitness Level</label>
                  <div className="flex flex-wrap gap-2">
                    {FITNESS_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => set('fitnessLevel', level)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all',
                          draft.fitnessLevel === level
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">About Me</label>
                  <textarea
                    value={draft.bio}
                    onChange={e => set('bio', e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Tell your trainer a bit about yourself, your lifestyle, and what you're hoping to achieve..."
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">Health Conditions / Notes</label>
                  <textarea
                    value={draft.medicalConditions}
                    onChange={e => set('medicalConditions', e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Any injuries, conditions, or areas to avoid..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <FieldRow label="Primary Goal" value={profile.primaryGoal} editing={false} />
                <FieldRow label="Fitness Level" value={profile.fitnessLevel} editing={false} />
                <FieldRow label="About Me" value={profile.bio} editing={false} />
                <FieldRow label="Health Notes" value={profile.medicalConditions} editing={false} />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
