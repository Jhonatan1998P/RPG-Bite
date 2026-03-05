
import React, { useState, useEffect } from 'react';
import { Item, Player, ItemType } from '../../types';
import { useGameState } from '../../hooks/useGameState';
import { Coins, ShoppingBag, RefreshCw, Lock, HandCoins, ArrowRightLeft, PackageOpen, Gem, Clock, Utensils, Shield, Sword } from 'lucide-react';
import { ItemIcon } from '../UI/ItemIcon';
import { TooltipTrigger } from '../UI/TooltipTrigger';
import { ViewHeader } from '../Layout/ViewHeader';
import { GameCard } from '../UI/GameCard';
import { calculateFoodHealing } from '../../utils/gameEngine';

interface MerchantViewProps {
  player: Player;
  onBuyItem: (item: Item) => boolean;
  onSellItem: (item: Item) => void;
  onDeductGold: (amount: number) => boolean;
  onDeductRubies: (amount: number) => boolean;
}

type TabMode = 'BUY' | 'SELL';

// --- SUBCOMPONENT: Shop Item Card (DRY) ---
const ShopItemCard: React.FC<{ 
    item: Item; 
    player: Player;
    onAction: (item: Item) => void; 
    actionLabel: string;
    priceLabel: string;
    canAfford: boolean;
    isSelling?: boolean;
}> = ({ item, player, onAction, actionLabel, priceLabel, canAfford, isSelling }) => {
    
    // Tooltip Content Construction
    const tooltipContent = (
        <div className="min-w-[200px]">
             <div className="flex justify-between items-start mb-2 pb-2 border-b border-white/10">
                <span className={`font-bold text-sm ${item.rarity === 'Legendario' ? 'text-orange-400' : item.rarity === 'Épico' ? 'text-purple-400' : 'text-slate-200'}`}>{item.name}</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Nvl {item.level}</span>
            </div>
            
            <div className="space-y-1.5 mb-3">
                {item.type === ItemType.FOOD ? (
                    <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Curación</span>
                            <span className="text-green-400 font-mono font-bold">+{calculateFoodHealing(item, player)} HP</span>
                    </div>
                ) : (
                    Object.entries(item.stats).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                            <span className="text-slate-400">{k}</span>
                            <span className="text-green-400 font-mono font-bold">+{v}</span>
                        </div>
                    ))
                )}
            </div>
            <div className="text-[10px] text-slate-500 italic">"{item.description}"</div>
        </div>
    );

    return (
        <GameCard 
            rarity={item.rarity}
            className={`transition-all duration-300 ${!canAfford && !isSelling ? 'opacity-70' : 'hover:-translate-y-1 hover:shadow-xl'}`}
        >
             <TooltipTrigger content={tooltipContent} className="h-full flex flex-col">
                {/* Header */}
                <div className="p-2 border-b border-white/5 bg-black/20 z-10 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider truncate max-w-[70%]">{item.subtype || item.type}</span>
                    <span className="text-[9px] text-slate-600">L{item.level}</span>
                </div>

                {/* Body */}
                <div className="relative p-4 flex flex-col items-center flex-grow gap-3">
                    <div className="w-14 h-14 md:w-16 md:h-16 shadow-lg rounded-xl">
                            <ItemIcon item={item} size="md" />
                    </div>
                    <div className="w-full text-center">
                        <h3 className="font-bold text-slate-200 text-xs md:text-sm line-clamp-1">{item.name}</h3>
                         {/* Mini Stats Preview */}
                         <div className="flex justify-center gap-2 mt-1">
                            {item.type === ItemType.FOOD ? (
                                <span className="text-[10px] text-green-400 font-mono">+{calculateFoodHealing(item, player)} HP</span>
                            ) : (
                                Object.entries(item.stats).slice(0, 2).map(([k, v]) => (
                                    <span key={k} className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                                        {k.substring(0,3)} <span className="text-slate-200">{v}</span>
                                    </span>
                                ))
                            )}
                         </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto p-2 bg-black/20 border-t border-white/5">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canAfford) onAction(item);
                        }}
                        disabled={!canAfford}
                        className={`
                            w-full py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all
                            ${canAfford 
                                ? isSelling 
                                    ? 'bg-slate-800 hover:bg-green-900/80 text-green-400 border border-white/10 hover:border-green-500/50'
                                    : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 hover:border-purple-500/60' 
                                : 'bg-slate-950 text-slate-600 cursor-not-allowed border border-white/5'
                            }
                        `}
                    >
                        {!canAfford && !isSelling ? <Lock className="w-3 h-3" /> : null}
                        {actionLabel} <span className="font-mono opacity-80">{priceLabel}</span>
                    </button>
                </div>
            </TooltipTrigger>
        </GameCard>
    );
};


export const MerchantView: React.FC<MerchantViewProps> = ({ player, onBuyItem, onSellItem, onDeductGold, onDeductRubies }) => {
  const [tab, setTab] = useState<TabMode>('BUY');
  const [refreshTimeLeft, setRefreshTimeLeft] = useState('');
  const { actions } = useGameState(); // Access refreshMerchant logic

  // Auto-Refresh Timer UI
  useEffect(() => {
    const updateTimer = () => {
        const now = Date.now();
        if (now < player.nextMerchantRefresh) {
            const diff = player.nextMerchantRefresh - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setRefreshTimeLeft(`${hours}h ${minutes}m`);
        } else {
            setRefreshTimeLeft('Ahora');
        }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute is enough
    return () => clearInterval(interval);
  }, [player.nextMerchantRefresh]);

  const handleRestock = () => {
      actions.refreshMerchant();
  };

  const calculateSellPrice = (item: Item) => Math.floor(item.cost * 0.5);

  const foodItems = player.merchantInventory.filter(i => i.type === ItemType.FOOD);
  const equipItems = player.merchantInventory.filter(i => i.type !== ItemType.FOOD);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20 md:pb-6">
      
      {/* 1. HEADER */}
      <ViewHeader
        title="Bazar Sombrío"
        subtitle='"La calidad cuesta. La supervivencia, más."'
        imageSrc="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&auto=format&fit=crop"
      >
          <div className="flex flex-col items-end gap-1.5">
                <TooltipTrigger content="Tu oro disponible para compras.">
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-gold-500/20 shadow-inner cursor-help">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest hidden md:inline">Oro</span>
                        <span className="text-sm md:text-lg font-mono font-bold text-gold-400 flex items-center gap-1.5">
                            {player.gold.toLocaleString()} <Coins className="w-4 h-4" />
                        </span>
                    </div>
                </TooltipTrigger>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-red-500/20">
                     <span className="text-sm font-mono font-bold text-red-400 flex items-center gap-1.5">
                        {player.rubies} <Gem className="w-3 h-3" />
                    </span>
                </div>
          </div>
      </ViewHeader>

      {/* 2. CONTROLS */}
      <div className="shrink-0 flex items-center justify-between gap-3 bg-slate-900/50 p-2 rounded-xl border border-white/5">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-lg border border-white/5">
              <button 
                onClick={() => setTab('BUY')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${tab === 'BUY' ? 'bg-purple-900/50 text-purple-300 shadow-sm border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <ShoppingBag className="w-3.5 h-3.5" /> <span className="hidden md:inline">Mercado</span>
              </button>
              <button 
                onClick={() => setTab('SELL')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${tab === 'SELL' ? 'bg-green-900/50 text-green-300 shadow-sm border border-green-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <HandCoins className="w-3.5 h-3.5" /> <span className="hidden md:inline">Vender</span>
              </button>
          </div>

          {/* Restock Info */}
          {tab === 'BUY' && (
             <div className="flex items-center gap-2">
                 <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-black/30 px-2 py-1 rounded border border-white/5">
                    <Clock className="w-3 h-3" /> Auto: {refreshTimeLeft}
                 </div>
                 <TooltipTrigger content="Gasta 5 Rubíes para traer nueva mercancía inmediatamente.">
                    <button 
                        onClick={handleRestock}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-red-500/30 rounded-lg text-[10px] md:text-xs font-bold text-slate-300 hover:text-red-300 transition-all uppercase tracking-wide"
                    >
                        <RefreshCw className="w-3 h-3" />
                        <span className="hidden md:inline">Renovar (5 <Gem className="w-2.5 h-2.5 inline -mt-0.5"/>)</span>
                        <span className="md:hidden">5 <Gem className="w-2.5 h-2.5 inline"/></span>
                    </button>
                </TooltipTrigger>
             </div>
          )}
      </div>

      {/* 3. INVENTORY GRID */}
      <div className="space-y-6">
        
        {/* BUY MODE */}
        {tab === 'BUY' && (
            <>
                {/* Section: Supplies (Food) */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Utensils className="w-4 h-4 text-green-500" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Provisiones</h3>
                        <div className="h-px bg-white/10 flex-grow ml-2"></div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {foodItems.map(item => (
                            <ShopItemCard 
                                key={item.id}
                                item={item}
                                player={player}
                                onAction={onBuyItem}
                                actionLabel="Comprar"
                                priceLabel={`${item.cost}g`}
                                canAfford={player.gold >= item.cost}
                            />
                        ))}
                    </div>
                </section>

                {/* Section: Equipment */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1 mt-2">
                        <Sword className="w-4 h-4 text-purple-500" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Armamento</h3>
                        <div className="h-px bg-white/10 flex-grow ml-2"></div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-4">
                        {equipItems.map(item => (
                            <ShopItemCard 
                                key={item.id}
                                item={item}
                                player={player}
                                onAction={onBuyItem}
                                actionLabel="Comprar"
                                priceLabel={`${item.cost}g`}
                                canAfford={player.gold >= item.cost}
                            />
                        ))}
                    </div>
                </section>
            </>
        )}

        {/* SELL MODE */}
        {tab === 'SELL' && (
            <>
                {player.inventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-600 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 m-1">
                        <PackageOpen className="w-16 h-16 mb-4 opacity-50 text-slate-700" />
                        <p className="font-serif text-lg italic text-slate-500">Mochila vacía</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-4">
                        {player.inventory.map((item) => (
                             <ShopItemCard 
                                key={item.id}
                                item={item}
                                player={player}
                                onAction={onSellItem}
                                actionLabel="Vender"
                                priceLabel={`+${calculateSellPrice(item)}g`}
                                canAfford={true}
                                isSelling={true}
                            />
                        ))}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};
