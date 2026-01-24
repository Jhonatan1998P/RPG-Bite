
import React, { useState, useEffect } from 'react';
import { Player, Quest, StatType, QuestRarity } from '../../types';
import { generateQuestNarrativesBatch } from '../../services/geminiService';
import { generateProceduralQuest, calculateQuestSuccessChance } from '../../utils/gameEngine';
import { Timer, Loader2, Coins, Zap, MapPin, Sword, Wind, Brain, Shield, RefreshCw, Skull, Sparkles, AlertTriangle, Clock, Gem, ChevronRight } from 'lucide-react';
import { eventBus, EventTypes } from '../../services/eventBus';
import { TooltipTrigger } from '../UI/TooltipTrigger';
import { ViewHeader } from '../Layout/ViewHeader';
import { GameCard } from '../UI/GameCard';

interface TavernViewProps {
  player: Player;
  onAcceptQuest: (quest: Quest) => Promise<string>;
  onDeductGold: (amount: number) => boolean;
  onRefreshTavern: () => void;
  onUpdateQuests: (quests: Quest[]) => void;
  onUseRuby: (type: 'ENERGY' | 'ARENA' | 'TAVERN') => boolean;
  onRefreshSingleQuest: (questId: string) => boolean;
}

// Helper para imágenes atmosféricas
const getQuestImage = (title: string): string => {
    const lower = title.toLowerCase();
    if (lower.includes('bosque') || lower.includes('selva')) return 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=600&auto=format&fit=crop';
    if (lower.includes('cripta') || lower.includes('tumba') || lower.includes('cementerio')) return 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?q=80&w=600&auto=format&fit=crop';
    if (lower.includes('castillo') || lower.includes('torre') || lower.includes('reino')) return 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=600&auto=format&fit=crop';
    if (lower.includes('caverna') || lower.includes('mina') || lower.includes('profundo')) return 'https://images.unsplash.com/photo-1516934024742-b461fba47600?q=80&w=600&auto=format&fit=crop';
    if (lower.includes('hielo') || lower.includes('nieve') || lower.includes('invernal')) return 'https://images.unsplash.com/photo-1518182170546-0766ce6fec56?q=80&w=600&auto=format&fit=crop';
    if (lower.includes('fuego') || lower.includes('ardiente') || lower.includes('volcán')) return 'https://images.unsplash.com/photo-1622368735515-3882f05eb7fe?q=80&w=600&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=600&auto=format&fit=crop';
};

export const TavernView: React.FC<TavernViewProps> = ({ player, onAcceptQuest, onDeductGold, onRefreshTavern, onUpdateQuests, onUseRuby, onRefreshSingleQuest }) => {
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [questResult, setQuestResult] = useState<{success: boolean, text: string} | null>(null);
  const [isLoadingQuests, setIsLoadingQuests] = useState(false);
  const [questProgress, setQuestProgress] = useState(0);
  const [questLog, setQuestLog] = useState<string[]>([]);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [refreshTimeLeft, setRefreshTimeLeft] = useState<string>('');
  const [canFreeRefresh, setCanFreeRefresh] = useState(true);

  const generateQuests = async (count: number) => {
    setIsLoadingQuests(true);
    const newQuests: Quest[] = [];
    for (let i = 0; i < count; i++) {
        newQuests.push(generateProceduralQuest(player, i));
    }
    onUpdateQuests(newQuests);
    try {
        const simpleQuestList = newQuests.map(q => ({ title: q.title, rarity: q.rarity }));
        const descriptions = await generateQuestNarrativesBatch(simpleQuestList, player.level);
        const updatedQuests = newQuests.map((q, index) => ({
            ...q,
            description: descriptions[index] || q.description
        }));
        onUpdateQuests(updatedQuests);
    } catch (e) {
        console.error("Failed to batch generate descriptions", e);
    } finally {
        setIsLoadingQuests(false);
    }
  };

  useEffect(() => {
    if (player.currentQuests.length === 0) {
        generateQuests(3);
        if (Date.now() > player.nextTavernRefresh) {
             onRefreshTavern();
        }
    }
  }, []);

  useEffect(() => {
      const updateTimer = () => {
          const now = Date.now();
          if (now < player.nextTavernRefresh) {
              setCanFreeRefresh(false);
              const diff = player.nextTavernRefresh - now;
              const minutes = Math.floor((diff / 1000 / 60) % 60);
              const seconds = Math.floor((diff / 1000) % 60);
              setRefreshTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
          } else {
              setCanFreeRefresh(true);
              setRefreshTimeLeft('');
          }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
  }, [player.nextTavernRefresh]);

  const handleRefreshBoard = () => {
      if (canFreeRefresh) {
          onUpdateQuests([]); 
          onRefreshTavern(); 
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Nuevos contratos han llegado.", type: 'success' });
      } else {
          const cost = 1;
          if (onUseRuby('TAVERN')) {
             onUpdateQuests([]);
          }
      }
  };

  const startQuest = (quest: Quest) => {
    if (player.energy < quest.energyCost) return;
    setActiveQuest(quest);
    setShowActiveModal(true);
    setQuestProgress(0);
    setQuestLog([`Inicias el viaje hacia ${quest.title}...`]);
  };

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (activeQuest && showActiveModal) {
          const tickRate = 100;
          const totalTicks = (activeQuest.duration * 1000) / tickRate;
          let currentTicks = 0;
          const flavorEvents = ["Rastreando huellas...", "Evitando patrullas...", "Descifrando runas...", "Preparando emboscada...", "Vendando heridas...", "El objetivo está cerca...", "Desenvainando acero...", "¡Peligro detectado!", "Explorando las sombras..."];

          interval = setInterval(async () => {
              currentTicks++;
              const progress = (currentTicks / totalTicks) * 100;
              setQuestProgress(progress);
              if (currentTicks % 15 === 0 && Math.random() > 0.4) {
                  const event = flavorEvents[Math.floor(Math.random() * flavorEvents.length)];
                  setQuestLog(prev => [...prev.slice(-4), event]);
              }
              if (currentTicks >= totalTicks) {
                  clearInterval(interval);
                  const resultText = await onAcceptQuest(activeQuest);
                  setQuestResult({ success: true, text: resultText }); 
                  setShowActiveModal(false);
                  onUpdateQuests(player.currentQuests.filter(q => q.id !== activeQuest.id));
                  setActiveQuest(null);
              }
          }, tickRate);
      }
      return () => clearInterval(interval);
  }, [activeQuest, showActiveModal]);

  const getStatIcon = (stat: StatType) => {
      switch(stat) {
          case StatType.STRENGTH: return <Sword className="w-3 h-3" />;
          case StatType.DEXTERITY: return <Wind className="w-3 h-3" />;
          case StatType.INTELLIGENCE: return <Brain className="w-3 h-3" />;
          default: return <Shield className="w-3 h-3" />;
      }
  };

  // --- RENDERING ---

  if (showActiveModal && activeQuest) {
      return (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 animate-fade-in bg-black/80 backdrop-blur-sm">
              <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden border border-gold-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-0">
                      <img src={getQuestImage(activeQuest.title)} className="w-full h-full object-cover opacity-30" alt="Background" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/80"></div>
                  </div>
                  <div className="relative z-10 p-8 flex flex-col gap-6">
                      <div className="text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-900/30 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-widest mb-4 animate-pulse">
                              <Sparkles className="w-3 h-3" /> Misión en Curso
                          </div>
                          <h2 className="font-serif text-3xl md:text-4xl text-white font-bold text-shadow-lg mb-2">{activeQuest.title}</h2>
                          <div className="flex justify-center gap-4 text-xs font-mono text-slate-400">
                                <span>{activeQuest.difficulty}</span>
                                <span>•</span>
                                <span>{activeQuest.duration} segundos estimados</span>
                          </div>
                      </div>
                      <div className="relative h-40 bg-black/50 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center group">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-950 to-black opacity-50"></div>
                            <div className="relative z-10">
                                <div className="absolute inset-0 bg-gold-500 blur-2xl opacity-20 animate-pulse"></div>
                                <Loader2 className="w-12 h-12 text-gold-500 animate-spin relative z-10" />
                            </div>
                            <div className="absolute bottom-3 left-0 w-full text-center px-4">
                                <p className="text-sm font-serif italic text-slate-200 text-shadow-md animate-fade-in-up">{questLog[questLog.length - 1]}</p>
                            </div>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gold-500 font-bold uppercase tracking-wider">
                              <span>Progreso</span>
                              <span>{Math.round(questProgress)}%</span>
                          </div>
                          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10 relative">
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                              <div className="h-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-300 shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-100 ease-linear relative" style={{ width: `${questProgress}%` }}>
                                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]"></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  if (questResult) {
      return (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 animate-fade-in bg-black/90 backdrop-blur-md">
              <div className="glass-panel p-1 rounded-2xl max-w-lg w-full shadow-[0_0_60px_rgba(0,0,0,0.7)] animate-scale-in">
                <div className="bg-slate-900/95 p-8 rounded-xl text-center relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${questResult.success ? 'from-transparent via-gold-500 to-transparent' : 'from-transparent via-red-500 to-transparent'}`}></div>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 ${questResult.success ? 'border-gold-500 bg-gold-900/20' : 'border-red-500 bg-red-900/20'}`}>
                        {questResult.success ? <Sparkles className="w-8 h-8 text-gold-500" /> : <Skull className="w-8 h-8 text-red-500" />}
                    </div>
                    <h2 className={`font-serif text-3xl mb-6 tracking-widest uppercase ${questResult.success ? 'text-gold-400' : 'text-red-400'}`}>
                        {questResult.success ? 'Misión Cumplida' : 'Fracaso'}
                    </h2>
                    <div className="bg-black/40 p-6 rounded-xl border border-white/5 mb-8">
                        <p className="text-slate-300 text-lg leading-relaxed italic font-serif">"{questResult.text}"</p>
                    </div>
                    <button onClick={() => setQuestResult(null)} className="w-full px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold font-serif rounded-xl transition-all border border-white/10 uppercase tracking-wider">
                        Continuar
                    </button>
                </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-6">
      
      {/* 1. REFACTORED HEADER */}
      <ViewHeader 
        title="La Jarra Dorada"
        imageSrc="https://picsum.photos/200/200?grayscale&blur=2"
        backgroundImage="https://images.unsplash.com/photo-1576020799632-6a7f9f252a12?q=80&w=1200&auto=format&fit=crop"
        subtitle={
            <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                 <p className="italic opacity-80 max-w-md">"Los contratos cuelgan del tablón. La paga es buena, si sobrevives."</p>
                 <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/10">
                    <MapPin className="w-3 h-3 text-gold-500" />
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-300">Distrito Bajo</span>
                </div>
            </div>
        }
      >
          {/* Header Actions (Right Side) */}
            <div className="bg-black/60 p-3 rounded-xl border border-white/10 flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                         <span className="text-xs text-blue-400 uppercase font-bold tracking-wider flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Energía
                         </span>
                         <TooltipTrigger content="Tu energía actual. Necesaria para aceptar misiones. Se recarga 1 punto por minuto.">
                            <span className="font-mono text-white font-bold cursor-help">{player.energy}/{player.maxEnergy}</span>
                         </TooltipTrigger>
                     </div>
                     {player.energy < 20 && (
                         <TooltipTrigger content="Gasta 1 Rubí para rellenar toda tu energía instantáneamente.">
                             <button 
                                onClick={() => onUseRuby('ENERGY')}
                                className="w-full text-[10px] bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-500/30 rounded px-2 py-1 flex items-center justify-center gap-1 transition-colors"
                             >
                                <Gem className="w-3 h-3" /> Recargar (1 Rubí)
                             </button>
                         </TooltipTrigger>
                     )}
            </div>
            <TooltipTrigger content={canFreeRefresh ? "Obtén nuevas misiones gratis. Disponible cada 5 minutos." : "Paga 1 Rubí para obtener nuevas misiones inmediatamente."}>
                <button 
                    onClick={handleRefreshBoard}
                    disabled={isLoadingQuests}
                    className={`
                        w-full py-2.5 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all
                        ${isLoadingQuests 
                            ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-wait'
                            : canFreeRefresh 
                                ? 'bg-green-600/10 hover:bg-green-600/20 border-green-500/30 text-green-400 hover:text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                                : 'bg-red-900/40 hover:bg-red-800/60 border-red-500/30 text-red-300 hover:text-red-200'
                        }
                    `}
                >
                    {isLoadingQuests ? (
                        <> <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando... </>
                    ) : canFreeRefresh ? (
                        <> <Sparkles className="w-3.5 h-3.5" /> Nuevos Contratos </>
                    ) : (
                        <> <RefreshCw className="w-3.5 h-3.5" /> Sobornar (1 <Gem className="w-3 h-3"/>) </>
                    )}
                </button>
            </TooltipTrigger>
            {!canFreeRefresh && !isLoadingQuests && (
                <div className="text-[10px] text-center text-slate-500 font-mono flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Gratis en: {refreshTimeLeft}
                </div>
            )}
      </ViewHeader>

      {/* 2. REFACTORED QUEST GRID USING GAMECARD */}
      <div>
        {player.currentQuests.length === 0 && !isLoadingQuests ? (
            <div className="glass-panel p-10 text-center flex flex-col items-center justify-center h-64 border border-white/5 bg-slate-900/50 rounded-3xl">
                <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4 opacity-50" />
                <p className="text-slate-500 font-serif text-lg animate-pulse">El escriba está redactando nuevos contratos...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {player.currentQuests.map((quest) => {
                    const successChance = calculateQuestSuccessChance(quest, player);
                    const isRisky = successChance < 0.6;
                    const isMortal = quest.difficulty === 'Mortal';

                    return (
                        <GameCard 
                            key={quest.id}
                            rarity={quest.rarity}
                            backgroundImage={getQuestImage(quest.title)}
                            className="h-[400px]"
                        >
                            {/* Refresh Single Quest Button (Overlay) */}
                             <div className="absolute top-2 right-2 z-30">
                                <TooltipTrigger content="Cambiar solo esta misión (Cuesta 1 Rubí)">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRefreshSingleQuest(quest.id);
                                        }}
                                        className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors border border-white/10"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                    </button>
                                </TooltipTrigger>
                            </div>

                            {/* Difficulty Badge (Overlay) */}
                            <div className="absolute top-10 left-0 z-20 flex gap-2 px-4">
                                <div className="px-2 py-1 rounded bg-black/60 backdrop-blur border border-white/10 text-[9px] font-bold uppercase tracking-wider text-slate-300">
                                    {quest.difficulty}
                                </div>
                                {isMortal && (
                                    <div className="px-2 py-1 rounded bg-red-900/60 backdrop-blur border border-red-500/30 text-[9px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1 animate-pulse">
                                        <Skull className="w-3 h-3" /> Mortal
                                    </div>
                                )}
                            </div>

                            {/* Rarity Label (Overlay) */}
                            <div className="absolute top-0 left-0 z-20">
                                <div className="px-4 py-1.5 rounded-br-xl border-r border-b border-white/10 bg-slate-950/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest shadow-lg text-slate-300">
                                    {quest.rarity}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="relative z-10 flex flex-col h-full p-6 mt-auto">
                                <div className="mt-auto">
                                    <h3 className="font-serif text-2xl font-bold text-white leading-tight mb-2 group-hover:text-gold-400 transition-colors drop-shadow-md pr-8">
                                        {quest.title}
                                    </h3>
                                    
                                    <p className="text-slate-400 text-xs italic line-clamp-2 mb-4 leading-relaxed border-l-2 border-white/10 pl-3">
                                        "{quest.description === "Cargando descripción..." ? <span className="animate-pulse">Descifrando pergamino...</span> : quest.description}"
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="bg-black/40 rounded-xl p-3 border border-white/10 backdrop-blur-sm grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                                        
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Recompensa</span>
                                            <div className="flex items-center gap-3">
                                                <TooltipTrigger content="Ganancia de Oro">
                                                    <div className="flex items-center gap-1 text-gold-400 font-mono text-sm font-bold cursor-help">
                                                        <Coins className="w-3 h-3" /> {quest.goldReward}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipTrigger content="Ganancia de Experiencia">
                                                    <div className="flex items-center gap-1 text-purple-400 font-mono text-sm font-bold cursor-help">
                                                        <span className="text-[10px]">XP</span> {quest.xpReward}
                                                    </div>
                                                </TooltipTrigger>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                             <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Coste</span>
                                             <TooltipTrigger content={`Esta misión consume ${quest.energyCost} puntos de energía y toma ${quest.duration} segundos.`}>
                                                 <div className="flex items-center gap-2 text-sm font-mono text-slate-300 cursor-help">
                                                    <Timer className="w-3 h-3 text-slate-500" /> {quest.duration}s
                                                    <span className="text-blue-400 flex items-center gap-1"><Zap className="w-3 h-3" /> {quest.energyCost}</span>
                                                 </div>
                                             </TooltipTrigger>
                                        </div>

                                        <div className="col-span-2 h-px bg-white/10"></div>

                                        <div className="flex items-center justify-between col-span-2">
                                            <div className="flex items-center gap-2">
                                                <span className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
                                                    {getStatIcon(quest.recommendedStat)}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-slate-500 uppercase font-bold">Requisito</span>
                                                    <TooltipTrigger content={`Tu estadística de ${quest.recommendedStat} influye en el éxito.`}>
                                                        <span className="text-[10px] text-slate-300 uppercase cursor-help border-b border-dashed border-slate-600">{quest.recommendedStat}</span>
                                                    </TooltipTrigger>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                 <TooltipTrigger content="Probabilidad de éxito basada en tus estadísticas. Si fallas, perderás salud.">
                                                     <span className={`text-sm font-bold font-mono cursor-help ${successChance > 0.8 ? 'text-green-400' : successChance > 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                        {Math.floor(successChance * 100)}%
                                                     </span>
                                                 </TooltipTrigger>
                                                 <span className="text-[9px] block text-slate-500 uppercase">Probabilidad</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        onClick={() => startQuest(quest)}
                                        disabled={player.energy < quest.energyCost}
                                        className={`
                                            w-full py-3.5 rounded-xl font-serif font-bold uppercase tracking-[0.15em] text-xs transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden
                                            ${player.energy < quest.energyCost 
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                                                : `bg-gradient-to-r from-slate-200 to-slate-400 hover:from-white hover:to-slate-200 text-black shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95`
                                            }
                                        `}
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {isRisky && <AlertTriangle className="w-3 h-3 text-red-600" />}
                                            Firmar Contrato
                                            <ChevronRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </GameCard>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};
