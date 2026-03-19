import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Dumbbell, Shield, Zap, Users, ArrowRight, Star, Play,
  Calendar, Video, Award, Quote, Activity, Check,
  TrendingUp, Clock, Globe, MessageCircle, ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { User } from '../types';

const TRAINER_CARDS = [
  {
    name: 'Sarah Jenkins',
    specialty: 'Yoga & Mindfulness',
    rating: 4.9,
    reviews: 124,
    price: 75,
    image: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=600',
    badge: 'Top Rated',
  },
  {
    name: 'Marcus Chen',
    specialty: 'HIIT & Strength',
    rating: 4.8,
    reviews: 89,
    price: 90,
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600',
    badge: 'Featured',
  },
  {
    name: 'Elena Rodriguez',
    specialty: 'Rehab & Mobility',
    rating: 5.0,
    reviews: 56,
    price: 85,
    image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600',
    badge: 'Expert',
  },
];

const TESTIMONIALS = [
  {
    quote: 'FlexFit completely transformed my approach to fitness. Having a dedicated coach available on my schedule changed everything. Down 22 lbs in 3 months.',
    name: 'Alexandra Wright',
    title: 'Creative Director, NYC',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    stars: 5,
  },
  {
    quote: 'I was skeptical about online training, but the quality of instruction is genuinely world-class. My trainer corrects my form in real-time. It\'s incredible.',
    name: 'James Park',
    title: 'Software Engineer, SF',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    stars: 5,
  },
  {
    quote: 'The booking experience is seamless. I went from browsing to my first session in under 10 minutes. My trainer tailored everything to my injury history.',
    name: 'Maria Santos',
    title: 'Marketing VP, Miami',
    image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
    stars: 5,
  },
];

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home({ user }: { user: User | null }) {
  return (
    <div className="min-h-screen bg-white selection:bg-accent/20 font-sans overflow-x-hidden">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 p-2 rounded-xl shadow-lg shadow-slate-900/15">
              <Dumbbell className="text-accent w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">FlexFit</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'How it Works', href: '#how-it-works' },
              { label: 'Trainers', href: '#trainers' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Reviews', href: '#reviews' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild className="rounded-full px-6 h-10 text-sm font-bold shadow-lg shadow-slate-900/10">
                <Link to="/calendar">Book a Session</Link>
              </Button>
            ) : (
              <Button asChild className="rounded-full px-6 h-10 text-sm font-bold shadow-lg shadow-slate-900/10">
                <Link to="/sign-up">Book a Session</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center pt-[72px] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-accent/6 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-[5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent/8 border border-accent/15 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-accent text-xs font-black uppercase tracking-[0.18em]">Live 1:1 Training Sessions</span>
              </motion.div>

              <h1 className="text-6xl lg:text-7xl xl:text-[80px] font-black text-slate-900 leading-[0.92] tracking-tighter mb-8">
                Train smarter.<br />
                <span className="text-slate-400">Anywhere.</span><br />
                <span className="italic font-serif text-accent">Every day.</span>
              </h1>

              <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-lg font-medium">
                Connect with elite certified personal trainers for live, private video sessions tailored entirely to your goals. No gym. No commute. No excuses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 rounded-full text-base font-bold shadow-2xl shadow-slate-900/15 group"
                >
                  <Link to="/sign-up">
                    Start for Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <button className="h-14 px-8 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-base hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-current ml-0.5" />
                  </div>
                  Watch how it works
                </button>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">500+</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Elite Trainers</p>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">12k+</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Active Members</p>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">4.9</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Avg Rating</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-slate-200/50">
                <img
                  src="https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=900"
                  alt="Personal Training Session"
                  className="w-full aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                    <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                      <Video className="text-white w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-bold text-sm">Live Session — HIIT Elite</p>
                      <p className="text-slate-500 text-xs font-medium">Coach Marcus Chen • 45 mins remaining</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      <span className="text-xs font-bold text-red-500">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-8 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 hidden xl:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Award className="text-amber-500 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Weekly Streak</p>
                    <p className="text-sm font-black text-slate-900">7 Days 🔥</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-1/2 -left-10 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 hidden xl:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="text-emerald-500 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Goal Progress</p>
                    <p className="text-sm font-black text-slate-900">85% Complete</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Scroll</span>
            <ChevronDown className="w-4 h-4 text-slate-300" />
          </motion.div>
        </div>
      </section>

      {/* ─── Media Logos ─── */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-16 mx-16 opacity-30">
              {['FITNESS+', 'HEALTHLINE', 'SHAPE', 'MEN\'S HEALTH', 'WIRED', 'VOGUE', 'GYMSHARK'].map((b) => (
                <span key={b} className="text-xl font-black tracking-tighter text-slate-600">{b}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Feature Bento ─── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-20">
            <p className="text-accent text-xs font-black uppercase tracking-[0.25em] mb-4">Why FlexFit</p>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-5">
              The future of personal training.
            </h2>
            <p className="text-slate-400 text-xl max-w-xl mx-auto font-medium leading-relaxed">
              We've removed every barrier between you and elite coaching.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-12 gap-5">
            <FadeIn className="md:col-span-8 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 relative overflow-hidden group">
              <div className="relative z-10 max-w-lg">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Video className="text-accent w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Crystal Clear 1:1 Video</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Our session engine is optimized for movement. Low latency, HD quality, and real-time form correction tools built right in.
                </p>
              </div>
              <img
                src="https://images.pexels.com/photos/4720236/pexels-photo-4720236.jpeg?auto=compress&cs=tinysrgb&w=600"
                className="absolute right-0 bottom-0 w-1/2 h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-500 rounded-r-[2.5rem]"
                alt=""
              />
            </FadeIn>

            <FadeIn delay={0.05} className="md:col-span-4 bg-slate-900 rounded-[2.5rem] p-10 text-white group">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-300">
                <Shield className="text-accent w-7 h-7" />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">Elite Vetting</h3>
              <p className="text-white/60 text-lg leading-relaxed font-medium">
                Only the top 3% of applicants make it. Every trainer is certified, insured, and background-checked.
              </p>
            </FadeIn>

            <FadeIn delay={0.1} className="md:col-span-4 bg-accent rounded-[2.5rem] p-10 text-white group">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-90 transition-transform duration-300">
                <Zap className="text-white w-7 h-7" />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">Instant Access</h3>
              <p className="text-white/80 text-lg leading-relaxed font-medium">
                Book and be training in as little as 15 minutes. No gym, no commute, no waiting.
              </p>
            </FadeIn>

            <FadeIn delay={0.15} className="md:col-span-8 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="relative z-10 max-w-md">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:translate-x-1 transition-transform duration-300">
                  <Users className="text-accent w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Personalized Programs</h3>
                <p className="text-white/60 text-lg leading-relaxed font-medium">
                  Your trainer builds a custom roadmap for your goals. Track progress, sessions, and achievements all in one place.
                </p>
              </div>
              <div className="absolute right-10 bottom-10 flex flex-col gap-3">
                {[['Strength', '+15%'], ['Cardio', '+8%'], ['Flexibility', '+22%']].map(([label, val]) => (
                  <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5">
                    <Activity className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold text-white">{label}</span>
                    <span className="text-sm font-black text-accent ml-auto">{val}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Featured Trainers ─── */}
      <section id="trainers" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="text-accent text-xs font-black uppercase tracking-[0.25em] mb-3">Our Coaches</p>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Meet elite trainers.</h2>
            </div>
            <Button asChild variant="outline" className="rounded-full px-8 h-12 font-bold border-slate-300 hover:bg-white self-start md:self-auto">
              <Link to="/sign-up">View all 500+ trainers <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {TRAINER_CARDS.map((trainer, i) => (
              <FadeIn key={trainer.name} delay={i * 0.08}>
                <div className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-500">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        {trainer.badge}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span className="text-xs font-black text-slate-900">{trainer.rating}</span>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-white font-black text-xl tracking-tight mb-0.5">{trainer.name}</p>
                      <p className="text-white/70 text-sm font-semibold">{trainer.specialty}</p>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-slate-900">${trainer.price}<span className="text-sm text-slate-400 font-semibold">/hr</span></p>
                      <p className="text-xs text-slate-400 font-medium">{trainer.reviews} reviews</p>
                    </div>
                    <Button asChild className="rounded-full px-6 h-10 font-bold shadow-lg shadow-slate-900/10 text-sm">
                      <Link to="/sign-up">Book Now</Link>
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <FadeIn>
              <p className="text-accent text-xs font-black uppercase tracking-[0.25em] mb-5">Simple Process</p>
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-16">
                Three steps to a<br />
                <span className="italic font-serif text-accent">new you.</span>
              </h2>
              <div className="space-y-10">
                {[
                  {
                    step: '01',
                    title: 'Find Your Match',
                    desc: 'Browse our elite trainer roster. Filter by specialty, rating, language, and availability to find your perfect fit.',
                    icon: Users,
                  },
                  {
                    step: '02',
                    title: 'Book Your Session',
                    desc: 'Pick a time that works for you. Secure your spot instantly — calendar sync included.',
                    icon: Calendar,
                  },
                  {
                    step: '03',
                    title: 'Train Live',
                    desc: 'Join your private HD video room. Your trainer guides you through a session built around your goals.',
                    icon: Video,
                  },
                ].map(({ step, title, desc, icon: Icon }, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="flex gap-6 group"
                  >
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                        <Icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="pt-3">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">{step}</p>
                      <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h4>
                      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-emerald-300/10 rounded-[3rem] blur-3xl" />
                <img
                  src="https://images.pexels.com/photos/6998879/pexels-photo-6998879.jpeg?auto=compress&cs=tinysrgb&w=900"
                  className="relative rounded-[3rem] shadow-2xl border border-white w-full"
                  alt="Training Session"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-6 left-8 right-8 bg-white rounded-2xl p-5 shadow-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black text-slate-900">Your Fitness Score</p>
                    <p className="text-sm font-black text-accent">+23 pts this week</p>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '78%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1.5">78 / 100</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-32 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-accent text-xs font-black uppercase tracking-[0.25em] mb-4">Transparent Pricing</p>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4">Pay only for what you use.</h2>
            <p className="text-slate-400 text-lg font-medium max-w-md mx-auto">No monthly subscriptions. No hidden fees. Book sessions on your terms.</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Starter',
                price: '75',
                note: 'Starting from',
                features: ['Access to all trainers', '1:1 HD video sessions', 'Session recording', '24h cancellation'],
                cta: 'Browse Trainers',
                highlight: false,
              },
              {
                name: 'Pro Pack',
                price: '320',
                note: '5 sessions / save 15%',
                features: ['Everything in Starter', 'Priority booking', 'Custom workout plans', 'Progress tracking', 'Nutrition guidance'],
                cta: 'Get Pro Pack',
                highlight: true,
              },
              {
                name: 'Elite',
                price: '580',
                note: '10 sessions / save 25%',
                features: ['Everything in Pro', 'Dedicated coach', 'Biweekly check-ins', 'Direct messaging', 'Goal roadmap'],
                cta: 'Go Elite',
                highlight: false,
              },
            ].map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.08}>
                <div className={`rounded-[2rem] p-8 h-full flex flex-col ${plan.highlight ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' : 'bg-white border border-slate-100'}`}>
                  {plan.highlight && (
                    <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4">Most Popular</div>
                  )}
                  <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${plan.highlight ? 'text-slate-500' : 'text-slate-400'}`}>{plan.name}</p>
                  <div className="mb-6">
                    <p className={`text-[10px] font-bold mb-1 ${plan.highlight ? 'text-slate-500' : 'text-slate-400'}`}>{plan.note}</p>
                    <span className={`text-5xl font-black tracking-tighter ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>${plan.price}</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-accent/20' : 'bg-accent/10'}`}>
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                        <span className={`text-sm font-medium ${plan.highlight ? 'text-white/80' : 'text-slate-600'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={plan.highlight ? 'rounded-xl h-12 w-full bg-accent hover:bg-accent/90 text-white font-bold shadow-xl shadow-accent/20' : 'rounded-xl h-12 w-full font-bold'}
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    <Link to="/sign-up">{plan.cta}</Link>
                  </Button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="reviews" className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-accent text-xs font-black uppercase tracking-[0.25em] mb-4">Real Results</p>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">
              Trusted by thousands.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.08}>
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 h-full flex flex-col">
                  <Quote className="w-8 h-8 text-accent/30 mb-4" />
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-base leading-relaxed font-medium flex-1 mb-8 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-black text-slate-900 text-sm">{t.name}</p>
                      <p className="text-slate-400 text-xs font-medium">{t.title}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-4">
        <FadeIn>
          <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-50 -z-0">
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
            </div>
            <div className="relative z-10 text-center">
              <p className="text-accent text-xs font-black uppercase tracking-[0.25em] mb-6">Start Today</p>
              <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.92]">
                Ready to meet<br />your best self?
              </h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Join thousands who have already transformed their fitness with FlexFit. Your first session is 50% off.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-14 px-12 rounded-full bg-accent hover:bg-accent/90 text-white font-bold text-base shadow-2xl shadow-accent/25">
                  <Link to="/sign-up">Book a Session — It's Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-16 mb-16">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <Dumbbell className="text-accent w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-900">FlexFit</span>
              </div>
              <p className="text-slate-400 text-base leading-relaxed mb-6 font-medium">
                The premier platform for elite personal training. Expert-led sessions, anywhere in the world.
              </p>
              <div className="flex gap-3">
                {['X', 'IG', 'LI'].map((s) => (
                  <a key={s} href="#" className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-xs font-black">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-3 gap-10">
              {[
                { title: 'Platform', links: ['Find a Trainer', 'Become a Trainer', 'How it Works', 'Pricing'] },
                { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact'] },
                { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
              ].map(({ title, links }) => (
                <div key={title}>
                  <h4 className="font-black text-slate-900 mb-5 text-xs uppercase tracking-[0.2em]">{title}</h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium">
            <p>© 2026 FlexFit Inc. All rights reserved.</p>
            <div className="flex gap-6">
              {['Status', 'Security', 'Sitemap'].map((l) => (
                <a key={l} href="#" className="hover:text-slate-900 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
