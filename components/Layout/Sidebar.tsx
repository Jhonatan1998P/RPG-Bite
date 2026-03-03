
import React from 'react';
import { User, Scroll, Swords, ShoppingBag, Shield, FileText, TrendingUp, LogOut, Download, Infinity, Hammer, Users, Wifi } from 'lucide-react';
import { ViewState } from '../../types';
import { TooltipTrigger } from '../UI/TooltipTrigger';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onExport: () => void;
  onExit: () => void;
  onOpenMultiplayer?: () => void;
  isMultiplayerConnected?: boolean;
  peerCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onExport, onExit, onOpenMultiplayer, isMultiplayerConnected, peerCount = 0 }) => {
  const navItems = [
    { id: ViewState.PROFILE, label: 'Personaje', icon: User, desc: 'Gestiona tus atributos y equipo.' },
    { id: ViewState.TAVERN, label: 'Taberna', icon: Scroll, desc: 'Acepta misiones para ganar recursos.' },
    { id: ViewState.ARENA, label: 'Arena', icon: Swords, desc: 'Combate contra otros guerreros.' },
    { id: ViewState.RANKINGS, label: 'Clasificación', icon: TrendingUp, desc: 'Ver el ranking de la liga.' },
    { id: ViewState.FORGE, label: 'Herrería', icon: Hammer, desc: 'Crea, mejora y recicla equipamiento.' },
    { id: ViewState.GACHA, label: 'Altar', icon: Infinity, desc: 'Invoca Ecos del Vacío.' },
    { id: ViewState.REPORTS, label: 'Informes', icon: FileText, desc: 'Historial de tus batallas pasadas.' },
    { id: ViewState.MERCHANT, label: 'Mercader', icon: ShoppingBag, desc: 'Compra objetos y consumibles.' },
  ];

  return (
    <div className="hidden md:flex w-64 flex-shrink-0 flex-col gap-4 h-full">
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-gold-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Shield className="w-8 h-8 text-gold-500 mr-3 relative z-10" />
        <h1 className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 tracking-wider relative z-10">
          SHADOWBOUND
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <TooltipTrigger key={item.id} content={item.desc} className="w-full">
                <button
                onClick={() => setView(item.id)}
                className={`
                    w-full group flex items-center p-3.5 rounded-xl transition-all duration-300 border text-left relative overflow-hidden
                    ${isActive 
                    ? 'bg-gradient-to-r from-gold-600/20 to-transparent border-gold-500/50 text-gold-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                    : 'glass-panel glass-panel-hover border-transparent text-slate-400 hover:text-slate-200 hover:pl-5'
                    }
                `}
                >
                <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-gold-400' : 'text-slate-500'}`} />
                <span className="font-serif font-semibold tracking-wide text-sm">{item.label}</span>
                {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_8px_#eab308]" />
                )}
                </button>
            </TooltipTrigger>
          );
        })}
      </nav>

      {onOpenMultiplayer && (
        <TooltipTrigger content="Juega con otros viajeros" className="w-full">
          <button
            onClick={onOpenMultiplayer}
            className={`
              w-full group flex items-center p-3.5 rounded-xl transition-all duration-300 border text-left relative overflow-hidden
              ${isMultiplayerConnected 
              ? 'bg-gradient-to-r from-green-600/20 to-transparent border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
              : 'glass-panel glass-panel-hover border-transparent text-slate-400 hover:text-slate-200 hover:pl-5'
              }
            `}
          >
            {isMultiplayerConnected ? (
              <Wifi className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 text-green-400`} />
            ) : (
              <Users className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 text-slate-500`} />
            )}
            <span className="font-serif font-semibold tracking-wide text-sm">
              {isMultiplayerConnected ? `En línea (${peerCount})` : 'Multijugador'}
            </span>
            {isMultiplayerConnected && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            )}
          </button>
        </TooltipTrigger>
      )}

      <div className="mt-auto flex gap-2">
         <button 
            onClick={onExport}
            className="flex-1 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/20"
            title="Exportar Partida"
         >
             <Download className="w-4 h-4" /> 
         </button>
         <button 
            onClick={onExit}
            className="flex-1 py-2 px-4 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-red-500/10 hover:border-red-500/30"
            title="Guardar y Salir"
         >
             <LogOut className="w-4 h-4" /> 
         </button>
      </div>
    </div>
  );
};
