
import React, { useState } from 'react';
import { Player, Echo, EchoRarity } from '../../types';
import { ViewHeader } from '../Layout/ViewHeader';
import { TooltipTrigger } from '../UI/TooltipTrigger';
import { Sparkles, Gem, Dna, Flame, Infinity, RefreshCw, Layers } from 'lucide-react';

interface GachaViewProps {
  player: Player;
  onSummon: (type: 'SINGLE' | 'MULTI', currency: 'RUBY' | 'DUST' | 'FREE') => Echo[] | null;
  onEquip: (echo: Echo) => void;
  onBurn: (echo: Echo) => void;
}

export const GachaView: React.FC<GachaViewProps> = ({ player, onSummon, onEquip, onBurn }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [summonResults, setSummonResults] = useState<Echo[] | null>(null);

  const handleSummon = (type: 'SINGLE' | 'MULTI', currency: 'RUBY' | 'DUST' | 'FREE') => {
      setIsAnimating(true);
      // Scroll to top to see animation
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
          const results = onSummon(type, currency);
          if (results) {
              setSummonResults(results);
          }
          setIsAnimating(false);
      }, 2000); 
  };

  const canFreeSummon = (Date.now() - player.lastDailySummon) > 24 * 60 * 60 * 1000;

  const getRarityColor = (rarity: EchoRarity) => {
      switch(rarity) {
          case 'Ascendido': return 'text-orange-400 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] bg-orange-950/40';
          case 'Luminoso': return 'text-purple-400 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)] bg-purple-950/40';
          case 'Resonante': return 'text-blue-400 border-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.3)] bg-blue-950/40';
          default: return 'text-slate-400 border-slate-700 bg-slate-900/60';
      }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-6 animate-fade-in relative">
      
      {/* 1. HEADER (Currency Stats) */}
      <ViewHeader 
        title="Altar del Vacío" 
        subtitle="El velo entre los mundos es delgado aquí."
        icon={<Infinity className="w-8 h-8 text-purple-500" />}
        className="from-slate-900 to-purple-950/30"
      >
          <div className="flex gap-4 items-center bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-md">
              <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Polvo</span>
                  <span className="font-mono text-cyan-400 font-bold flex items-center gap-1 text-sm">
                      {player.voidDust} <Dna className="w-3 h-3" />
                  </span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Piedad</span>
                  <TooltipTrigger content="Tiradas restantes para asegurar un Legendario.">
                    <span className="font-mono text-orange-400 font-bold flex items-center gap-1 text-sm cursor-help">
                        {player.pityCounter}/20 <Sparkles className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
              </div>
          </div>
      </ViewHeader>

      {/* 2. MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: RITUAL STAGE (Summoning) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="glass-panel rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl relative bg-slate-900/80">
                  {/* Decorative BG */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50"></div>
                  
                  {/* Animation Container */}
                  <div className="relative h-64 md:h-80 flex items-center justify-center p-6">
                       <div className={`relative transition-all duration-1000 ${isAnimating ? 'scale-110 brightness-125' : 'scale-100'}`}>
                           {/* Outer Ring */}
                           <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full border-2 border-purple-500/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(168,85,247,0.1)] ${isAnimating ? 'animate-spin' : ''}`}>
                                <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400/50"></div>
                                <div className="absolute -inset-2 rounded-full border border-dashed border-purple-500/20 opacity-50"></div>
                           </div>
                           {/* Inner Ring */}
                           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-40 md:h-40 rounded-full border border-cyan-500/30 flex items-center justify-center ${isAnimating ? 'animate-spin-reverse' : ''}`}>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]"></div>
                           </div>
                           {/* Core Icon */}
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                               <div className={`w-16 h-16 bg-purple-500/20 rounded-full blur-2xl ${isAnimating ? 'animate-pulse' : ''}`}></div>
                               <Infinity className={`w-10 h-10 text-purple-300/80 ${isAnimating ? 'animate-pulse' : ''}`} />
                           </div>
                       </div>
                  </div>

                  {/* Controls Area */}
                  <div className="p-4 bg-black/20 border-t border-white/5 space-y-3 relative z-10">
                      {/* Free Summon */}
                      <button 
                        onClick={() => handleSummon('SINGLE', 'FREE')}
                        disabled={!canFreeSummon || isAnimating}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between group transition-all relative overflow-hidden
                            ${canFreeSummon 
                                ? 'bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400/60' 
                                : 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
                            }`}
                      >
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${canFreeSummon ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                  <div className="font-bold text-slate-200 text-sm">Invocación Diaria</div>
                                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{canFreeSummon ? 'Disponible' : 'En enfriamiento'}</div>
                              </div>
                          </div>
                      </button>

                      {/* Ruby Options */}
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                             onClick={() => handleSummon('SINGLE', 'RUBY')}
                             disabled={isAnimating}
                             className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-500/20 bg-gradient-to-br from-slate-900 to-red-950/30 hover:border-red-500/50 active:scale-95 transition-all group"
                          >
                              <span className="text-red-100 font-serif font-bold text-xs md:text-sm mb-1 group-hover:text-white">Invocar x1</span>
                              <div className="flex items-center gap-1 text-red-400 font-mono text-xs font-bold bg-black/30 px-2 py-0.5 rounded-full">
                                  100 <Gem className="w-3 h-3" />
                              </div>
                          </button>
                          
                          <button 
                             onClick={() => handleSummon('MULTI', 'RUBY')}
                             disabled={isAnimating}
                             className="relative flex flex-col items-center justify-center p-3 rounded-xl border border-gold-500/30 bg-gradient-to-br from-slate-900 to-gold-950/30 hover:border-gold-500/60 active:scale-95 transition-all group overflow-hidden"
                          >
                              <div className="absolute top-0 right-0 bg-gold-600 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-bl shadow-sm">-10%</div>
                              <span className="text-gold-100 font-serif font-bold text-xs md:text-sm mb-1 group-hover:text-white">Invocar x10</span>
                              <div className="flex items-center gap-1 text-gold-400 font-mono text-xs font-bold bg-black/30 px-2 py-0.5 rounded-full">
                                  900 <Gem className="w-3 h-3" />
                              </div>
                          </button>
                      </div>

                      {/* Dust Option */}
                      <button 
                             onClick={() => handleSummon('SINGLE', 'DUST')}
                             disabled={isAnimating}
                             className="w-full py-2.5 rounded-lg border border-cyan-500/20 bg-slate-900/50 hover:bg-cyan-950/30 text-slate-400 hover:text-cyan-300 transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                          <Dna className="w-3.5 h-3.5" /> Usar Polvo Onírico (50)
                      </button>
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN: INVENTORY (Grid) */}
          <div className="lg:col-span-7 flex flex-col glass-panel rounded-2xl border border-white/5 bg-slate-900/40 min-h-[400px]">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gold-500" />
                      <h3 className="font-serif text-slate-200 font-bold tracking-wide">Grimorio de Almas</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-black/30 px-2 py-1 rounded border border-white/5">
                      {player.echoesInventory.length} Ecos
                  </span>
              </div>

              <div className="p-4">
                  {player.echoesInventory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-slate-600 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                          <Infinity className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-sm italic">Tu grimorio está vacío.</p>
                          <p className="text-xs opacity-50 mt-1">Realiza un ritual para obtener ecos.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                          {player.echoesInventory.map((echo) => (
                               <div 
                                    key={echo.id} 
                                    className={`relative group rounded-xl p-3 border transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2 ${getRarityColor(echo.rarity)}`}
                               >
                                    <div className="aspect-square rounded-lg overflow-hidden relative bg-black/50 border border-white/5">
                                        <img src={echo.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
                                        {/* Action Overlay */}
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                            <TooltipTrigger content={player.equippedEcho?.id === echo.id ? "Ya equipado" : "Vincular Alma"}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onEquip(echo); }}
                                                    disabled={player.equippedEcho?.id === echo.id}
                                                    className="p-2 rounded-full bg-slate-800 hover:bg-gold-500 hover:text-black text-slate-200 transition-colors shadow-lg"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipTrigger content="Sacrificar (+Polvo)">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onBurn(echo); }}
                                                    className="p-2 rounded-full bg-slate-800 hover:bg-red-500 hover:text-white text-slate-200 transition-colors shadow-lg"
                                                >
                                                    <Flame className="w-4 h-4" />
                                                </button>
                                            </TooltipTrigger>
                                        </div>
                                    </div>
                                    
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-0.5">{echo.rarity}</div>
                                        <div className="text-xs font-bold text-slate-200 truncate leading-tight">{echo.name}</div>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {Object.entries(echo.stats).map(([k, v]) => (
                                                <span key={k} className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-cyan-300 font-mono">
                                                    {k.substring(0,3)} +{v}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {player.equippedEcho?.id === echo.id && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-gold-500 rounded-full shadow-[0_0_5px_#eab308] animate-pulse"></div>
                                    )}
                               </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* 3. SCROLLABLE RESULTS OVERLAY (Mobile Friendly) */}
      {summonResults && (
          <div className="fixed inset-0 z-[100] bg-[#020617] animate-fade-in overflow-y-auto">
              {/* Fixed Background Layer */}
              <div className="fixed inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950/80 to-slate-950"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse-slow"></div>
              </div>

              {/* Scrollable Content Container */}
              <div className="relative z-10 min-h-full flex flex-col items-center py-12 px-4 pb-32">
                  <h2 className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-300 mb-2 animate-slide-up text-center drop-shadow-lg">
                      Ritual Completado
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-10 opacity-80"></div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-6xl">
                      {summonResults.map((echo, idx) => (
                          <div 
                            key={idx} 
                            className={`
                                relative rounded-2xl overflow-hidden border p-4 flex flex-col gap-4 animate-scale-in bg-slate-900/80 backdrop-blur-sm shadow-2xl
                                ${getRarityColor(echo.rarity)}
                            `}
                            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'backwards' }}
                          >
                              {/* Rarity Flare */}
                              <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 blur-xl rounded-full pointer-events-none"></div>

                              <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-inner border border-white/5">
                                  <img src={echo.image} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                  <div className="absolute bottom-2 left-0 w-full text-center">
                                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 ${echo.rarity === 'Ascendido' ? 'text-orange-400' : 'text-slate-300'}`}>
                                          {echo.rarity}
                                      </span>
                                  </div>
                              </div>
                              
                              <div className="text-center">
                                  <div className="font-serif font-bold text-lg text-white leading-tight mb-2">{echo.name}</div>
                                  <div className="flex flex-wrap justify-center gap-2">
                                      {Object.entries(echo.stats).map(([k, v]) => (
                                          <span key={k} className="bg-black/40 px-2 py-1 rounded text-xs font-mono text-cyan-300 border border-white/5">
                                              {k.substring(0,3)} +{v}
                                          </span>
                                      ))}
                                  </div>
                                  {echo.passiveEffect && (
                                      <p className="mt-3 text-[10px] text-slate-400 italic px-2 border-t border-white/5 pt-2">
                                          "{echo.passiveEffect}"
                                      </p>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="mt-12 md:mt-16">
                      <button 
                        onClick={() => setSummonResults(null)}
                        className="px-12 py-4 bg-white hover:bg-slate-200 text-black font-serif font-bold uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95"
                      >
                          Aceptar Destino
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
