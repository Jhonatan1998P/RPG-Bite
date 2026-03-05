
import React from 'react';

interface GameCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  contentClassName?: string; // Nueva prop para controlar el layout interno
  rarity?: 'Común' | 'Poco Común' | 'Raro' | 'Épico' | 'Legendario';
  backgroundImage?: string;
  isInteractive?: boolean; 
}

export const GameCard: React.FC<GameCardProps> = ({ 
    children, 
    onClick, 
    disabled, 
    className = "", 
    contentClassName = "",
    rarity,
    backgroundImage,
    isInteractive = false
}) => {
    
    // Rarity Styling Map
    const getRarityStyles = (r?: string) => {
        switch(r) {
            case 'Legendario': return 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_25px_rgba(249,115,22,0.2)] bg-orange-950/10';
            case 'Épico': return 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] bg-purple-950/10';
            case 'Raro': return 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-blue-950/10';
            case 'Poco Común': return 'border-green-500/50 hover:border-green-500 bg-green-900/5';
            default: return 'border-white/10 hover:border-white/20 bg-slate-900/40';
        }
    };

    const rarityClass = getRarityStyles(rarity);
    const interactiveClass = (onClick || isInteractive) && !disabled 
        ? 'cursor-pointer hover:-translate-y-1 hover:bg-slate-800 transition-all duration-300' 
        : '';
    const disabledClass = disabled ? 'opacity-60 cursor-not-allowed grayscale' : '';

    const Component = onClick ? 'button' : 'div';

    return (
        <Component
            onClick={!disabled ? onClick : undefined}
            className={`
                group relative flex flex-col rounded-xl overflow-hidden border text-left
                ${rarityClass} 
                ${interactiveClass}
                ${disabledClass}
                ${className}
            `}
        >
            {/* Optional Background Image for the whole card */}
            {backgroundImage && (
                <div className="absolute inset-0 overflow-hidden z-0">
                     <img 
                        src={backgroundImage} 
                        className="w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" 
                        alt="bg" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
                </div>
            )}
            
            {/* Content Wrapper - Ahora flexible */}
            <div className={`relative z-10 flex h-full w-full ${contentClassName || 'flex-col'}`}>
                {children}
            </div>
        </Component>
    );
};
