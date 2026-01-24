
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { eventBus, EventTypes, TooltipData } from '../../services/eventBus';
import { X } from 'lucide-react';

export const TooltipSystem: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [position, setPosition] = useState<React.CSSProperties>({ opacity: 0 }); // Start invisible to measure
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect Mobile/Touch Device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const show = (data: TooltipData) => setTooltip(data);
    const hide = () => setTooltip(null);

    eventBus.on(EventTypes.SHOW_TOOLTIP, show);
    eventBus.on(EventTypes.HIDE_TOOLTIP, hide);

    return () => {
      eventBus.off(EventTypes.SHOW_TOOLTIP, show);
      eventBus.off(EventTypes.HIDE_TOOLTIP, hide);
    };
  }, []);

  // Smart Positioning Logic
  useLayoutEffect(() => {
    if (!tooltip || !tooltipRef.current) return;

    if (isMobile) {
      // MOBILE: Fixed Bottom Sheet logic
      setPosition({
        position: 'fixed',
        bottom: '0', 
        left: '0',
        width: '100%',
        zIndex: 9999,
        opacity: 1,
        transform: 'translateY(0)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      });
      return;
    }

    // DESKTOP: Floating logic
    const targetRect = tooltip.targetRect;
    const tooltipEl = tooltipRef.current;
    const tooltipRect = tooltipEl.getBoundingClientRect();
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 12; // Distance from element

    let top = targetRect.top - tooltipRect.height - gap; // Default: Above
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2); // Default: Centered

    // Vertical Flip
    if (top < 10) {
      top = targetRect.bottom + gap;
      if (top + tooltipRect.height > viewportHeight) {
         top = Math.max(10, viewportHeight - tooltipRect.height - 10);
      }
    }

    // Horizontal Clamp
    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }

    setPosition({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      opacity: 1,
      transform: 'scale(1)',
      zIndex: 9999
    });

  }, [tooltip, isMobile]);

  if (!tooltip) return null;

  return (
    <div
      id="global-tooltip-container" // CRITICAL: ID for click detection
      ref={tooltipRef}
      style={position}
      // CRITICAL FIX: Removed 'pointer-events-none' from mobile/global to allow clicking buttons inside tooltip
      className={`
        transition-all duration-200 ease-out z-[9999]
        ${isMobile 
            ? 'pointer-events-auto border-t border-gold-500/30 bg-slate-950/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)]' 
            : 'pointer-events-none md:pointer-events-auto rounded-xl min-w-[220px] max-w-sm'
        }
      `}
    >
      <div className={`relative group ${isMobile ? 'p-6 pb-24' : ''}`}> 
        
        {!isMobile && (
             <div className="absolute -inset-0.5 bg-gradient-to-b from-gold-600/40 to-slate-900/40 rounded-xl blur-[1px]"></div>
        )}

        <div className={`
            relative bg-[#020617] text-slate-200 border-gold-500/20 shadow-2xl
            ${isMobile ? 'bg-transparent border-none' : 'px-4 py-3 rounded-xl border'}
        `}>
          {/* Mobile Handle */}
          {isMobile && (
              <div className="flex justify-center mb-4" onClick={() => eventBus.emit(EventTypes.HIDE_TOOLTIP)}>
                  <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
              </div>
          )}

          {/* Decoration for Desktop */}
          {!isMobile && (
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-px bg-gold-500/60 shadow-[0_0_10px_#eab308]"></div>
          )}
          
          {/* CONTENT */}
          <div className="text-sm leading-relaxed font-sans relative z-10">
            {tooltip.content}
          </div>

          {!isMobile && (
             <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-px bg-gold-500/30"></div>
          )}
        </div>
      </div>
    </div>
  );
};
