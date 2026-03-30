'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Trash2, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  type = 'danger',
  icon
}: ConfirmationModalProps) {
  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'danger': return <Trash2 className="w-8 h-8 text-red-500" />;
      case 'warning': return <Shield className="w-8 h-8 text-purple-500" />;
      default: return <AlertCircle className="w-8 h-8 text-blue-500" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger': return 'bg-red-500/20';
      case 'warning': return 'bg-purple-500/20';
      default: return 'bg-blue-500/20';
    }
  };

  const getConfirmBtnClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-500';
      case 'warning': return 'bg-purple-600 hover:bg-purple-500';
      default: return 'bg-blue-600 hover:bg-blue-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={cn("size-16 rounded-full flex items-center justify-center mx-auto mb-4", getIconBg())}>
              {getIcon()}
            </div>
            
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-slate-400 text-sm mb-6">
              {description}
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn("w-full text-white font-bold py-3 rounded-xl transition-all active:scale-95", getConfirmBtnClass())}
              >
                {confirmLabel}
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
