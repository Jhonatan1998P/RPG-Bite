
import React, { useState } from 'react';
import { Player, Echo, EchoRarity, StatType } from '../../types';
import { ViewHeader } from '../Layout/ViewHeader';
import { TooltipTrigger } from '../UI/TooltipTrigger';
import { Sparkles, Gem, Dna, Flame, Infinity, RefreshCw, X, ChevronUp, ChevronDown } from 'lucide-react';

interface GachaViewProps {
  player: Player;
  onSummon: (type: 'SINGLE' | 'MULTI', currency: 'RUBY' | 'DUST' | 'FREE') => Echo[] | null;
  onEquip: (echo: Echo) => void;
  onBurn: (echo: Echo) => void;
}

export const GachaView: React.FC<GachaViewProps> = ({ player, onSummon, onEquip, onBurn }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [summonResults, setSummonResults] = useState<Echo[] | null>(null);
  const [showInventoryMobile, setShowInventoryMobile] = useState(false); // Toggle for mobile inventory expansion

  const handleSummon = (type: 'SINGLE' | 'MULTI', currency: 'RUBY' | 'DUST' | 'FREE') => {
      setIsAnimating(true);
      setTimeout(() => {
          const results = onSummon(type, currency);
          if (results) {
              setSummonResults(results);
          }
          setIsAnimating(false);
      }, 2000); // Slightly longer for dramatic effect
  };

  const canFreeSummon = (Date.now() - player.lastDailySummon) > 24 * 60 * 60 * 1000;

  const getRarityColor = (rarity: EchoRarity) => {
      switch(rarity) {
          case 'Ascendido': return 'text-orange-400 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] bg-orange-950/30';
          case 'Luminoso': return 'text-purple-400 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-950/30';
          case 'Resonante': return 'text-blue-400 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] bg-blue-950/30';
          default: return 'text-slate-400 border-slate-600 bg-slate-900/50';
      }
  };

  return (
    <div className="flex flex-col h-full gap-2 md:gap-4 animate-fade-in overflow-hidden relative">
      
      {/* 1. COMPACT HEADER */}
      <ViewHeader 
        title="Altar del Vacío" 
        subtitle={<span className="hidden md:inline">Invoca fragmentos de almas olvidadas.</span>}
        icon={<Infinity className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />}
        className="from-slate-900 to-purple-950/30 shrink-0"
      >
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2 bg-black/40 p-2 md:p-3 rounded-xl border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 hidden md:inline">Polvo</span>
                  <span className="font-mono text-cyan-400 font-bold flex items-center gap-1 text-xs md:text-sm">
                      {player.voidDust} <Dna className="w-3 h-3 md:w-4 md:h-4" />
                  </span>
              </div>
              <div className="w-px h-4 bg-white/10 md:hidden"></div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 hidden md:inline">Garantía</span>
                  <TooltipTrigger content="Invocaciones restantes para un Eco Ascendido asegurado.">
                    <span className="font-mono text-orange-400 font-bold flex items-center gap-1 text-xs md:text-sm cursor-help">
                        {player.pityCounter}/20 <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                    </span>
                  </TooltipTrigger>
              </div>
          </div>
      </ViewHeader>

      {/* 2. MAIN SUMMONING STAGE (Flex Grow) */}
      <div className="flex-grow flex flex-col relative rounded-2xl overflow-hidden border border-white/5 bg-slate-950/50 shadow-inner">
          
          {/* Background FX */}
          <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-950/50 to-slate-950"></div>
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 ${isAnimating ? 'animate-spin-slow' : ''}`}></div>
          </div>

          {/* RITUAL CIRCLE (Centered) */}
          <div className="flex-grow flex items-center justify-center relative z-10 py-4">
               <div className={`relative transition-all duration-1000 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
                   {/* Outer Ring */}
                   <div className={`w-48 h-48 md:w-72 md:h-72 rounded-full border border-purple-500/20 flex items-center justify-center relative ${isAnimating ? 'animate-spin' : ''}`}>
                        <div className="absolute inset-0 rounded-full border-t border-purple-400/40"></div>
                   </div>
                   {/* Inner Ring */}
                   <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center ${isAnimating ? 'animate-spin-reverse' : ''}`}>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                   </div>
                   {/* Core */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                       <div className={`w-16 h-16 md:w-24 md:h-24 bg-purple-500/10 rounded-full blur-xl ${isAnimating ? 'animate-pulse' : ''}`}></div>
                       {!isAnimating && <Infinity className="w-8 h-8 md:w-12 md:h-12 text-purple-500/50 animate-pulse-slow" />}
                   </div>
               </div>
          </div>

          {/* CONTROLS (Bottom of Stage) */}
          {!isAnimating && !summonResults && (
              <div className="relative z-20 p-4 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
                  <div className="max-w-md mx-auto flex flex-col gap-3">
                      
                      {/* Daily Free */}
                      <button 
                        onClick={() => handleSummon('SINGLE', 'FREE')}
                        disabled={!canFreeSummon}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between group transition-all relative overflow-hidden
                            ${canFreeSummon 
                                ? 'bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-900/60' 
                                : 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
                            }`}
                      >
                          <div className="flex items-center gap-3 relative z-10">
                              <div className={`p-1.5 rounded-lg ${canFreeSummon ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                              </div>
                              <div className="text-left">
                                  <div className="font-bold text-slate-200 text-xs md:text-sm">Invocación Diaria</div>
                                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{canFreeSummon ? 'Gratis' : 'En enfriamiento'}</div>
                              </div>
                          </div>
                          {canFreeSummon && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-pulse"></div>}
                      </button>

                      {/* Main Actions Grid */}
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                             onClick={() => handleSummon('SINGLE', 'RUBY')}
                             className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-500/20 bg-gradient-to-b from-slate-900 to-red-950/20 hover:border-red-500/50 active:scale-95 transition-all"
                          >
                              <span className="text-red-100 font-serif font-bold text-sm mb-1">Invocar x1</span>
                              <div className="flex items-center gap-1 text-red-400 font-mono text-xs font-bold">
                                  100 <Gem className="w-3 h-3" />
                              </div>
                          </button>
                          
                          <button 
                             onClick={() => handleSummon('MULTI', 'RUBY')}
                             className="relative flex flex-col items-center justify-center p-3 rounded-xl border border-gold-500/30 bg-gradient-to-b from-slate-900 to-gold-950/20 hover:border-gold-500/60 active:scale-95 transition-all overflow-hidden"
                          >
                              <div className="absolute top-0 right-0 bg-gold-600 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-bl">-10%</div>
                              <span className="text-gold-100 font-serif font-bold text-sm mb-1">Invocar x10</span>
                              <div className="flex items-center gap-1 text-gold-400 font-mono text-xs font-bold">
                                  900 <Gem className="w-3 h-3" />
                              </div>
                          </button>
                      </div>

                      {/* Dust Action */}
                      <button 
                             onClick={() => handleSummon('SINGLE', 'DUST')}
                             className="w-full py-2 rounded-lg border border-cyan-500/10 bg-slate-900/50 hover:bg-cyan-950/30 text-slate-500 hover:text-cyan-400 transition-colors text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2"
                      >
                          <Dna className="w-3 h-3" /> Usar Polvo Onírico (50)
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* 3. INVENTORY (Collapsible on Mobile, Fixed on Desktop) */}
      <div 
        className={`
            shrink-0 flex flex-col glass-panel border-t border-white/10 transition-all duration-300 ease-in-out
            ${showInventoryMobile ? 'h-64' : 'h-14 md:h-56'} 
        `}
      >
          <button 
            onClick={() => setShowInventoryMobile(!showInventoryMobile)}
            className="shrink-0 w-full p-2 border-b border-white/5 flex items-center justify-between bg-black/20 hover:bg-white/5 transition-colors md:cursor-default"
          >
              <div className="flex items-center gap-2 px-2">
                  <Infinity className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Grimorio <span className="text-slate-600">({player.echoesInventory.length})</span></h3>
              </div>
              <div className="md:hidden text-slate-500">
                  {showInventoryMobile ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
          </button>

          <div className="flex-grow overflow-y-auto p-2 md:p-3 custom-scrollbar bg-slate-950/30">
              {player.echoesInventory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 min-h-[100px]">
                      <Infinity className="w-8 h-8 opacity-20" />
                      <p className="text-[10px] italic">Tu grimorio está vacío.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {player.echoesInventory.map((echo) => (
                           <div key={echo.id} className="bg-slate-900 rounded-lg p-2 border border-white/5 flex items-center gap-3 group hover:border-white/10 transition-all">
                                <div className={`w-10 h-10 rounded-md shrink-0 overflow-hidden border ${getRarityColor(echo.rarity)}`}>
                                    <img src={echo.image} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <div className="min-w-0 flex-grow">
                                    <div className="text-xs font-bold text-slate-200 truncate">{echo.name}</div>
                                    <div className="flex gap-2 text-[9px] text-slate-500 font-mono">
                                        {Object.entries(echo.stats).map(([k, v]) => (
                                            <span key={k} className="text-cyan-400/80">{k.substring(0,3)} +{v}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TooltipTrigger content={player.equippedEcho?.id === echo.id ? "Equipado" : "Vincular Alma"}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onEquip(echo); }}
                                            disabled={player.equippedEcho?.id === echo.id}
                                            className={`p-1 rounded bg-slate-800 hover:bg-gold-600 hover:text-black transition-colors ${player.equippedEcho?.id === echo.id ? 'text-gold-500' : 'text-slate-400'}`}
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipTrigger content="Sacrificar por Polvo Onírico">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onBurn(echo); }}
                                            className="p-1 rounded bg-slate-800 hover:bg-red-900 hover:text-red-400 text-slate-400 transition-colors"
                                        >
                                            <Flame className="w-3 h-3" />
                                        </button>
                                    </TooltipTrigger>
                                </div>
                           </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* 4. RESULTS OVERLAY (Full Viewport on Mobile) */}
      {summonResults && (
          <div className="fixed inset-0 z-[100] h-[100dvh] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in overflow-hidden">
              <div className="shrink-0 p-6 flex justify-end">
                  {/* Close button just in case */}
              </div>
              
              <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-y-auto">
                  <h2 className="text-2xl md:text-4xl font-serif text-white mb-2 animate-slide-up text-center">Ecos Despertados</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-8"></div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 w-full max-w-5xl">
                      {summonResults.map((echo, idx) => (
                          <div 
                            key={idx} 
                            className={`
                                relative bg-slate-900/80 rounded-xl overflow-hidden border-2 p-3 flex flex-col items-center gap-3 animate-scale-in group 
                                ${getRarityColor(echo.rarity)}
                            `}
                            style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'backwards' }}
                          >
                              <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                                  <img src={echo.image} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                  <div className={`absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/60 backdrop-blur ${echo.rarity === 'Ascendido' ? 'text-orange-400 border border-orange-500/30' : 'text-slate-300'}`}>
                                      {echo.rarity}
                                  </div>
                              </div>
                              <div className="text-center w-full">
                                  <div className="font-serif font-bold text-sm text-white leading-tight truncate px-1">{echo.name}</div>
                                  <div className="flex justify-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                                      {Object.entries(echo.stats).map(([k, v]) => (
                                          <span key={k} className="bg-black/40 px-1.5 py-0.5 rounded">{k.substring(0,3)} <span className="text-white">+{v}</span></span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="shrink-0 p-8 pb-12 flex justify-center bg-gradient-to-t from-black via-black/80 to-transparent">
                  <button 
                    onClick={() => setSummonResults(null)}
                    className="px-10 py-4 bg-white text-black font-serif font-bold uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  >
                      Aceptar Destino
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};
