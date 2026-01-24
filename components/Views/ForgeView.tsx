
import React, { useState } from 'react';
import { Player, ItemType, QuestRarity, MaterialType, Item, StatType } from '../../types';
import { useGameState } from '../../hooks/useGameState';
import { Hammer, Recycle, ArrowUpCircle, Anvil, Coins, Pickaxe, Gem, Shield } from 'lucide-react';
import { ViewHeader } from '../Layout/ViewHeader';
import { TooltipTrigger } from '../UI/TooltipTrigger';
import { GameCard } from '../UI/GameCard';
import { ItemIcon } from '../UI/ItemIcon';
import { CRAFTING_RECIPES, MATERIALS_CONFIG, UPGRADE_CONFIG, RARITY_CONFIG } from '../../data/constants';

interface ForgeViewProps {
    player: Player;
}

type TabMode = 'CRAFT' | 'UPGRADE' | 'SALVAGE';

export const ForgeView: React.FC<ForgeViewProps> = ({ player }) => {
    const [tab, setTab] = useState<TabMode>('CRAFT');
    const { actions } = useGameState();
    const [selectedType, setSelectedType] = useState<ItemType>(ItemType.WEAPON);

    // --- SUBCOMPONENT: Material Cost Pill ---
    const MaterialPill = ({ type, cost }: { type: MaterialType, cost: number }) => {
        const owned = player.materials[type] || 0;
        const hasEnough = owned >= cost;
        const config = MATERIALS_CONFIG[type];

        return (
            <TooltipTrigger content={config.description}>
                <div className={`
                    flex items-center gap-1.5 px-2 py-1 rounded text-[10px] border
                    ${hasEnough ? 'bg-slate-900/50 border-white/10 text-slate-300' : 'bg-red-900/20 border-red-500/30 text-red-300'}
                `}>
                    <span className={`w-2 h-2 rounded-full ${
                        type === MaterialType.GEM ? 'bg-orange-500' :
                        type === MaterialType.ESSENCE ? 'bg-purple-500' :
                        type === MaterialType.ORE ? 'bg-blue-400' :
                        'bg-slate-500'
                    }`}></span>
                    <span className="font-mono">{owned}/{cost}</span>
                    <span className="uppercase font-bold tracking-tight">{config.name}</span>
                </div>
            </TooltipTrigger>
        );
    };

    // --- SUBCOMPONENT: Craft Card ---
    const CraftCard = ({ type, rarity }: { type: ItemType, rarity: QuestRarity }) => {
        const recipe = CRAFTING_RECIPES[type]?.[rarity];
        if (!recipe) return null;

        const rarityColor = RARITY_CONFIG[rarity].color;
        let canCraft = true;
        Object.entries(recipe).forEach(([mat, amount]) => {
            if ((player.materials[mat as MaterialType] || 0) < (amount as number)) canCraft = false;
        });

        return (
            <GameCard className="p-4 flex flex-col gap-3 items-center text-center">
                <div className={`font-serif font-bold ${rarityColor} border-b border-white/10 w-full pb-2 mb-1`}>
                    {rarity}
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-2">
                    {Object.entries(recipe).map(([mat, amount]) => (
                        <MaterialPill key={mat} type={mat as MaterialType} cost={amount as number} />
                    ))}
                </div>

                <button
                    onClick={() => actions.craftItem(type, rarity)}
                    disabled={!canCraft}
                    className={`
                        w-full py-2 rounded font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all mt-auto
                        ${canCraft
                            ? 'bg-amber-700 hover:bg-amber-600 text-amber-100 shadow-lg shadow-amber-900/20'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
                        }
                    `}
                >
                    <Anvil className="w-3.5 h-3.5" /> Forjar
                </button>
            </GameCard>
        );
    };

    // --- SUBCOMPONENT: Upgrade Card ---
    const UpgradeCard = ({ item }: { item: Item }) => {
        const currentLevel = item.upgradeLevel || 0;
        const isMaxed = currentLevel >= UPGRADE_CONFIG.MAX_LEVEL;
        const cost = Math.floor(UPGRADE_CONFIG.BASE_COST_GOLD * Math.pow(UPGRADE_CONFIG.COST_MULTIPLIER, currentLevel));
        const canAfford = player.gold >= cost;

        return (
             <GameCard rarity={item.rarity} className="relative group">
                 <div className="p-3 flex gap-4 items-center">
                    <div className="w-16 h-16 shrink-0 relative">
                        <ItemIcon item={item} size="md" />
                        <div className="absolute -top-2 -right-2 bg-black/80 border border-white/20 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-amber-400">
                            +{currentLevel}
                        </div>
                    </div>

                    <div className="flex-grow min-w-0">
                         <div className="font-bold text-sm text-slate-200 truncate">{item.name}</div>
                         <div className="text-[10px] text-slate-500 font-mono mb-2">{item.type} - Nvl {item.level}</div>

                         {!isMaxed && (
                             <div className="flex gap-2 text-xs">
                                 <span className="text-slate-400">Stats:</span>
                                 <span className="text-green-400 font-bold flex items-center gap-1">
                                     +{(UPGRADE_CONFIG.STAT_GROWTH * 100 - 100).toFixed(0)}% <ArrowUpCircle className="w-3 h-3"/>
                                 </span>
                             </div>
                         )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 w-28">
                         {isMaxed ? (
                             <div className="text-center text-xs font-bold text-gold-500 uppercase border border-gold-500/30 bg-gold-500/10 py-1 rounded">
                                 Nivel Máximo
                             </div>
                         ) : (
                             <button
                                onClick={() => actions.upgradeItem(item)}
                                disabled={!canAfford}
                                className={`
                                    px-3 py-1.5 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1
                                    ${canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                                `}
                             >
                                 <span className="flex items-center gap-1">
                                     {cost} <Coins className="w-3 h-3" />
                                 </span>
                             </button>
                         )}
                    </div>
                 </div>
             </GameCard>
        );
    };

    // --- SUBCOMPONENT: Salvage Card ---
    const SalvageCard = ({ item }: { item: Item }) => {
        // Mock calculation preview (simplified from engine logic)
        const baseScrap = Math.max(1, Math.floor(item.level / 2));

        return (
            <GameCard rarity={item.rarity} className="p-3 flex items-center gap-4">
                 <div className="w-12 h-12 shrink-0">
                    <ItemIcon item={item} size="sm" />
                </div>

                <div className="flex-grow">
                    <div className="font-bold text-xs text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        Obtienes: <span className="text-slate-300 font-mono">Chatarra + otros</span>
                    </div>
                </div>

                <button
                    onClick={() => actions.salvageItem(item)}
                    className="bg-red-900/40 hover:bg-red-800/60 border border-red-500/30 text-red-300 px-4 py-2 rounded text-xs font-bold uppercase flex items-center gap-2 transition-all"
                >
                    <Recycle className="w-4 h-4" />
                </button>
            </GameCard>
        );
    };


    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-20 md:pb-6">
            <ViewHeader
                title="La Gran Forja"
                subtitle='"El fuego purifica. El acero obedece."'
                imageSrc="https://images.unsplash.com/photo-1595867990177-3e449265f053?q=80&w=200&auto=format&fit=crop"
            >
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-mono">
                    {Object.entries(player.materials).map(([mat, amt]) => (
                        <div key={mat} className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-white/5">
                            <span className={`w-1.5 h-1.5 rounded-full ${mat === MaterialType.GEM ? 'bg-orange-500' : 'bg-slate-500'}`}></span>
                            <span>{amt}</span>
                        </div>
                    ))}
                </div>
            </ViewHeader>

            {/* TAB CONTROLS */}
            <div className="flex p-1 bg-slate-950 rounded-lg border border-white/5 shrink-0 mx-auto max-w-md w-full">
                  <button
                    onClick={() => setTab('CRAFT')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${tab === 'CRAFT' ? 'bg-amber-900/50 text-amber-300 shadow-sm border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Hammer className="w-4 h-4" /> <span className="hidden sm:inline">Crear</span>
                  </button>
                  <button
                    onClick={() => setTab('UPGRADE')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${tab === 'UPGRADE' ? 'bg-blue-900/50 text-blue-300 shadow-sm border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <ArrowUpCircle className="w-4 h-4" /> <span className="hidden sm:inline">Mejorar</span>
                  </button>
                  <button
                    onClick={() => setTab('SALVAGE')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${tab === 'SALVAGE' ? 'bg-red-900/50 text-red-300 shadow-sm border border-red-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Recycle className="w-4 h-4" /> <span className="hidden sm:inline">Reciclar</span>
                  </button>
            </div>

            {/* CONTENT */}
            <div className="min-h-[400px]">
                {tab === 'CRAFT' && (
                    <div className="space-y-6">
                        {/* Type Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {Object.values(ItemType).filter(t => t !== ItemType.POTION && t !== ItemType.FOOD).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`
                                        px-4 py-2 rounded-full border text-xs font-bold uppercase whitespace-nowrap transition-all
                                        ${selectedType === type ? 'bg-amber-600/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(['Común', 'Poco Común', 'Raro', 'Épico', 'Legendario'] as QuestRarity[]).map(rarity => (
                                <CraftCard key={rarity} type={selectedType} rarity={rarity} />
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'UPGRADE' && (
                     <div className="space-y-4">
                         {player.inventory.filter(i => i.type !== ItemType.FOOD).length === 0 ? (
                             <div className="text-center text-slate-500 py-10 italic">No tienes equipo para mejorar.</div>
                         ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {player.inventory.filter(i => i.type !== ItemType.FOOD).map(item => (
                                     <UpgradeCard key={item.id} item={item} />
                                 ))}
                             </div>
                         )}
                     </div>
                )}

                {tab === 'SALVAGE' && (
                    <div className="space-y-4">
                         {player.inventory.filter(i => i.type !== ItemType.FOOD).length === 0 ? (
                             <div className="text-center text-slate-500 py-10 italic">Inventario de equipo vacío.</div>
                         ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {player.inventory.filter(i => i.type !== ItemType.FOOD).map(item => (
                                     <SalvageCard key={item.id} item={item} />
                                 ))}
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};
