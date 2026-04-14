import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  isDark: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ content, children, isDark, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full left-1/2 bottom-[calc(100%+8px)]',
    bottom: '-translate-x-1/2 translate-y-full left-1/2 top-[calc(100%+8px)]',
    left: '-translate-x-full -translate-y-1/2 top-1/2 right-[calc(100%+8px)]',
    right: 'translate-x-full -translate-y-1/2 top-1/2 left-[calc(100%+8px)]',
  };

  return (
    <div 
      className="relative block w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-[200] px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase whitespace-nowrap pointer-events-none border shadow-xl",
              isDark 
                ? "bg-black/90 text-white border-white/10 backdrop-blur-md" 
                : "bg-white/90 text-black border-neutral-200 backdrop-blur-md shadow-neutral-200/50",
              positionClasses[position]
            )}
          >
            {content}
            <div className={cn(
              "absolute w-2 h-2 rotate-45 border",
              isDark ? "bg-black/90 border-white/10" : "bg-white/90 border-neutral-200",
              position === 'top' && "bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0",
              position === 'bottom' && "top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0",
              position === 'left' && "right-[-5px] top-1/2 -translate-y-1/2 border-b-0 border-l-0",
              position === 'right' && "left-[-5px] top-1/2 -translate-y-1/2 border-t-0 border-r-0",
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
