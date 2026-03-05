
import React from 'react';
import { Item, ItemType, QuestRarity } from '../../types';
import { 
  Sword, Axe, Zap, Target, Shield, Shirt, Footprints, 
  Gem, Utensils, Soup, Ham, Croissant, Ghost, Crown, 
  Sparkles, Hexagon, Circle
} from 'lucide-react';

interface ItemIconProps {
  item: Item;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLevel?: boolean;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ item, size = 'md', className = '', showLevel = false }) => {
  
  // 1. Icon Logic based on Type & Subtype
  const getIcon = () => {
    switch (item.type) {
      case ItemType.WEAPON:
        if (item.subtype === 'axe') return Axe;
        if (item.subtype === 'bow') return Target;
        if (item.subtype === 'staff' || item.subtype === 'wand') return Zap;
        if (item.subtype === 'dagger') return Sword; // Rotate in CSS?
        return Sword;
      case ItemType.HELMET:
        if (item.subtype === 'hood') return Ghost;
        return Crown; // Using Crown/Helmet abstract
      case ItemType.ARMOR:
        return Shirt;
      case ItemType.BOOTS:
        return Footprints;
      case ItemType.AMULET:
        return Gem;
      case ItemType.FOOD:
        if (item.subtype === 'stew') return Soup;
        if (item.subtype === 'roast') return Ham;
        if (item.subtype === 'bread') return Croissant;
        return Utensils;
      default:
        return Hexagon;
    }
  };

  const IconComponent = getIcon();

  // 2. Rarity Styles (Gradients & Borders)
  const getStyles = (rarity: QuestRarity) => {
    switch (rarity) {
      case 'Legendario':
        return {
          bg: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-orange-900/40 to-slate-950',
          border: 'border-orange-500/50',
          icon: 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]',
          glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]'
        };
      case 'Épico':
        return {
          bg: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-purple-900/40 to-slate-950',
          border: 'border-purple-500/50',
          icon: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]',
          glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]'
        };
      case 'Raro':
        return {
          bg: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-blue-900/40 to-slate-950',
          border: 'border-blue-500/50',
          icon: 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.6)]',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]'
        };
      case 'Poco Común':
        return {
          bg: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-green-900/40 to-slate-950',
          border: 'border-green-500/40',
          icon: 'text-green-400 drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]',
          glow: 'shadow-[0_0_10px_rgba(34,197,94,0.1)]'
        };
      default: // Común
        return {
          bg: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700/20 via-slate-800/40 to-slate-950',
          border: 'border-slate-600/40',
          icon: 'text-slate-400',
          glow: ''
        };
    }
  };

  const styles = getStyles(item.rarity);

  // 3. Sizing
  const sizeClasses = {
    sm: 'w-10 h-10 p-2',
    md: 'w-full h-full p-2 md:p-3', // Adapts to parent container usually
    lg: 'w-24 h-24 p-5',
    xl: 'w-32 h-32 p-6'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-full h-full',
    lg: 'w-full h-full',
    xl: 'w-full h-full'
  };

  return (
    <div className={`relative rounded-xl border flex items-center justify-center overflow-hidden transition-all duration-300 ${styles.bg} ${styles.border} ${styles.glow} ${size === 'md' ? 'w-full h-full' : sizeClasses[size]} ${className}`}>
      
      {/* Background Texture/Noise */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
      
      {/* The Icon */}
      <IconComponent 
        className={`${iconSizes[size]} ${styles.icon} transition-transform duration-500 group-hover:scale-110`} 
        strokeWidth={1.5}
      />

      {/* Shine Effect */}
      <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/5 to-transparent rotate-45 pointer-events-none"></div>

      {/* Level Indicator (Optional embedded) */}
      {showLevel && (
        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-white border border-white/10 shadow-sm z-10">
            L{item.level}
        </div>
      )}

      {/* Food Indicator */}
      {item.type === ItemType.FOOD && (
         <div className="absolute top-1 left-1 bg-green-900/80 px-1 rounded text-[8px] font-mono text-green-400 border border-green-500/30">
            HP
         </div>
      )}
    </div>
  );
};
