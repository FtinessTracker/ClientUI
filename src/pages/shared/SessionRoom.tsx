import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Send, X, Loader as Loader2, CircleAlert as AlertCircle, Link, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  connect,
  Room,
  LocalVideoTrack,
  LocalAudioTrack,
  RemoteParticipant,
  RemoteVideoTrack,
  RemoteAudioTrack,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from 'twilio-video';
import { cn } from '../../lib/utils';
import { getTwilioVideoToken, TwilioTokenResponse } from '../../services/twilioService';
import { useAppUser } from '../../hooks/useAppUser';
import { API_BASE_URL } from '../../config';

function RemoteParticipantView({ participant }: { participant: RemoteParticipant }) {
  const videoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    function attachTrack(track: RemoteVideoTrack | RemoteAudioTrack) {
      if (track.kind === 'video' && videoRef.current) {
        const el = track.attach();
        el.className = 'w-full h-full object-cover';
        videoRef.current.appendChild(el);
      } else if (track.kind === 'audio') {
        const el = track.attach() as HTMLAudioElement;
        document.body.appendChild(el);
      }
    }

    function detachTrack(track: RemoteVideoTrack | RemoteAudioTrack) {
      (track as any).detach().forEach((el: any) => el.remove());
    }

    participant.tracks.forEach(pub => {
      if (pub.track) attachTrack(pub.track as RemoteVideoTrack | RemoteAudioTrack);
    });

    participant.on('trackSubscribed', attachTrack);
    participant.on('trackUnsubscribed', detachTrack);

    return () => {
      participant.removeAllListeners();
      participant.tracks.forEach(pub => {
        if (pub.track) (pub.track as any).detach().forEach((el: any) => el.remove());
      });
    };
  }, [participant]);

  return (
    <div className="w-full h-full relative bg-slate-900">
      <div ref={videoRef} className="w-full h-full" />
      <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
          {participant.identity[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">{participant.identity}</p>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">Trainer</p>
        </div>
      </div>
    </div>
  );
}

function LocalVideoView({
  track,
  isVideoOff,
  identity,
}: {
  track: LocalVideoTrack | null;
  isVideoOff: boolean;
  identity: string;
}) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track || isVideoOff || !videoRef.current) return;
    const el = track.attach();
    el.className = 'w-full h-full object-cover';
    videoRef.current.appendChild(el);
    return () => {
      el.remove();
    };
  }, [track, isVideoOff]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="absolute top-28 right-6 w-52 aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl z-20 cursor-move"
    >
      {isVideoOff || !track ? (
        <div className="w-full h-full flex items-center justify-center">
          <VideoOff className="w-6 h-6 text-slate-600" />
        </div>
      ) : (
        <div ref={videoRef} className="w-full h-full" />
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded-lg text-[9px] text-white font-bold uppercase tracking-widest">
        {identity || 'You'}
      </div>
    </motion.div>
  );
}

interface ChatMessage {
  from: string;
  text: string;
  time: string;
  self: boolean;
}

export default function SessionRoom() {
  const { id: roomParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser } = useAppUser();

  const [phase, setPhase] = useState<'lobby' | 'connecting' | 'call' | 'error'>('lobby');
  const [error, setError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');

  const roomRef = useRef<Room | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);

  const roomName = roomParam || 'session-room';

  useEffect(() => {
    let vTrack: LocalVideoTrack | null = null;
    let aTrack: LocalAudioTrack | null = null;

    async function initPreview() {
      try {
        vTrack = await createLocalVideoTrack({ width: 1280, height: 720 });
        aTrack = await createLocalAudioTrack();
        setLocalVideoTrack(vTrack);
        setLocalAudioTrack(aTrack);
      } catch {
        // Camera/mic unavailable — continue without preview
      }
    }

    initPreview();

    return () => {
      if (roomRef.current) return;
      vTrack?.stop();
      aTrack?.stop();
    };
  }, []);

  const joinRoom = useCallback(async () => {
    setPhase('connecting');
    setError('');

    
    try {
      const payload = {
        meetingId: roomParam,
        bookingId: location.state?.bookingId || roomParam, // Fallback if meeting mapping is unified
        userId: appUser?.id || 'client_001',
        initiatedBy: appUser?.name || 'Client',
        initiatorRole: appUser?.role?.toUpperCase() || 'CLIENT'
      };

      const joinRes = await fetch(`${API_BASE_URL}/api/video/${roomParam}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (!joinRes.ok) throw new Error('Failed to join video meeting session');
      const sessionData = await joinRes.json();

      const token = sessionData.token;
      const resolvedRoomName = sessionData.roomName;

      const tracks = [localVideoTrack, localAudioTrack].filter(Boolean) as (LocalVideoTrack | LocalAudioTrack)[];

      const room = await connect(token, {
        name: resolvedRoomName,
        tracks,
      });

      roomRef.current = room;

      const existing = Array.from(room.participants.values());
      setRemoteParticipants(existing);

      room.on('participantConnected', (p: RemoteParticipant) => {
        setRemoteParticipants(prev => [...prev, p]);
      });

      room.on('participantDisconnected', (p: RemoteParticipant) => {
        setRemoteParticipants(prev => prev.filter(x => x.sid !== p.sid));
      });

      room.on('disconnected', () => {
        setRemoteParticipants([]);
        roomRef.current = null;
        navigate('/calendar');
      });

      setPhase('call');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not connect to the session';
      setError(msg);
      setPhase('error');
    }
  }, [roomName, localVideoTrack, localAudioTrack, navigate]);

  function leaveRoom() {
    roomRef.current?.disconnect();
    localVideoTrack?.stop();
    localAudioTrack?.stop();
    navigate('/calendar');
  }

  function toggleMute() {
    if (!localAudioTrack) return;
    if (isMuted) {
      localAudioTrack.enable();
    } else {
      localAudioTrack.disable();
    }
    setIsMuted(v => !v);
  }

  function toggleVideo() {
    if (!localVideoTrack) return;
    if (isVideoOff) {
      localVideoTrack.enable();
    } else {
      localVideoTrack.disable();
    }
    setIsVideoOff(v => !v);
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        from: 'You',
        text: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        self: true,
      },
    ]);
    setMessage('');
  }

  const identity = roomRef.current?.localParticipant?.identity || 'You';
  const mainParticipant = remoteParticipants[0] ?? null;

  if (phase === 'lobby' || phase === 'error') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5">
              <Users className="w-3 h-3" />
              Private Training Session
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Ready to join?</h1>
            <p className="text-slate-400 mt-2 font-medium">Room: <span className="font-bold text-slate-700">{roomName}</span></p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2500);
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
            >
              {linkCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link className="w-3.5 h-3.5" />}
              {linkCopied ? 'Link copied!' : 'Copy invite link'}
            </button>
          </div>

          {phase === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-8 max-w-lg mx-auto"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700">Connection failed</p>
                <p className="text-xs text-red-500 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Camera preview */}
            <LobbyPreview
              localVideoTrack={localVideoTrack}
              isVideoOff={isVideoOff}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onToggleVideo={toggleVideo}
            />

            {/* Join card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-900 mb-6">Before you join</h3>
                <div className="space-y-3">
                  <DeviceRow
                    icon={<Mic className="w-4 h-4 text-slate-600" />}
                    label="Microphone"
                    status={localAudioTrack ? 'Ready' : 'Not found'}
                    ok={!!localAudioTrack}
                  />
                  <DeviceRow
                    icon={<Video className="w-4 h-4 text-slate-600" />}
                    label="Camera"
                    status={localVideoTrack ? 'Ready' : 'Not found'}
                    ok={!!localVideoTrack}
                  />
                </div>
              </div>

              <button
                onClick={joinRoom}
                className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] py-4 rounded-2xl transition-colors active:scale-[0.98]"
              >
                Join Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'connecting') {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-white/40" />
          <p className="font-bold text-lg">Joining session...</p>
          <p className="text-white/40 text-sm mt-1">Connecting to <span className="text-white/70">{roomName}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col font-sans">
      {/* Top bar */}
      <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent z-30 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-[10px] font-bold tracking-widest uppercase">Live</span>
          </div>
          <div>
            <p className="text-white font-bold tracking-tight text-sm">{roomName}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">
              {remoteParticipants.length + 1} participant{remoteParticipants.length !== 0 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(v => !v)}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
              showChat ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
            )}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className={cn('flex-1 relative transition-all duration-300', showChat ? 'mr-80' : 'mr-0')}>
          {mainParticipant ? (
            <RemoteParticipantView participant={mainParticipant} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <div className="text-center text-white/40">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <p className="font-bold">Waiting for others to join...</p>
                <p className="text-sm mt-1">Room: {roomName}</p>
              </div>
            </div>
          )}

          <LocalVideoView
            track={localVideoTrack}
            isVideoOff={isVideoOff}
            identity={identity}
          />
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white z-30 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Session Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.length === 0 && (
                  <p className="text-center text-slate-400 text-sm mt-8">No messages yet</p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn('flex flex-col gap-1', msg.self && 'items-end')}>
                    <div className="flex items-center gap-1.5">
                      {!msg.self && <span className="text-[10px] font-bold text-slate-500">{msg.from}</span>}
                      <span className="text-[9px] text-slate-300">{msg.time}</span>
                    </div>
                    <div className={cn(
                      'px-3.5 py-2.5 rounded-2xl text-sm max-w-[85%]',
                      msg.self
                        ? 'bg-slate-900 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Send a message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="h-28 bg-slate-950 border-t border-white/5 flex items-center justify-center z-40">
        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-[2rem]">
          <ControlButton
            active={isMuted}
            danger={isMuted}
            onClick={toggleMute}
            label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </ControlButton>

          <ControlButton
            active={isVideoOff}
            danger={isVideoOff}
            onClick={toggleVideo}
            label={isVideoOff ? 'Start video' : 'Stop video'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </ControlButton>

          <div className="w-px h-8 bg-white/10 mx-1" />

          <ControlButton active={showChat} onClick={() => setShowChat(v => !v)} label="Chat">
            <MessageSquare className="w-5 h-5" />
          </ControlButton>

          <div className="w-px h-8 bg-white/10 mx-1" />

          <button
            onClick={leaveRoom}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-6 h-12 rounded-2xl transition-colors active:scale-[0.97]"
          >
            <PhoneOff className="w-4 h-4" />
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  children,
  active,
  danger,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-[0.95]',
        danger
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : active
          ? 'bg-white/20 text-white'
          : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function LobbyPreview({
  localVideoTrack,
  isVideoOff,
  isMuted,
  onToggleMute,
  onToggleVideo,
}: {
  localVideoTrack: LocalVideoTrack | null;
  isVideoOff: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localVideoTrack || isVideoOff || !videoRef.current) return;
    const el = localVideoTrack.attach();
    el.className = 'w-full h-full object-cover';
    videoRef.current.appendChild(el);
    return () => { el.remove(); };
  }, [localVideoTrack, isVideoOff]);

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center shadow-2xl">
      {isVideoOff || !localVideoTrack ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <VideoOff className="w-7 h-7 text-slate-500" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Camera off</p>
        </div>
      ) : (
        <div ref={videoRef} className="w-full h-full" />
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
        <button
          onClick={onToggleMute}
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg',
            isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          )}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          onClick={onToggleVideo}
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg',
            isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          )}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

function DeviceRow({
  icon,
  label,
  status,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  status: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <div className={cn(
        'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full',
        ok ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
      )}>
        {ok && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
        {status}
      </div>
    </div>
  );
}
