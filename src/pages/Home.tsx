import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Shield, Zap, Users, ArrowRight, CircleCheck as CheckCircle2, Star, Play, Calendar, Video, Award, ChevronRight, Quote, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { User } from '../types';

export default function Home({ user }: { user: User | null }) {
  return (
    <div className="min-h-screen bg-white selection:bg-accent/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tighter text-primary">FlexFit</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['How it Works', 'Trainers', 'Pricing', 'About'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-sm font-semibold text-slate-500 hover:text-primary transition-all hover:translate-y-[-1px]"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild variant="default" className="rounded-full px-6 shadow-xl shadow-primary/20">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex font-bold">
                  <Link to="/sign-in">Log in</Link>
                </Button>
                <Button asChild variant="default" className="rounded-full px-8 shadow-xl shadow-primary/20">
                  <Link to="/sign-up">Join FlexFit</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <motion.div 
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 border border-slate-200/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Live 1:1 Training Platform
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[0.95] text-balance">
                Elevate your <span className="text-accent italic font-serif">potential</span> from home.
              </h1>
              
              <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-xl text-balance">
                The world's most elite personal trainers, now available at your fingertips. Expert-led 1:1 video sessions designed for your unique goals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" className="h-16 px-10 text-lg rounded-full shadow-2xl shadow-primary/20 group" asChild>
                  <Link to="/sign-up">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <div className="flex items-center gap-4 px-2">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <img 
                        key={i}
                        src={`https://picsum.photos/seed/user${i}/100`} 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                        alt="User"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />)}
                    </div>
                    <p className="text-slate-500 font-medium">4.9/5 from 2k+ clients</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-slate-200">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1000" 
                  alt="Professional Training" 
                  className="w-full aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Play className="text-white w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Live Session: HIIT Elite</p>
                      <p className="text-white/70 text-xs">Coach Marcus Chen • 45 mins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 glass-panel p-6 rounded-3xl shadow-2xl hidden xl:block z-20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Session</p>
                    <p className="text-sm font-bold">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -left-16 glass-panel p-5 rounded-2xl shadow-2xl hidden xl:block z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Award className="text-emerald-600 w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold">Goal: 85% Complete</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Marquee */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/30 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-12 mx-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <span className="text-2xl font-black tracking-tighter text-slate-400">FITNESS+</span>
              <span className="text-2xl font-black tracking-tighter text-slate-400">HEALTHLINE</span>
              <span className="text-2xl font-black tracking-tighter text-slate-400">VOGUE</span>
              <span className="text-2xl font-black tracking-tighter text-slate-400">MEN'S HEALTH</span>
              <span className="text-2xl font-black tracking-tighter text-slate-400">GYMSHARK</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight">The future of <span className="text-accent">personal training</span>.</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto">We've built a platform that removes every friction point between you and your best self.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 relative overflow-hidden group">
              <div className="relative z-10 max-w-md">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                  <Video className="text-accent w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Crystal Clear 1:1 Video</h3>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Our proprietary video engine is optimized for movement. Low latency, high definition, and built-in tools for trainers to correct your form in real-time.
                </p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600" 
                className="absolute right-0 bottom-0 w-1/2 h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" 
                alt="Video Training"
              />
            </div>

            <div className="md:col-span-4 bg-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <Shield className="text-accent w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Elite Vetting</h3>
                <p className="text-white/60 text-lg leading-relaxed">
                  Only the top 3% of applicants make it onto FlexFit. Every trainer is certified, insured, and background-checked.
                </p>
              </div>
            </div>

            <div className="md:col-span-4 bg-accent rounded-[2.5rem] p-10 text-white group">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-90 transition-transform">
                <Zap className="text-white w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Instant Access</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                Book a session and be training in as little as 15 minutes. No more waiting for gym openings or commute times.
              </p>
            </div>

            <div className="md:col-span-8 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="relative z-10 max-w-md">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:translate-x-2 transition-transform">
                  <Users className="text-accent w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Personalized Programs</h3>
                <p className="text-white/60 text-lg leading-relaxed">
                  Your trainer builds a custom roadmap for you. Track progress, nutrition, and recovery all in one unified dashboard.
                </p>
              </div>
              <div className="absolute right-10 bottom-10 flex gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center">
                    <Activity className="text-accent w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-extrabold mb-12 tracking-tight">Three steps to a <span className="italic font-serif text-accent">new you</span>.</h2>
              <div className="space-y-12">
                {[
                  { step: '01', title: 'Find Your Match', desc: 'Browse our elite roster of trainers. Filter by specialty, personality, and availability to find your perfect fit.' },
                  { step: '02', title: 'Book Your Session', desc: 'Pick a time that works for you. Our seamless booking system handles everything, including calendar sync.' },
                  { step: '03', title: 'Train Live', desc: 'Join your secure 1:1 video room. Your trainer will guide you through a custom workout tailored to your goals.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className="text-5xl font-black text-slate-200 group-hover:text-accent transition-colors duration-500">{item.step}</span>
                    <div>
                      <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                      <p className="text-slate-500 text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full -z-10" />
              <img 
                src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800" 
                className="rounded-[3rem] shadow-2xl border border-white" 
                alt="Training Session"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Quote className="absolute -top-10 -left-10 w-40 h-40 text-slate-50 -z-10" />
          
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-10">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 text-amber-400 fill-current" />)}
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-12 leading-tight italic font-serif">
              "FlexFit completely changed my perspective on home workouts. The quality of trainers is unlike anything I've seen. It's like having a premium gym in my living room."
            </h2>
            <div className="flex flex-col items-center">
              <img 
                src="https://picsum.photos/seed/testimonial/200" 
                className="w-20 h-20 rounded-full border-4 border-white shadow-xl mb-4" 
                alt="User"
              />
              <p className="font-bold text-xl">Alexandra Wright</p>
              <p className="text-slate-400">Creative Director, NYC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-primary rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-blue-500/10 blur-[120px] -z-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight">
              Ready to meet your <br /><span className="text-accent">best self?</span>
            </h2>
            <p className="text-white/60 text-xl max-w-2xl mx-auto mb-12">
              Join thousands of others who have transformed their lives with FlexFit. Your first session is 50% off.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="h-16 px-12 text-lg rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl shadow-accent/20" asChild>
                <Link to="/sign-up">Get Started Now</Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-12 text-lg rounded-full border-white/20 text-white hover:bg-white/10">
                View All Trainers
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5 mb-8">
                <div className="bg-primary p-2 rounded-xl">
                  <Dumbbell className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-extrabold tracking-tighter text-primary">FlexFit</span>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                The premier platform for elite personal training. Expert-led sessions, anywhere in the world.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-current rounded-sm" />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Platform</h4>
                <ul className="space-y-4 text-slate-500 font-medium">
                  <li><a href="#" className="hover:text-primary transition-colors">Find a Trainer</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Become a Trainer</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Company</h4>
                <ul className="space-y-4 text-slate-500 font-medium">
                  <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Legal</h4>
                <ul className="space-y-4 text-slate-500 font-medium">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-sm font-medium">
            <p>© 2026 FlexFit Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-primary">Status</a>
              <a href="#" className="hover:text-primary">Security</a>
              <a href="#" className="hover:text-primary">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
