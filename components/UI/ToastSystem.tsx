
import React, { useState, useEffect } from 'react';
import { eventBus, EventTypes, ToastData } from '../../services/eventBus';
import { X, CheckCircle, AlertCircle, Info, Shield } from 'lucide-react';

export const ToastSystem: React.FC = () => {
  const [toasts, setToasts] = useState<(ToastData & { id: number })[]>([]);

  useEffect(() => {
    const handleShowToast = (data: ToastData) => {
      const id = Date.now();
      setToasts(prev => {
        // Limit stack size to 3 to prevent clutter
        const newStack = [...prev, { ...data, id }];
        if (newStack.length > 3) newStack.shift(); 
        return newStack;
      });

      setTimeout(() => {
        removeToast(id);
      }, data.duration || 4000);
    };

    eventBus.on(EventTypes.SHOW_TOAST, handleShowToast);
    return () => eventBus.off(EventTypes.SHOW_TOAST, handleShowToast);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    // Container: Fixed, Full Width on Mobile (Top), Fixed Corner on Desktop (Bottom-Right)
    <div className="fixed z-[9999] pointer-events-none flex flex-col gap-2 
                    top-[env(safe-area-inset-top,16px)] left-0 w-full px-4 items-center
                    md:top-auto md:bottom-8 md:left-auto md:right-8 md:items-end md:w-auto">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border backdrop-blur-xl
            w-full max-w-sm transition-all duration-300 animate-fade-in-up md:animate-slide-up
            ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/50 text-green-100' : 
              toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-100' :
              'bg-slate-900/90 border-gold-500/50 text-gold-100'}
          `}
          role="alert"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Shield className="w-5 h-5 text-gold-400" />}
          </div>
          
          <div className="flex-grow text-sm font-sans leading-relaxed text-shadow-sm">
            {toast.message}
          </div>
          
          <button 
            onClick={() => removeToast(toast.id)} 
            className="shrink-0 text-white/50 hover:text-white transition-colors p-1 -mr-2 -mt-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
