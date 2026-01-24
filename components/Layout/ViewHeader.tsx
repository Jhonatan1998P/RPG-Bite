
import React from 'react';

interface ViewHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  backgroundImage?: string;
  icon?: React.ReactNode; // Elemento o Icono principal
  imageSrc?: string; // Si es una imagen (avatar/npc)
  children?: React.ReactNode; // Contenido de la derecha (Stats, Botones)
  className?: string;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({ 
    title, 
    subtitle, 
    backgroundImage, 
    icon, 
    imageSrc, 
    children,
    className = ""
}) => {
  return (
    <div className={`shrink-0 relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900 group ${className}`}>
        {/* Background Layer */}
        {backgroundImage && (
             <div className="absolute inset-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 group-hover:scale-105"
                    style={{ backgroundImage: `url('${backgroundImage}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
             </div>
        )}
        
        {/* Decorative Patterns */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

        {/* Content Container */}
        <div className="relative z-10 p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 w-full">
            
            {/* Left: Identity (Icon/Image + Text) */}
            <div className="flex items-center gap-5 flex-grow text-center md:text-left w-full md:w-auto">
                {/* Visual Avatar/Icon */}
                <div className="shrink-0 relative">
                    {imageSrc ? (
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-gold-500/30 overflow-hidden shadow-2xl bg-black">
                            <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
                        </div>
                    ) : icon ? (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 bg-slate-800 border border-white/10 shadow-lg rotate-3">
                            {icon}
                        </div>
                    ) : null}
                </div>

                {/* Text Info */}
                <div className="flex flex-col justify-center min-w-0">
                     <h2 className="font-serif text-2xl md:text-3xl text-white text-shadow mb-1 leading-tight">{title}</h2>
                     {subtitle && (
                         <div className="text-sm text-slate-300 opacity-90 flex flex-col md:flex-row gap-2 items-center md:items-start">
                             {typeof subtitle === 'string' ? <p className="italic max-w-md">{subtitle}</p> : subtitle}
                         </div>
                     )}
                </div>
            </div>

            {/* Right: Actions / Stats (Passed as children) */}
            {children && (
                <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto mt-4 md:mt-0 bg-black/20 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border md:border-none border-white/5">
                    {children}
                </div>
            )}
        </div>
    </div>
  );
};
