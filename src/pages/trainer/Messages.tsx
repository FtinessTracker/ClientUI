import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Search, MoreHorizontal, Phone, Video,
  Paperclip, Smile, ArrowLeft, Circle
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '../../lib/utils';
import { trainerService } from '../../services/trainerService';
import { useAppUser } from '../../hooks/useAppUser';
import { ConversationRow, MessageRow } from '../../lib/supabase';

const MOCK_CONVERSATIONS: ConversationRow[] = [
  {
    id: 'conv1', trainer_clerk_id: 'trainer', client_clerk_id: 'u1',
    client_name: 'Emma Wilson',
    client_avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120',
    last_message: "Thanks coach! See you tomorrow at 9! 💪",
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'conv2', trainer_clerk_id: 'trainer', client_clerk_id: 'u2',
    client_name: 'James Rodriguez',
    client_avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120',
    last_message: "Can we move Thursday's session to 6pm?",
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    unread_count: 2,
    created_at: '2025-01-02T00:00:00Z',
  },
  {
    id: 'conv3', trainer_clerk_id: 'trainer', client_clerk_id: 'u3',
    client_name: 'Sofia Chen',
    client_avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120',
    last_message: "My long run felt amazing this weekend!",
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    unread_count: 1,
    created_at: '2025-01-03T00:00:00Z',
  },
  {
    id: 'conv4', trainer_clerk_id: 'trainer', client_clerk_id: 'u4',
    client_name: 'Marcus Thompson',
    client_avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120',
    last_message: "How's my form looking in that video I sent?",
    last_message_at: new Date(Date.now() - 172800000).toISOString(),
    unread_count: 0,
    created_at: '2025-01-04T00:00:00Z',
  },
  {
    id: 'conv5', trainer_clerk_id: 'trainer', client_clerk_id: 'u6',
    client_name: 'David Kim',
    client_avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120',
    last_message: "Feeling sore but in a good way haha",
    last_message_at: new Date(Date.now() - 259200000).toISOString(),
    unread_count: 0,
    created_at: '2025-01-05T00:00:00Z',
  },
];

const MOCK_MESSAGES: Record<string, MessageRow[]> = {
  conv1: [
    { id: 'm1', conversation_id: 'conv1', sender_clerk_id: 'u1', content: "Hey coach! Quick question about tomorrow's session", is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm2', conversation_id: 'conv1', sender_clerk_id: 'trainer', content: "Of course! What's on your mind?", is_read: true, created_at: new Date(Date.now() - 7100000).toISOString() },
    { id: 'm3', conversation_id: 'conv1', sender_clerk_id: 'u1', content: "Should I bring anything special? I know we're doing the new HIIT circuit", is_read: true, created_at: new Date(Date.now() - 7000000).toISOString() },
    { id: 'm4', conversation_id: 'conv1', sender_clerk_id: 'trainer', content: "Just bring water and your resistance bands! Also make sure you've eaten a light meal at least 90 minutes before.", is_read: true, created_at: new Date(Date.now() - 6900000).toISOString() },
    { id: 'm5', conversation_id: 'conv1', sender_clerk_id: 'u1', content: "Perfect! I've been doing the mobility work you assigned. Hips feel much more open now 😊", is_read: true, created_at: new Date(Date.now() - 4000000).toISOString() },
    { id: 'm6', conversation_id: 'conv1', sender_clerk_id: 'trainer', content: "That's amazing to hear Emma! Consistent mobility work makes such a difference. You're going to crush tomorrow's session!", is_read: true, created_at: new Date(Date.now() - 3800000).toISOString() },
    { id: 'm7', conversation_id: 'conv1', sender_clerk_id: 'u1', content: "Thanks coach! See you tomorrow at 9! 💪", is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  conv2: [
    { id: 'm8', conversation_id: 'conv2', sender_clerk_id: 'trainer', content: "Great work on the deadlifts today James! Your form has improved massively.", is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'm9', conversation_id: 'conv2', sender_clerk_id: 'u2', content: "Thanks! I really felt it this time. The cue about hips really clicked", is_read: true, created_at: new Date(Date.now() - 86300000).toISOString() },
    { id: 'm10', conversation_id: 'conv2', sender_clerk_id: 'u2', content: "Can we move Thursday's session to 6pm?", is_read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm11', conversation_id: 'conv2', sender_clerk_id: 'u2', content: "Work meeting popped up at my usual 5pm slot", is_read: false, created_at: new Date(Date.now() - 7100000).toISOString() },
  ],
};

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export default function TrainerMessages() {
  const { appUser } = useAppUser();
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [localMessages, setLocalMessages] = useState<Record<string, MessageRow[]>>(MOCK_MESSAGES);

  const { data: conversations = MOCK_CONVERSATIONS } = useQuery({
    queryKey: ['conversations', appUser?.id],
    queryFn: () => trainerService.getConversations(appUser!.id),
    enabled: !!appUser,
    placeholderData: MOCK_CONVERSATIONS,
  });

  const filteredConvs = conversations.filter(c =>
    c.client_name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConvId) || null;
  const messages = localMessages[selectedConvId || ''] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConvId]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConvId) return;
    const newMsg: MessageRow = {
      id: `local-${Date.now()}`,
      conversation_id: selectedConvId,
      sender_clerk_id: 'trainer',
      content: messageInput.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setLocalMessages(prev => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMsg],
    }));
    setMessageInput('');
  };

  const handleSelectConv = (id: string) => {
    setSelectedConvId(id);
    setShowMobileDetail(true);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="h-full flex bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          'w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col shrink-0',
          showMobileDetail ? 'hidden md:flex' : 'flex'
        )}>
          {/* Header */}
          <div className="p-5 border-b border-slate-100">
            <h1 className="text-xl font-black text-slate-900 mb-3">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => {
              const isSelected = conv.id === selectedConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={cn(
                    'w-full px-5 py-4 flex items-center gap-3 text-left transition-all border-b border-slate-50 hover:bg-slate-50',
                    isSelected && 'bg-accent/5 border-l-2 border-l-accent'
                  )}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.client_avatar_url}
                      alt={conv.client_name}
                      className="w-11 h-11 rounded-2xl object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={cn('font-bold text-sm truncate', isSelected ? 'text-slate-900' : 'text-slate-700')}>
                        {conv.client_name}
                      </p>
                      <span className="text-xs text-slate-400 font-medium shrink-0 ml-2">
                        {formatMessageTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-medium truncate">{conv.last_message}</p>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 bg-accent rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0 ml-2">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          'flex-1 flex flex-col',
          !showMobileDetail && 'hidden md:flex'
        )}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileDetail(false)}
                    className="md:hidden p-1.5 hover:bg-slate-100 rounded-xl mr-1"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <img
                    src={selectedConv.client_avatar_url}
                    alt={selectedConv.client_name}
                    className="w-10 h-10 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{selectedConv.client_name}</p>
                    <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-current" />
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                    <Phone className="w-5 h-5 text-slate-500" />
                  </button>
                  <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                    <Video className="w-5 h-5 text-slate-500" />
                  </button>
                  <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => {
                  const isMe = msg.sender_clerk_id === 'trainer';
                  const showTime = i === 0 || (i > 0 && new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime() > 300000);
                  return (
                    <div key={msg.id}>
                      {showTime && (
                        <p className="text-center text-xs text-slate-400 font-medium my-3">
                          {formatMessageTime(msg.created_at)}
                        </p>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex items-end gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}
                      >
                        {!isMe && (
                          <img
                            src={selectedConv.client_avatar_url}
                            alt=""
                            className="w-7 h-7 rounded-xl object-cover shrink-0 mb-0.5"
                          />
                        )}
                        <div className={cn(
                          'max-w-[70%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed',
                          isMe
                            ? 'bg-slate-900 text-white rounded-br-sm'
                            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                        )}>
                          {msg.content}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-slate-100">
                <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-4 py-2">
                  <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                  </button>
                  <input
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={`Message ${selectedConv.client_name}...`}
                    className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
                    <Smile className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim()}
                    className={cn(
                      'p-2 rounded-xl transition-all shrink-0',
                      messageInput.trim()
                        ? 'bg-accent text-white hover:bg-accent/90 shadow-md shadow-accent/25'
                        : 'bg-slate-200 text-slate-400'
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-2">Your Messages</h3>
              <p className="text-slate-400 font-medium max-w-xs">
                Select a conversation to start chatting with your clients
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
