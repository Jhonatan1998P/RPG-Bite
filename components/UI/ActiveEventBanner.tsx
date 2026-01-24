
import React, { useEffect, useState } from 'react';
import { Player, EventType } from '../../types';
import { Sparkles, Coins, Zap, TrendingDown, Wind, Moon } from 'lucide-react';
import { TooltipTrigger } from './TooltipTrigger';

interface ActiveEventBannerProps {
    player: Player;
}

export const ActiveEventBanner: React.FC<ActiveEventBannerProps> = ({ player }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!player.activeEvent) return;

        const interval = setInterval(() => {
            const diff = player.eventEndTime - Date.now();
            if (diff <= 0) {
                setTimeLeft('Finalizando...');
                return;
            }
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [player.activeEvent, player.eventEndTime]);

    if (!player.activeEvent) return null;

    const getIcon = () => {
        switch(player.activeEvent?.type) {
            case EventType.RUBY_HUNT: return <Moon className="w-5 h-5 animate-pulse text-red-400" />;
            case EventType.GOLD_RUSH: return <Coins className="w-5 h-5 animate-bounce text-yellow-400" />;
            case EventType.XP_BOOST: return <Zap className="w-5 h-5 animate-pulse text-blue-400" />;
            case EventType.DISCOUNT: return <TrendingDown className="w-5 h-5 text-emerald-400" />;
            case EventType.SPEED: return <Wind className="w-5 h-5 animate-pulse text-cyan-400" />;
            case EventType.LUCKY_LOOT: return <Sparkles className="w-5 h-5 animate-spin-slow text-purple-400" />;
            default: return <Sparkles className="w-5 h-5" />;
        }
    };

    return (
        <div className="w-full bg-slate-900 border-b border-white/10 relative overflow-hidden animate-slide-up z-50 shadow-2xl">
            {/* Ambient Background based on Event Color */}
            <div className={`absolute inset-0 opacity-10 bg-current ${player.activeEvent.color}`}></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse-slow"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-black/40 border border-white/10 shadow-lg ${player.activeEvent.color}`}>
                        {getIcon()}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                        <h3 className={`font-serif font-bold text-sm md:text-base ${player.activeEvent.color} tracking-wide uppercase`}>
                            {player.activeEvent.name}
                        </h3>
                        <span className="hidden md:inline text-white/20">|</span>
                        <p className="text-[10px] md:text-xs text-slate-300 italic">
                            {player.activeEvent.description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tiempo</span>
                    <span className="font-mono text-sm md:text-base font-bold text-white">{timeLeft}</span>
                </div>
            </div>
            
            {/* Progress Bar at bottom */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 w-full animate-pulse"></div>
        </div>
    );
};
