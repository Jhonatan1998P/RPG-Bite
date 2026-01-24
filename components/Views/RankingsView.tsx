
import React from 'react';
import { Player, ArenaOpponent } from '../../types';
import { getLeagueInfo } from '../../utils/gameEngine';
import { Crown, TrendingUp, User, Sword, Shield, Skull } from 'lucide-react';
import { TooltipTrigger } from '../UI/TooltipTrigger';

interface RankingsViewProps {
  player: Player;
  ladder: ArenaOpponent[];
}

export const RankingsView: React.FC<RankingsViewProps> = ({ player, ladder }) => {
  const currentLeague = getLeagueInfo(player.arenaLeague);

  // Merge player into ladder visualization if they aren't explicitly in the bot list (which they aren't, they swap positions)
  // Logic: We display the ladder. If a bot has rank X and player has rank X, we show the player INSTEAD of the bot (conceptually the bot is gone or swapped).
  // Actually, since we swap ranks in the engine, the player holds a rank that a bot held.
  // We need to render the slots 1-50.
  
  const renderRow = (rank: number) => {
      const isPlayer = player.arenaRank === rank;
      const bot = ladder.find(b => b.arenaRank === rank);
      
      if (!bot && !isPlayer) return null; // Should not happen if ladder is full

      const name = isPlayer ? player.name : bot?.name;
      const level = isPlayer ? player.level : bot?.level;
      const hp = isPlayer ? player.maxHp : bot?.maxHp;
      const archetype = isPlayer ? 'Héroe' : bot?.classArchetype;
      
      const isTop3 = rank <= 3;

      return (
          <div 
            key={rank} 
            className={`
                flex items-center gap-4 p-3 rounded-xl border transition-all
                ${isPlayer 
                    ? 'bg-gold-900/20 border-gold-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)] z-10 scale-[1.02]' 
                    : 'bg-slate-900/30 border-white/5 hover:bg-slate-800/50'
                }
            `}
          >
              <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-lg shrink-0
                  ${isTop3 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-lg' 
                      : isPlayer 
                        ? 'bg-gold-600 text-black'
                        : 'bg-slate-800 text-slate-500'
                  }
              `}>
                  {rank}
              </div>

              <div className="flex-grow min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="flex items-center gap-2 md:w-1/3">
                      {isPlayer && <User className="w-3 h-3 text-gold-500" />}
                      <span className={`font-bold truncate ${isPlayer ? 'text-gold-400' : 'text-slate-300'}`}>{name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 md:flex-grow">
                      <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded">
                         LVL {level}
                      </span>
                      <span className="hidden md:flex items-center gap-1">
                          {archetype}
                      </span>
                  </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="flex flex-col items-end text-slate-400">
                      <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" /> {hp} HP
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20 md:pb-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between bg-slate-900/40">
            <div>
                <h2 className="font-serif text-2xl md:text-3xl text-slate-200 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-gold-500" /> Clasificación
                </h2>
                <TooltipTrigger content={`Liga ${currentLeague.name}. Gana combates para ascender en la clasificación.`}>
                    <p className="text-slate-500 text-sm cursor-help">Liga {currentLeague.name}</p>
                </TooltipTrigger>
            </div>
            <div className="text-right hidden md:block">
                <p className="text-xs text-slate-500 uppercase font-bold">Tu Posición</p>
                <p className="text-3xl font-mono font-bold text-gold-400">#{player.arenaRank}</p>
            </div>
        </div>

        <div className="bg-slate-950/30 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-3 bg-black/20 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between px-6">
                <span>Rango</span>
                <span>Gladiador</span>
                <span>Poder</span>
            </div>
            
            <div className="p-4 space-y-2">
                {Array.from({ length: 50 }, (_, i) => i + 1).map(rank => renderRow(rank))}
            </div>
        </div>
    </div>
  );
};
