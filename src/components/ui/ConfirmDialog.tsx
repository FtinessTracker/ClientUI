import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return context;
}

interface PendingDialog extends ConfirmDialogOptions {
  id: string;
  resolve: (value: boolean) => void;
}

function ConfirmDialogComponent({
  dialog,
  onResolve,
}: {
  dialog: PendingDialog;
  onResolve: (id: string, value: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full"
      >
        {/* Header */}
        <div className={`p-6 border-b ${dialog.isDangerous ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-start gap-3">
            {dialog.isDangerous && (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            )}
            <div>
              <h2 className="font-bold text-slate-900">{dialog.title}</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed">{dialog.message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => onResolve(dialog.id, false)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            {dialog.cancelText || 'Cancel'}
          </button>
          <button
            onClick={() => onResolve(dialog.id, true)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors ${
              dialog.isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {dialog.confirmText || 'Confirm'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogs, setDialogs] = useState<PendingDialog[]>([]);

  const handleResolve = useCallback((id: string, value: boolean) => {
    setDialogs((prev) => {
      const dialog = prev.find((d) => d.id === id);
      if (dialog) {
        dialog.resolve(value);
      }
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  const confirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        const id = `${Date.now()}-${Math.random()}`;
        const dialog: PendingDialog = { ...options, id, resolve };
        setDialogs((prev) => [...prev, dialog]);
      });
    },
    []
  );

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[9998]">
        <AnimatePresence mode="popLayout">
          {dialogs.map((dialog) => (
            <div key={dialog.id} className="pointer-events-auto">
              <ConfirmDialogComponent dialog={dialog} onResolve={handleResolve} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ConfirmDialogContext.Provider>
  );
}
