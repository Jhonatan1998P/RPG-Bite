
import React, { useState } from 'react';
import { Player, ArenaOpponent } from '../../types';
import { getLeagueInfo } from '../../utils/gameEngine';
import { Crown, TrendingUp, User, Sword, Shield, Skull, Wifi, Coins, Send, X, Users } from 'lucide-react';
import { TooltipTrigger } from '../UI/TooltipTrigger';

interface RankingsViewProps {
  player: Player;
  ladder: ArenaOpponent[];
  remotePlayers?: { id: string; name: string; level: number }[];
  onSendGold?: (playerId: string, amount: number) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({ player, ladder, remotePlayers = [], onSendGold }) => {
  const currentLeague = getLeagueInfo(player.arenaLeague);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; level: number } | null>(null);
  const [goldAmount, setGoldAmount] = useState(100);

  const handleSendGold = () => {
    if (selectedPlayer && onSendGold && goldAmount > 0) {
      onSendGold(selectedPlayer.id, goldAmount);
      setSelectedPlayer(null);
      setGoldAmount(100);
    }
  };

  const handleClickRemotePlayer = (remote: { id: string; name: string; level: number }) => {
    if (onSendGold) {
      setSelectedPlayer(remote);
    }
  };

  const renderRow = (rank: number) => {
      const isPlayer = player.arenaRank === rank;
      const bot = ladder.find(b => b.arenaRank === rank);
      
      if (!bot && !isPlayer) return null;

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
        {/* Modal para enviar oro */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-green-500/30 rounded-lg p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif text-green-400">Enviar Oro</h3>
                <button onClick={() => setSelectedPlayer(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-slate-300 mb-4">
                Enviar oro a <span className="text-green-400 font-bold">{selectedPlayer.name}</span> (Nv. {selectedPlayer.level})
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  min={1}
                  max={player.gold}
                  value={goldAmount}
                  onChange={(e) => setGoldAmount(Math.max(1, Math.min(player.gold, parseInt(e.target.value) || 1)))}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                />
                <div className="flex items-center gap-2 bg-slate-800 px-4 rounded border border-slate-700">
                  <Coins className="w-4 h-4 text-gold-500" />
                  <span className="text-gold-400 font-mono">{goldAmount}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4">Tienes: {player.gold} oro</p>

              <button
                onClick={handleSendGold}
                disabled={goldAmount <= 0 || goldAmount > player.gold}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font rounded transition-colors-bold py-3"
              >
                <Send className="w-4 h-4" />
                Enviar Oro
              </button>
            </div>
          </div>
        )}

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

        {/* Sección de Jugadores Online en la Sala */}
        {remotePlayers.length > 0 && (
          <div className="bg-green-900/20 rounded-2xl border border-green-500/30 overflow-hidden">
            <div className="p-4 border-b border-green-500/20 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-400" />
              <h3 className="text-green-400 font-serif">Jugadores en la Sala ({remotePlayers.length})</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {remotePlayers.map((remote) => (
                <button
                  key={remote.id}
                  onClick={() => handleClickRemotePlayer(remote)}
                  className="flex items-center gap-3 p-3 bg-green-900/30 rounded-lg border border-green-500/20 hover:bg-green-900/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold">{remote.name}</span>
                      <span className="text-green-500 text-xs animate-pulse">● Online</span>
                    </div>
                    <span className="text-green-500/70 text-sm">Nv. {remote.level}</span>
                  </div>
                  <Send className="w-4 h-4 text-green-500" />
                </button>
              ))}
            </div>
          </div>
        )}

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
