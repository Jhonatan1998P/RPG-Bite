
import React, { useRef, useState, useEffect } from 'react';
import { eventBus, EventTypes } from '../../services/eventBus';

interface TooltipTriggerProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  className?: string;
}

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ content, children, className }) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const showTooltip = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      eventBus.emit(EventTypes.SHOW_TOOLTIP, {
        content,
        targetRect: rect
      });
      setIsTooltipVisible(true);
    }
  };

  const hideTooltip = () => {
    eventBus.emit(EventTypes.HIDE_TOOLTIP);
    setIsTooltipVisible(false);
  };

  // Global click/touch listener to close tooltip when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
          if (!isTooltipVisible) return;

          const target = event.target as Node;
          
          // 1. Check if clicking the trigger itself
          if (triggerRef.current && triggerRef.current.contains(target)) {
              return;
          }

          // 2. CRITICAL: Check if clicking inside the Tooltip Portal/Container
          // Since TooltipSystem is rendered outside this component tree (via EventBus/Portal),
          // we must check the DOM directly for the tooltip container ID.
          const tooltipContainer = document.getElementById('global-tooltip-container');
          if (tooltipContainer && tooltipContainer.contains(target)) {
              return; // Clicked inside the tooltip (e.g. Action Button), do not close yet
          }

          // If neither, close it
          hideTooltip();
      };

      if (isTooltipVisible) {
          // Use capture to catch events early
          document.addEventListener('mousedown', handleClickOutside);
          document.addEventListener('touchstart', handleClickOutside);
      }

      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('touchstart', handleClickOutside);
      };
  }, [isTooltipVisible]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (isTooltipVisible) hideTooltip();
      };
  }, [isTooltipVisible]);

  return (
    <div 
      ref={triggerRef}
      onMouseEnter={() => {
          // Only use hover logic if user has a mouse
          if (window.matchMedia('(hover: hover)').matches) {
              showTooltip();
          }
      }}
      onMouseLeave={() => {
          if (window.matchMedia('(hover: hover)').matches) {
              hideTooltip();
          }
      }}
      onClick={(e) => {
        // On Mobile/Touch, click toggles visibility
        if (window.matchMedia('(hover: none)').matches) {
           e.stopPropagation(); // Prevent bubbling up which might trigger parent listeners
           if (isTooltipVisible) {
               hideTooltip();
           } else {
               showTooltip();
           }
        }
      }}
      className={`relative inline-block cursor-help ${className || ''}`}
    >
      {children}
    </div>
  );
};
