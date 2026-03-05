
import React, { useState, useEffect, useRef } from 'react';
import { Player, BattleLog, Enemy, StatType } from '../../types';
import { calculatePlayerTotalStats } from '../../utils/gameEngine';
import { Swords, Skull, Trophy, Activity, Sword, Shield, Brain, Wind } from 'lucide-react';

interface BattleViewProps {
  player: Player;
  enemy: Enemy;
  narrative: string;
  result: BattleLog;
  onFinish: () => void;
}

// Compact Stat Row for Mobile/Desktop
const StatRow: React.FC<{ icon: any, value: number, color: string }> = ({ icon: Icon, value, color }) => (
    <div className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-[10px] font-mono font-bold text-slate-300">{value}</span>
    </div>
);

export const BattleView: React.FC<BattleViewProps> = ({ player, enemy, narrative, result, onFinish }) => {
  const [playerTotalStats] = useState(() => calculatePlayerTotalStats(player));
  
  // Animation States
  const [displayedTurns, setDisplayedTurns] = useState<string[]>([]);
  const [currentPlayerHp, setCurrentPlayerHp] = useState(player.hp);
  const [currentEnemyHp, setCurrentEnemyHp] = useState(enemy.maxHp);
  const [isFinished, setIsFinished] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const turns = result.turns || [];
    let currentTurnIndex = 0;

    setDisplayedTurns([`Inicia el combate contra ${enemy.name} (Nivel ${enemy.level}).`]);

    const interval = setInterval(() => {
      if (currentTurnIndex < turns.length) {
        const turn = turns[currentTurnIndex];
        
        setDisplayedTurns(prev => [...prev, turn.text]);
        setCurrentPlayerHp(turn.playerHp);
        setCurrentEnemyHp(turn.enemyHp);

        currentTurnIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
            setDisplayedTurns(prev => [...prev, result.result === 'VICTORIA' ? `¡Has derrotado a ${enemy.name}!` : `Has caído ante ${enemy.name}...`]);
            setIsFinished(true);
        }, 500);
      }
    }, 1500); // Slightly faster turns for better mobile pacing

    return () => clearInterval(interval);
  }, [result]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedTurns]);

  return (
    <div className="fixed inset-0 z-[100] bg-void flex flex-col h-[100dvh] overflow-hidden">
        {/* Environment FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,30,0),rgba(0,0,0,1))] pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 z-0"></div>
        
        {/* Main Content Layout - Strict Column Flex */}
        <div className="relative z-10 flex flex-col flex-grow w-full max-w-5xl mx-auto h-full">
            
            {/* 1. TOP SECTION: Combatants (Compact on Mobile) */}
            <div className="shrink-0 p-4 pb-2 bg-gradient-to-b from-slate-950 to-transparent border-b border-white/5">
                <div className="flex items-center justify-between gap-2">
                    
                    {/* PLAYER SIDE */}
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg border border-blue-500/30 overflow-hidden shadow-lg bg-slate-900">
                                <img 
                                    src="https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=300&auto=format&fit=crop" 
                                    className={`w-full h-full object-cover transition-all ${currentPlayerHp === 0 ? 'grayscale blur-[1px]' : ''}`} 
                                    alt="Player" 
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-blue-900 border border-blue-500 text-[9px] px-1 rounded text-white font-bold">
                                {player.level}
                            </div>
                        </div>
                        <div className="min-w-0 flex flex-col flex-1">
                            <h3 className="font-serif font-bold text-slate-200 truncate text-sm md:text-lg">{player.name}</h3>
                            {/* HP Bar */}
                            <div className="w-full h-2 md:h-3 bg-slate-900/80 rounded-full border border-white/10 overflow-hidden relative mt-1">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-300" 
                                    style={{ width: `${Math.max(0, (currentPlayerHp/player.maxHp)*100)}%` }}
                                ></div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 mt-0.5">{Math.round(currentPlayerHp)}/{player.maxHp}</span>
                            
                            {/* Desktop Stats */}
                            <div className="hidden md:flex gap-3 mt-1 opacity-80">
                                <StatRow icon={Sword} value={playerTotalStats[StatType.STRENGTH]} color="text-orange-500" />
                                <StatRow icon={Wind} value={playerTotalStats[StatType.DEXTERITY]} color="text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* VS BADGE */}
                    <div className="shrink-0 flex flex-col items-center justify-center px-1">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/40 animate-pulse">
                            <span className="font-serif font-bold text-red-500 text-xs md:text-base">VS</span>
                        </div>
                    </div>

                    {/* ENEMY SIDE */}
                    <div className="flex flex-1 items-center gap-3 flex-row-reverse text-right">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg border border-red-500/30 overflow-hidden shadow-lg bg-slate-900">
                                <img 
                                    src={`https://picsum.photos/400/400?grayscale&seed=${enemy.name}`}
                                    className={`w-full h-full object-cover transition-all ${currentEnemyHp === 0 ? 'grayscale blur-[1px]' : ''}`} 
                                    alt="Enemy" 
                                />
                            </div>
                            <div className="absolute -bottom-1 -left-1 bg-red-900 border border-red-500 text-[9px] px-1 rounded text-white font-bold">
                                {enemy.level}
                            </div>
                        </div>
                        <div className="min-w-0 flex flex-col flex-1">
                            <h3 className="font-serif font-bold text-slate-200 truncate text-sm md:text-lg">{enemy.name}</h3>
                             {/* HP Bar */}
                             <div className="w-full h-2 md:h-3 bg-slate-900/80 rounded-full border border-white/10 overflow-hidden relative mt-1">
                                <div 
                                    className="h-full bg-red-500 transition-all duration-300" 
                                    style={{ width: `${Math.max(0, (currentEnemyHp/enemy.maxHp)*100)}%` }}
                                ></div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 mt-0.5">{Math.round(currentEnemyHp)}/{enemy.maxHp}</span>

                             {/* Desktop Stats */}
                             <div className="hidden md:flex gap-3 mt-1 justify-end opacity-80">
                                <StatRow icon={Sword} value={enemy.stats[StatType.STRENGTH]} color="text-orange-500" />
                                <StatRow icon={Shield} value={enemy.stats[StatType.CONSTITUTION]} color="text-yellow-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MIDDLE: Battle Log (Takes remaining space) */}
            <div className="flex-grow min-h-0 mx-2 md:mx-4 mb-2 md:mb-4 bg-slate-950/60 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-inner relative">
                <div className="p-3 border-b border-white/5 bg-slate-900/80 flex items-center justify-between shrink-0">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3 text-gold-500" /> Registro
                    </span>
                    {!isFinished && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>}
                </div>

                <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar scroll-smooth">
                    {displayedTurns.map((log, i) => {
                        const isCrit = log.includes('CRÍTICO');
                        const isPlayerDamage = log.includes('causando');
                        const isEnemyDamage = log.includes('recibes');
                        
                        return (
                            <div key={i} className={`animate-slide-up flex items-start gap-2 text-xs md:text-sm md:leading-relaxed ${i === displayedTurns.length - 1 ? 'opacity-100' : 'opacity-80'}`}>
                                 <div className={`mt-1 w-1 h-1 rounded-full shrink-0 ${isPlayerDamage ? 'bg-green-500' : isEnemyDamage ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                                 <p className={`${isCrit ? 'text-red-300 font-bold' : 'text-slate-300'}`}>
                                     {log}
                                 </p>
                            </div>
                        );
                    })}
                    <div ref={logEndRef} className="h-4" />
                </div>
            </div>

            {/* 3. BOTTOM: Controls (Only if finished) */}
            {isFinished && (
                <div className="shrink-0 p-4 pb-safe animate-fade-in-up bg-gradient-to-t from-black to-transparent">
                    <button 
                        onClick={onFinish}
                        className={`w-full py-4 rounded-xl font-serif font-bold uppercase tracking-widest text-sm shadow-lg border relative overflow-hidden group transition-all
                            ${result.result === 'VICTORIA' 
                                ? 'bg-gold-600 text-black border-gold-400 hover:bg-gold-500' 
                                : 'bg-red-900 text-white border-red-500 hover:bg-red-800'
                            }
                        `}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {result.result === 'VICTORIA' ? <Trophy className="w-4 h-4" /> : <Skull className="w-4 h-4" />}
                            {result.result === 'VICTORIA' ? 'Reclamar Victoria' : 'Aceptar Derrota'}
                        </span>
                    </button>
                </div>
            )}
        </div>

        {/* Full Screen Results Modal (Optional Overlay for drama, mostly for desktop but fits mobile) */}
        {isFinished && (
            <div className="absolute inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-none">
                <div className="pointer-events-auto max-w-sm w-full glass-panel p-6 rounded-2xl border border-white/20 shadow-2xl animate-scale-in text-center">
                    <h2 className={`font-serif text-3xl font-bold mb-2 ${result.result === 'VICTORIA' ? 'text-gold-400' : 'text-red-500'}`}>
                        {result.result}
                    </h2>
                    <p className="text-xs text-slate-400 italic mb-6">"{narrative || result.details}"</p>
                    
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="flex flex-col items-center">
                             <span className="text-[10px] uppercase text-slate-500 font-bold">Oro</span>
                             <span className="font-mono text-gold-400 font-bold">+{result.goldChange}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-white/10 pl-4">
                             <span className="text-[10px] uppercase text-slate-500 font-bold">XP</span>
                             <span className="font-mono text-purple-400 font-bold">+{result.xpChange}</span>
                        </div>
                    </div>

                    {result.loot && (
                        <div className="mb-6 p-3 bg-black/40 rounded-lg border border-white/5">
                            <span className="text-[10px] uppercase text-slate-500 font-bold block mb-2">Recompensas Adicionales</span>
                            <div className="flex flex-col gap-1">
                                {result.loot.item && (
                                    <span className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1">
                                        <Sword className="w-3 h-3" /> {result.loot.item.name}
                                    </span>
                                )}
                                {result.loot.material && (
                                    <span className="text-xs text-slate-300 font-mono flex items-center justify-center gap-1">
                                        <Shield className="w-3 h-3" /> +{result.loot.material.amount} Material
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={onFinish} 
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold uppercase text-xs border border-white/10"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
