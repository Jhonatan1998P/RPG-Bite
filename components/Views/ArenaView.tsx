
import React, { useState, useEffect } from 'react';
import { Player, ArenaOpponent } from '../../types';
import { getLeagueInfo, getChallengers, calculateWinChance } from '../../utils/gameEngine';
import { Swords, ShieldAlert, Clock, Sword, Coins, Crown, Gem, TrendingUp, Skull, Shield, Brain, Wind, ChevronRight } from 'lucide-react';
import { TooltipTrigger } from '../UI/TooltipTrigger';
import { ViewHeader } from '../Layout/ViewHeader';
import { GameCard } from '../UI/GameCard';

interface ArenaViewProps {
  player: Player;
  ladder: ArenaOpponent[];
  onStartBattle: (opponent: ArenaOpponent) => void;
  isInitializing?: boolean;
  onUseRuby: (type: 'ENERGY' | 'ARENA' | 'TAVERN') => boolean;
}

// --- SUBCOMPONENT: Opponent Card (SRP & Optimization) ---
const OpponentCard: React.FC<{ 
    opponent: ArenaOpponent; 
    player: Player; 
    disabled: boolean; 
    onClick: () => void; 
}> = ({ opponent, player, disabled, onClick }) => {
    
    const winChance = calculateWinChance(player, opponent);
    const percentage = Math.round(winChance * 100);
    
    // Visual Cues
    const isHard = winChance < 0.4;
    const isEasy = winChance > 0.7;
    const difficultyColor = isEasy ? 'text-green-400' : isHard ? 'text-red-400' : 'text-yellow-400';
    const barColor = isEasy ? 'bg-green-500' : isHard ? 'bg-red-500' : 'bg-yellow-500';

    // Icon Archetype
    const getArchetypeIcon = (arch?: string) => {
        switch(arch) {
            case 'Acechador': return <Wind className="w-3 h-3" />;
            case 'Brujo': return <Brain className="w-3 h-3" />;
            case 'Guardia': return <Shield className="w-3 h-3" />;
            default: return <Sword className="w-3 h-3" />;
        }
    };

    return (
        <GameCard
            disabled={disabled}
            onClick={onClick}
            className="min-h-[120px] md:min-h-[320px] transition-all"
            // Layout Switch: Row on Mobile, Col on Desktop
            contentClassName="flex-row md:flex-col"
            isInteractive
        >
            {/* Rank Badge (Absolute) */}
            <div className="absolute top-0 left-0 md:right-0 md:left-auto z-30">
                <div className="bg-black/80 backdrop-blur border-r md:border-r-0 md:border-l border-b border-white/10 px-2 py-1 rounded-br-lg md:rounded-bl-lg text-[10px] font-bold text-white shadow-lg">
                    #{opponent.arenaRank}
                </div>
            </div>

            {/* --- IMAGE SECTION --- */}
            <div className="w-[110px] md:w-full md:h-40 shrink-0 relative overflow-hidden bg-slate-950 border-r md:border-r-0 md:border-b border-white/5">
                <img 
                    src={`https://picsum.photos/300/300?grayscale&seed=${opponent.name}`} 
                    alt="Enemy" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                />
                
                {/* Level Badge (Over Image on Mobile) */}
                <div className="absolute bottom-0 right-0 p-1 md:hidden">
                    <span className="bg-slate-900/90 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                        NVL {opponent.level}
                    </span>
                </div>

                {/* Desktop Difficulty Bar */}
                <div className={`hidden md:block absolute bottom-0 left-0 w-full h-1 ${barColor} shadow-[0_0_10px_currentColor]`}></div>
            </div>

            {/* --- INFO SECTION --- */}
            <div className="flex flex-col flex-grow p-3 relative overflow-hidden">
                {/* Mobile Difficulty Bar (Side) */}
                <div className={`md:hidden absolute top-0 bottom-0 left-0 w-1 ${barColor} opacity-50`}></div>

                {/* Header */}
                <div className="mb-1 pl-2 md:pl-0">
                    <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-slate-200 text-sm md:text-lg leading-tight group-hover:text-gold-300 transition-colors line-clamp-2 md:line-clamp-1">
                            {opponent.name}
                        </h4>
                        <span className="hidden md:block bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/5">
                            NVL {opponent.level}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-[10px] md:text-xs uppercase tracking-wider font-medium">
                        {getArchetypeIcon(opponent.classArchetype)}
                        <span>{opponent.classArchetype}</span>
                    </div>
                </div>

                {/* Stats & Loot Grid */}
                <div className="mt-auto pl-2 md:pl-0 pt-2 border-t border-white/5 grid grid-cols-2 gap-2 items-end">
                    
                    {/* Reward */}
                    <div className="flex flex-col">
                        <span className="text-[8px] md:text-[9px] text-slate-600 uppercase font-bold tracking-wider">Recompensa</span>
                        <div className="flex items-center gap-1.5 text-gold-400 font-mono font-bold text-xs md:text-sm">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{opponent.goldReward}</span>
                        </div>
                    </div>

                    {/* Win Chance */}
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] md:text-[9px] text-slate-600 uppercase font-bold tracking-wider">Victoria</span>
                        <TooltipTrigger content={`Probabilidad estimada: ${percentage}%. ${isHard ? 'Riesgo alto.' : 'Combate favorable.'}`}>
                            <div className={`flex items-center gap-1.5 font-mono font-bold text-xs md:text-sm ${difficultyColor}`}>
                                {percentage}%
                                {isHard ? <Skull className="w-3.5 h-3.5" /> : <Sword className="w-3.5 h-3.5" />}
                            </div>
                        </TooltipTrigger>
                    </div>
                </div>

                {/* CTA Overlay (Visual only, works on hover/active) */}
                <div className="absolute right-2 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 md:hidden transition-opacity">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
            </div>
        </GameCard>
    );
};

export const ArenaView: React.FC<ArenaViewProps> = ({ player, ladder, onStartBattle, isInitializing = false, onUseRuby }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const currentLeague = getLeagueInfo(player.arenaLeague);
  const challengers = getChallengers(ladder, player.arenaRank);

  useEffect(() => {
    const updateTimer = () => {
        const now = Date.now();
        if (player.nextArenaBattle > now) {
            setIsOnCooldown(true);
            const diff = player.nextArenaBattle - now;
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        } else {
            setIsOnCooldown(false);
            setTimeLeft('');
        }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [player.nextArenaBattle]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-20 md:pb-6">
      
      {/* 1. HEADER */}
      <ViewHeader 
        title={currentLeague.name}
        icon={<Crown className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md" />}
        backgroundImage="" 
        className={`${currentLeague.bgGradient}`}
        subtitle={
            <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="text-[10px] md:text-xs text-slate-300 uppercase tracking-[0.2em] font-bold opacity-80">Liga Actual</h4>
                </div>
                <div className="flex items-center gap-3 mt-2">
                    <TooltipTrigger content="Tu posición en la clasificación actual. Llega al rango #1 para ascender de liga.">
                        <div className="bg-black/40 px-2 py-0.5 rounded text-[10px] md:text-xs font-mono text-white border border-white/10 flex items-center gap-1.5 cursor-help">
                            <TrendingUp className="w-3 h-3 text-gold-500" />
                            <span>Rango <span className="text-gold-400 font-bold">#{player.arenaRank}</span></span>
                        </div>
                    </TooltipTrigger>
                </div>
            </div>
        }
      >
           <div className="bg-black/20 border-t md:border-t-0 md:border-l border-white/5 p-3 md:w-48 flex md:flex-col items-center md:justify-center justify-between gap-2 backdrop-blur-sm">
                   <TooltipTrigger content="Multiplicador de oro obtenido por victoria en esta liga.">
                       <div className="flex flex-col items-center justify-center flex-1 cursor-help">
                            <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Botín</span>
                            <span className="text-sm md:text-lg font-mono font-bold text-gold-400">x{currentLeague.rewardsMult}</span>
                       </div>
                   </TooltipTrigger>
                   <div className="w-px h-6 md:w-8 md:h-px bg-white/10"></div>
                   <TooltipTrigger content="Número total de oponentes en tu grupo de liga.">
                       <div className="flex flex-col items-center justify-center flex-1 cursor-help">
                            <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Rivales</span>
                            <span className="text-sm md:text-lg font-mono font-bold text-slate-300">50</span>
                       </div>
                   </TooltipTrigger>
            </div>
      </ViewHeader>

      {/* 2. ACTION BAR */}
      <div className="shrink-0 flex items-center justify-between px-1 bg-slate-900/50 p-2 rounded-xl border border-white/5">
          <h3 className="font-serif text-sm md:text-lg text-slate-200 flex items-center gap-2 pl-2">
              <Swords className="w-4 h-4 md:w-5 md:h-5 text-red-500" /> 
              <span>Rivales Disponibles</span>
          </h3>

          {isOnCooldown ? (
             <div className="flex items-center gap-2">
                 <TooltipTrigger content="Tiempo restante para descansar antes del próximo combate.">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-700 text-slate-400 text-xs font-mono cursor-wait shadow-inner">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-red-400" /> 
                        <span>{timeLeft}</span>
                    </div>
                </TooltipTrigger>
                <TooltipTrigger content="Gasta 1 Rubí para combatir inmediatamente sin esperar.">
                    <button 
                        onClick={() => onUseRuby('ARENA')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/40 hover:bg-red-800/60 border border-red-500/30 rounded-lg text-red-300 text-xs transition-colors font-bold uppercase tracking-wider"
                    >
                        <Gem className="w-3 h-3" /> <span className="hidden md:inline">Reiniciar</span>
                    </button>
                </TooltipTrigger>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 rounded-lg border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                Listo
            </div>
          )}
      </div>

      {/* 3. CHALLENGERS GRID */}
      <div>
          {challengers.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center p-12 bg-slate-900/30 rounded-xl border border-dashed border-white/10 animate-fade-in">
                   <Crown className="w-16 h-16 text-gold-500 mb-6 animate-bounce shadow-gold-glow" />
                   <h3 className="text-2xl font-serif text-gold-400 mb-2">¡Eres el Campeón!</h3>
                   <p className="text-slate-400 text-sm max-w-md text-center leading-relaxed">
                       Has derrotado a todos tus rivales directos. Mantén tu posición o prepárate para ascender a la siguiente liga.
                   </p>
               </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pb-4">
                {challengers.map((opp) => (
                    <OpponentCard
                        key={opp.id}
                        opponent={opp}
                        player={player}
                        disabled={isOnCooldown || isInitializing || player.hp < 20}
                        onClick={() => onStartBattle(opp)}
                    />
                ))}
            </div>
          )}
      </div>

      {/* 4. FOOTER ALERT */}
      {player.hp < 20 && (
          <div className="shrink-0 flex items-center justify-center gap-3 text-red-300 text-xs md:text-sm bg-red-950/90 backdrop-blur-md px-4 py-3 rounded-xl border border-red-500/30 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)] mx-1 mb-1">
              <ShieldAlert className="w-5 h-5" /> 
              <span className="font-bold tracking-wider uppercase">Salud Crítica - Sana tus heridas</span>
          </div>
      )}
    </div>
  );
};
