
import React, { useState } from 'react';
import { User, Scroll, Swords, FileText, ShoppingBag, Menu, X, ChevronRight, Compass, TrendingUp, LogOut, Infinity } from 'lucide-react';
import { ViewState } from '../../types';

interface MobileNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onExit: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, setView, onExit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Items visible on the main bar
  const mainNavItems = [
    { id: ViewState.PROFILE, label: 'Héroe', icon: User },
    { id: ViewState.TAVERN, label: 'Taberna', icon: Scroll },
    { id: ViewState.ARENA, label: 'Arena', icon: Swords },
  ];

  // All items for the expanded menu
  const menuGridItems = [
      { id: ViewState.PROFILE, label: 'Héroe', icon: User, desc: 'Atributos y Equipo', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500/30' },
      { id: ViewState.TAVERN, label: 'Taberna', icon: Scroll, desc: 'Misiones y Contratos', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30' },
      { id: ViewState.ARENA, label: 'Arena', icon: Swords, desc: 'Combate PvP', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30' },
      { id: ViewState.GACHA, label: 'Altar', icon: Infinity, desc: 'Invoca Ecos', color: 'text-cyan-400', bg: 'bg-cyan-900/20', border: 'border-cyan-500/30' },
      { id: ViewState.RANKINGS, label: 'Rankings', icon: TrendingUp, desc: 'Clasificación de Liga', color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-500/30' },
      { id: ViewState.MERCHANT, label: 'Mercader', icon: ShoppingBag, desc: 'Comprar y Vender', color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-500/30' },
      { id: ViewState.REPORTS, label: 'Crónicas', icon: FileText, desc: 'Historial de Batallas', color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-slate-600/30' },
  ];

  const handleSetView = (view: ViewState) => {
      setView(view);
      setIsMenuOpen(false);
  };

  const handleLogout = () => {
      setIsMenuOpen(false);
      onExit();
  }

  return (
    <>
      {/* Full Screen Menu Overlay */}
      {isMenuOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={() => setIsMenuOpen(false)}
              ></div>
              
              {/* Menu Sheet */}
              <div className="relative bg-[#0b0f19] border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-slide-up flex flex-col max-h-[85vh] overflow-hidden">
                  
                  {/* Handle Bar */}
                  <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsMenuOpen(false)}>
                      <div className="w-12 h-1.5 bg-slate-700 rounded-full"></div>
                  </div>

                  {/* Header */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                             <Compass className="w-5 h-5 text-gold-500" />
                          </div>
                          <div>
                              <h3 className="font-serif text-xl text-slate-200">Mapa del Reino</h3>
                              <p className="text-xs text-slate-500">Selecciona tu destino</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Grid Content */}
                  <div className="p-6 grid grid-cols-1 gap-3 overflow-y-auto pb-safe">
                      {menuGridItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSetView(item.id)}
                            className={`
                                group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 active:scale-[0.98]
                                ${currentView === item.id 
                                    ? 'bg-gradient-to-r from-gold-900/20 to-slate-900 border-gold-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                                    : 'bg-slate-900/50 border-white/5 hover:bg-slate-800 hover:border-white/10'
                                }
                            `}
                          >
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${item.bg} ${item.border} ${item.color}`}>
                                  <item.icon className="w-6 h-6" />
                              </div>
                              <div className="flex-grow text-left">
                                  <h4 className={`font-serif font-bold text-sm ${currentView === item.id ? 'text-gold-400' : 'text-slate-200'}`}>
                                      {item.label}
                                  </h4>
                                  <p className="text-xs text-slate-500">{item.desc}</p>
                              </div>
                              <div className={`text-slate-600 transition-transform group-hover:translate-x-1 ${currentView === item.id ? 'text-gold-500' : ''}`}>
                                  <ChevronRight className="w-5 h-5" />
                              </div>
                          </button>
                      ))}
                      
                       <button
                            onClick={handleLogout}
                            className="group flex items-center gap-4 p-4 rounded-xl border border-red-900/30 bg-red-900/10 hover:bg-red-900/20 active:scale-[0.98] transition-all mt-4"
                          >
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-red-500/30 bg-red-900/20 text-red-400">
                                  <LogOut className="w-6 h-6" />
                              </div>
                              <div className="flex-grow text-left">
                                  <h4 className="font-serif font-bold text-sm text-red-400">
                                      Guardar y Salir
                                  </h4>
                                  <p className="text-xs text-slate-500">Regresa al menú principal</p>
                              </div>
                      </button>
                      
                      {/* Decorative Footer */}
                      <div className="mt-4 text-center">
                          <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase opacity-50">Shadowbound v1.4</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
        {/* Blurry Background */}
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"></div>
        
        <nav className="relative flex justify-around items-center p-2 pb-safe">
          
          {/* Main 3 Icons */}
          {mainNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full active:scale-90
                  ${isActive 
                    ? 'text-gold-400' 
                    : 'text-slate-500 hover:text-slate-300'
                  }
                `}
              >
                <div className={`relative p-1.5 rounded-lg transition-all ${isActive ? 'bg-gold-500/10' : ''}`}>
                  <item.icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {isActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold-500 rounded-full shadow-[0_0_8px_#eab308] animate-pulse"></span>
                  )}
                </div>
                <span className={`text-[9px] font-serif tracking-wider ${isActive ? 'font-bold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* The Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full active:scale-90
              ${isMenuOpen ? 'text-white' : 'text-slate-500'}
            `}
          >
             <div className={`relative p-1.5 rounded-lg transition-all ${isMenuOpen ? 'bg-slate-700' : ''}`}>
                <Menu className="w-5 h-5 mb-0.5" />
             </div>
             <span className="text-[9px] font-serif tracking-wider">Menú</span>
          </button>

        </nav>
      </div>
    </>
  );
};
