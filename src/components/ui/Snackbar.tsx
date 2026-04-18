import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

export interface SnackbarMessage {
  id: string;
  message: string;
  type: SnackbarType;
  duration?: number;
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
}

const typeConfig = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle,
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: AlertCircle,
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
};

interface SnackbarItemProps {
  message: SnackbarMessage;
  onClose: (id: string) => void;
}

function SnackbarItem({ message, onClose }: SnackbarItemProps) {
  const config = typeConfig[message.type];
  const Icon = config.icon;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, message.duration || 4000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border} shadow-lg`}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
      <p className={`text-sm font-medium ${config.textColor} flex-1`}>{message.message}</p>
      <button
        onClick={() => onClose(message.id)}
        className={`${config.textColor} hover:opacity-70 transition-opacity shrink-0`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const showSnackbar = useCallback(
    (message: string, type: SnackbarType = 'info', duration?: number) => {
      const id = `${Date.now()}-${Math.random()}`;
      setMessages((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const success = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'success', duration);
  }, [showSnackbar]);

  const error = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'error', duration || 5000);
  }, [showSnackbar]);

  const info = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'info', duration);
  }, [showSnackbar]);

  const warning = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'warning', duration);
  }, [showSnackbar]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] space-y-2 max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <div key={message.id} className="pointer-events-auto">
              <SnackbarItem message={message} onClose={removeMessage} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </SnackbarContext.Provider>
  );
}
