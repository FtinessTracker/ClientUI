import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Settings, 
  Users,
  Maximize2,
  MoreVertical,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

export default function SessionRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');

  // Pre-join screen
  if (!isJoined) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="max-w-4xl w-full px-6 space-y-12">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary font-black text-[10px] uppercase tracking-[0.2em]"
            >
              <Users className="w-3 h-3" />
              Private Training Session
            </motion.div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">Ready to begin?</h1>
            <p className="text-slate-500 font-medium text-lg">Check your equipment before joining the session.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-video bg-slate-900 rounded-[3rem] overflow-hidden flex items-center justify-center shadow-2xl ring-1 ring-black/5"
            >
              {isVideoOff ? (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
                    <VideoOff className="w-10 h-10 text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Camera is disabled</p>
                </div>
              ) : (
                <img 
                  src="https://picsum.photos/seed/user_preview/1280/720" 
                  className="w-full h-full object-cover opacity-80" 
                  referrerPolicy="no-referrer"
                />
              )}
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                <Button 
                  variant={isMuted ? "destructive" : "secondary"} 
                  size="icon" 
                  className="rounded-2xl w-14 h-14 shadow-xl"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                <Button 
                  variant={isVideoOff ? "destructive" : "secondary"} 
                  size="icon" 
                  className="rounded-2xl w-14 h-14 shadow-xl"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-none shadow-sm rounded-[3rem] p-10 space-y-10">
                <div className="space-y-6">
                  <h3 className="font-black text-2xl tracking-tight">Audio & Video Check</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <Mic className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Input</p>
                          <p className="text-sm font-black text-slate-900">MacBook Pro Mic</p>
                        </div>
                      </div>
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-accent"
                          animate={{ width: ["20%", "60%", "40%", "80%", "30%"] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Camera</p>
                          <p className="text-sm font-black text-slate-900">FaceTime HD 1080p</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20" onClick={() => setIsJoined(true)}>
                  Join Session
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // In-call UI
  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col font-sans">
      {/* Top Bar Overlay */}
      <div className="h-24 flex items-center justify-between px-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Recording</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <h2 className="text-white font-black tracking-tight">Advanced Yoga Flow</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Sarah Jenkins • 45m Session</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-2xl w-12 h-12">
            <Users className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-2xl w-12 h-12">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className={cn(
          "flex-1 relative transition-all duration-700 ease-in-out",
          showChat ? "mr-96" : "mr-0"
        )}>
          {/* Main Participant (Trainer) */}
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <motion.img 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              src="https://picsum.photos/seed/trainer_live_hd/1920/1080" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-32 left-10 flex items-center gap-4 bg-black/40 backdrop-blur-2xl px-5 py-3 rounded-[2rem] border border-white/10 shadow-2xl">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/20">
                <img src="https://picsum.photos/seed/sarah/100/100" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-white font-black tracking-tight text-sm">Sarah Jenkins</p>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Trainer</p>
              </div>
            </div>
          </div>

          {/* Self View (Floating) */}
          <motion.div 
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="absolute top-32 right-10 w-64 aspect-video bg-slate-800 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 cursor-move"
          >
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-slate-600" />
              </div>
            ) : (
              <img 
                src="https://picsum.photos/seed/user_live/600/337" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-[10px] text-white font-black uppercase tracking-widest">
              You
            </div>
          </motion.div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              initial={{ x: 384 }}
              animate={{ x: 0 }}
              exit={{ x: 384 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] z-30 flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xl tracking-tight">Session Chat</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">2 Participants</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowChat(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sarah Jenkins</span>
                    <span className="text-[8px] font-bold text-slate-300">10:42 AM</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 max-w-[90%]">
                    <p className="text-sm font-medium text-slate-700">Great form on that last set! Keep your core tight.</p>
                  </div>
                </div>
                <div className="space-y-2 flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-slate-300">10:43 AM</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">You</span>
                  </div>
                  <div className="bg-primary p-4 rounded-2xl rounded-tr-none text-white max-w-[90%] shadow-lg shadow-primary/10">
                    <p className="text-sm font-medium">Thanks! Feeling the burn now.</p>
                  </div>
                </div>
              </div>
              <div className="p-8 border-t border-slate-50">
                <div className="relative">
                  <Input 
                    placeholder="Message Sarah..." 
                    className="h-14 pl-6 pr-14 rounded-2xl border-slate-100 bg-slate-50 font-medium focus:bg-white transition-all"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-xl shadow-lg shadow-primary/20">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Bar */}
      <div className="h-32 bg-slate-950 flex items-center justify-center px-10 relative z-40 border-t border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-[2rem]">
            <Button 
              variant={isMuted ? "destructive" : "secondary"} 
              size="icon" 
              className="rounded-2xl w-14 h-14 shadow-xl transition-all duration-300"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            <Button 
              variant={isVideoOff ? "destructive" : "secondary"} 
              size="icon" 
              className="rounded-2xl w-14 h-14 shadow-xl transition-all duration-300"
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>
          </div>
          
          <div className="w-px h-10 bg-white/10 mx-2" />
          
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              size="icon" 
              className={cn(
                "rounded-2xl w-14 h-14 shadow-xl transition-all duration-300",
                showChat && "bg-accent text-accent-foreground ring-4 ring-accent/20"
              )}
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-2xl w-14 h-14 shadow-xl">
              <Maximize2 className="w-6 h-6" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-2xl w-14 h-14 shadow-xl">
              <MoreVertical className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="w-px h-10 bg-white/10 mx-2" />

          <Button 
            variant="destructive" 
            className="rounded-[1.5rem] px-10 h-14 font-black text-sm uppercase tracking-widest gap-3 shadow-2xl shadow-red-500/20 hover:scale-105 transition-all"
            onClick={() => navigate('/dashboard')}
          >
            <PhoneOff className="w-5 h-5" />
            End Session
          </Button>
        </div>
      </div>
    </div>
  );
}
