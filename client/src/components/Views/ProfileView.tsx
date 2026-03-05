
import React, { useState, useMemo } from 'react';
import { Player, StatType, ItemType, Item, Equipment, Stats, Echo, Cosmetic } from '../../types';
import { calculateStatCost, calculatePlayerTotalStats, calculateFoodHealing } from '../../utils/gameEngine';
import { Heart, Coins, Gem, Brain, BicepsFlexed, Wind, Shield, Sword, Backpack, Shirt, Footprints, Zap, Crown, Check, Utensils, Infinity, Dna, Image as ImageIcon, Type, Frame } from 'lucide-react';
import { TooltipTrigger } from '../UI/TooltipTrigger';
import { ItemIcon } from '../UI/ItemIcon';
import { eventBus, EventTypes } from '../../services/eventBus';
import { COSMETICS_DATA } from '../../data/constants';

// --- INTERFACES ---

interface ProfileViewProps {
  player: Player;
  onTrainStat: (stat: StatType) => void;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (type: ItemType) => void;
  onConsumeItem: (item: Item) => void;
  onSetCosmetic: (type: 'TITLE' | 'FRAME' | 'BACKGROUND', id: string | null) => void;
}

interface HeroStatsSectionProps {
    player: Player;
    totalStats: Stats;
    onTrainStat: (stat: StatType) => void;
}

interface GearSectionProps {
    player: Player;
    onEquipItem: (item: Item) => void;
    onUnequipItem: (type: ItemType) => void;
    onConsumeItem: (item: Item) => void;
}

// --- SUBCOMPONENTS ---

const AttributeRow: React.FC<{ 
    label: string; 
    description: string;
    icon: any; 
    baseVal: number; 
    totalVal: number; 
    cost: number; 
    canAfford: boolean; 
    onTrain: () => void;
    color: string;
}> = React.memo(({ label, description, icon: Icon, baseVal, totalVal, cost, canAfford, onTrain, color }) => (
    <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
        <TooltipTrigger content={description}>
            <div className={`p-2 rounded-lg bg-black/40 border border-white/5 ${color} cursor-help`}>
                <Icon className="w-4 h-4" />
            </div>
        </TooltipTrigger>
        
        <div className="flex-grow min-w-0">
            <div className="flex justify-between items-center mb-1">
                <TooltipTrigger content={`Base: ${baseVal} + Equipo: ${totalVal - baseVal}`}>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider cursor-help border-b border-dashed border-slate-700 hover:border-slate-400 transition-colors">{label}</span>
                </TooltipTrigger>
                <span className="text-sm font-mono font-bold text-white">
                    {totalVal} 
                    {totalVal > baseVal && <span className="text-[10px] text-green-400 ml-1">(+{totalVal - baseVal})</span>}
                </span>
            </div>
            {/* Visual Bar */}
            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                <div className={`h-full ${color.replace('text-', 'bg-')} opacity-60`} style={{ width: `${Math.min(100, (totalVal / 100) * 100)}%` }}></div>
            </div>
        </div>

        <TooltipTrigger content={`Coste: ${cost} oro. Mejora permanente.`}>
            <button 
                onClick={onTrain}
                disabled={!canAfford}
                className={`
                    h-9 px-3 rounded-lg flex items-center gap-1.5 font-mono text-xs font-bold transition-all border
                    ${canAfford 
                        ? 'bg-slate-800 hover:bg-gold-600 hover:text-black border-slate-700 hover:border-gold-400 text-gold-500' 
                        : 'bg-slate-950 border-transparent text-slate-600 cursor-not-allowed opacity-50'
                    }
                `}
            >
                <span className="hidden md:inline">Entrenar</span>
                <span className="flex items-center">
                    {cost} <Coins className="w-3 h-3 ml-1" />
                </span>
            </button>
        </TooltipTrigger>
    </div>
));

const InventorySlot: React.FC<{ 
    item?: Item | null; 
    onClick?: () => void; 
    isEquipped?: boolean; 
    placeholderIcon?: any;
    label?: string; // For equipment slots
    player?: Player; // Needed for food preview
}> = React.memo(({ item, onClick, isEquipped, placeholderIcon: Placeholder, label, player }) => {
    
    // Rarity Colors
    const getRarityColor = (r?: string) => {
        if (r === 'Legendario') return 'border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
        if (r === 'Épico') return 'border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
        if (r === 'Raro') return 'border-blue-500/50';
        if (r === 'Poco Común') return 'border-green-500/50';
        return 'border-white/10';
    };

    // Handle Click Logic: Mobile vs Desktop
    const handleSlotClick = (e: React.MouseEvent) => {
        if (window.matchMedia('(hover: none)').matches) {
            return; // Let the event bubble to TooltipTrigger to show info
        }
        onClick && onClick();
    };

    const handleActionFromTooltip = () => {
        onClick && onClick();
        eventBus.emit(EventTypes.HIDE_TOOLTIP);
    }

    const content = (
        <div 
            onClick={handleSlotClick}
            className={`
                relative aspect-square w-full rounded-xl overflow-hidden border bg-slate-900/40 transition-all duration-200
                ${item 
                    ? `cursor-pointer hover:scale-[1.02] active:scale-95 ${getRarityColor(item.rarity)}` 
                    : 'border-white/5 border-dashed hover:border-white/20'
                }
            `}
        >
            {!item && label && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-1 pointer-events-none p-2">
                    {Placeholder && <Placeholder className="w-5 h-5 opacity-40" />}
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 text-center leading-none">{label}</span>
                </div>
            )}

            {item && (
                <div className="absolute inset-0 p-1">
                    <ItemIcon item={item} showLevel size="md" />
                </div>
            )}

            {item && item.type === ItemType.FOOD && (
                 <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
            )}
        </div>
    );

    if (!item) return content;

    return (
        <TooltipTrigger 
            className="w-full h-full"
            content={
             <div className="min-w-[200px]">
                <div className="flex justify-between items-start mb-2 pb-2 border-b border-white/10">
                    <span className={`font-bold text-sm ${item.rarity === 'Legendario' ? 'text-orange-400' : item.rarity === 'Épico' ? 'text-purple-400' : 'text-slate-200'}`}>{item.name}</span>
                </div>
                
                <div className="space-y-1.5 mb-3">
                    {item.type === ItemType.FOOD ? (
                        <div className="flex justify-between text-xs">
                             <span className="text-slate-400">Curación</span>
                             <span className="text-green-400 font-mono font-bold">+{player ? calculateFoodHealing(item, player) : '?'} HP</span>
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

                <div className="text-[10px] text-slate-500 italic mb-3">"{item.description}"</div>
                
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="hidden md:inline text-slate-500">
                        {isEquipped ? 'Click para desequipar' : item.type === ItemType.FOOD ? 'Click para comer' : 'Click para equipar'}
                    </span>
                    <span className="text-gold-400 font-mono">{item.cost}g</span>
                </div>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleActionFromTooltip();
                    }}
                    className="md:hidden w-full mt-3 py-3 rounded-lg bg-gold-600 hover:bg-gold-500 text-black font-bold uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2"
                >
                    {isEquipped ? <Shield className="w-4 h-4"/> : item.type === ItemType.FOOD ? <Utensils className="w-4 h-4"/> : <Check className="w-4 h-4"/>}
                    {isEquipped ? 'Desequipar' : item.type === ItemType.FOOD ? 'Consumir' : 'Equipar'}
                </button>
            </div>
        }>
            {content}
        </TooltipTrigger>
    );
});

// Extracted Component: HeroStatsSection
const HeroStatsSection: React.FC<HeroStatsSectionProps> = ({ player, totalStats, onTrainStat }) => {
    const activeTitle = useMemo(() => COSMETICS_DATA.find(c => c.id === player.cosmetics.activeTitle), [player.cosmetics.activeTitle]);
    const activeFrame = useMemo(() => COSMETICS_DATA.find(c => c.id === player.cosmetics.activeFrame), [player.cosmetics.activeFrame]);
    const activeBackground = useMemo(() => COSMETICS_DATA.find(c => c.id === player.cosmetics.activeBackground), [player.cosmetics.activeBackground]);

    return (
      <div className="flex flex-col gap-4">
          {/* Avatar Card */}
          <div className={`shrink-0 relative rounded-2xl overflow-hidden border group shadow-2xl ${activeFrame?.value || 'border-white/10'}`}>
              <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/9] relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
                  <img 
                      src={activeBackground?.value || "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=800&auto=format&fit=crop"} 
                      alt="Hero" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  />
                  
                  <div className="absolute bottom-0 left-0 w-full p-4 z-20 flex items-end justify-between">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <TooltipTrigger content="Tu nivel actual. Sube XP completando misiones y ganando batallas.">
                                  <span className="px-2 py-0.5 bg-gold-600 text-black text-[10px] font-bold uppercase rounded shadow-lg cursor-help">Nvl {player.level}</span>
                              </TooltipTrigger>
                              <span className="text-slate-300 text-[10px] tracking-widest uppercase bg-black/60 px-2 py-0.5 rounded border border-white/10">
                                {activeTitle?.value || 'Sombra'}
                              </span>
                          </div>
                          <h2 className="font-serif text-2xl font-bold text-white text-shadow">{player.name}</h2>
                      </div>
                  </div>
              </div>
          </div>

          {/* Core Vitals */}
          <div className="grid grid-cols-3 gap-2">
              <TooltipTrigger content="Salud (HP). Si llega a 0, pierdes el combate.">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5 text-center cursor-help hover:bg-slate-800 transition-colors">
                      <Heart className="w-4 h-4 text-red-500 mx-auto mb-1" />
                      <div className="text-xs font-mono font-bold text-white">{Math.floor(player.hp)}</div>
                      <div className="text-[9px] text-slate-500 uppercase">Salud</div>
                  </div>
              </TooltipTrigger>
              <TooltipTrigger content="Energía. Se usa para viajar y aceptar misiones.">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5 text-center cursor-help hover:bg-slate-800 transition-colors">
                      <Zap className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <div className="text-xs font-mono font-bold text-white">{player.energy}</div>
                      <div className="text-[9px] text-slate-500 uppercase">Energía</div>
                  </div>
              </TooltipTrigger>
              <TooltipTrigger content="Experiencia. Necesaria para subir de nivel y desbloquear objetos.">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5 text-center cursor-help hover:bg-slate-800 transition-colors">
                      <Crown className="w-4 h-4 text-gold-500 mx-auto mb-1" />
                      <div className="text-xs font-mono font-bold text-white">{Math.floor((player.xp / player.maxXp) * 100)}%</div>
                      <div className="text-[9px] text-slate-500 uppercase">XP</div>
                  </div>
              </TooltipTrigger>
          </div>

          {/* Attribute Training */}
          <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 mb-1 mt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <BicepsFlexed className="w-3 h-3" /> Entrenamiento
                  </h3>
                  <span className="text-[10px] text-slate-500">Coste sube con el nivel</span>
              </div>
              
              <AttributeRow 
                  label="Fuerza" icon={Sword} color="text-orange-500"
                  description="Aumenta Daño Físico y Penetración de Armadura. Ideal para romper defensas."
                  baseVal={player.stats[StatType.STRENGTH]} totalVal={totalStats[StatType.STRENGTH]}
                  cost={calculateStatCost(player.stats[StatType.STRENGTH])}
                  canAfford={player.gold >= calculateStatCost(player.stats[StatType.STRENGTH])}
                  onTrain={() => onTrainStat(StatType.STRENGTH)}
              />
              <AttributeRow 
                  label="Destreza" icon={Wind} color="text-emerald-500"
                  description="Aumenta Crítico, Evasión y prob. de Golpe Doble. Counter de Magos."
                  baseVal={player.stats[StatType.DEXTERITY]} totalVal={totalStats[StatType.DEXTERITY]}
                  cost={calculateStatCost(player.stats[StatType.DEXTERITY])}
                  canAfford={player.gold >= calculateStatCost(player.stats[StatType.DEXTERITY])}
                  onTrain={() => onTrainStat(StatType.DEXTERITY)}
              />
              <AttributeRow 
                  label="Intelecto" icon={Brain} color="text-purple-500"
                  description="Aumenta Daño Mágico (ignora armadura) y crea una Barrera Arcana inicial."
                  baseVal={player.stats[StatType.INTELLIGENCE]} totalVal={totalStats[StatType.INTELLIGENCE]}
                  cost={calculateStatCost(player.stats[StatType.INTELLIGENCE])}
                  canAfford={player.gold >= calculateStatCost(player.stats[StatType.INTELLIGENCE])}
                  onTrain={() => onTrainStat(StatType.INTELLIGENCE)}
              />
              <AttributeRow 
                  label="Aguante" icon={Shield} color="text-slate-300"
                  description="Aumenta Salud Máxima, Armadura Física y Regeneración de vida por turno."
                  baseVal={player.stats[StatType.CONSTITUTION]} totalVal={totalStats[StatType.CONSTITUTION]}
                  cost={calculateStatCost(player.stats[StatType.CONSTITUTION])}
                  canAfford={player.gold >= calculateStatCost(player.stats[StatType.CONSTITUTION])}
                  onTrain={() => onTrainStat(StatType.CONSTITUTION)}
              />
          </div>
      </div>
    );
};

// Extracted Component: GearSection
const GearSection: React.FC<GearSectionProps> = ({ player, onEquipItem, onUnequipItem, onConsumeItem }) => {
    const equipConfig = [
        { type: ItemType.HELMET, icon: Crown, label: 'Cabeza' },
        { type: ItemType.WEAPON, icon: Sword, label: 'Arma' },
        { type: ItemType.ARMOR, icon: Shirt, label: 'Torso' },
        { type: ItemType.AMULET, icon: Gem, label: 'Cuello' },
        { type: ItemType.BOOTS, icon: Footprints, label: 'Pies' },
    ];

    // Echo Card Visual
    const EchoSlot = ({ echo }: { echo: Echo | null }) => (
        <div className={`
             relative aspect-square w-full rounded-xl overflow-hidden border transition-all
             ${echo 
                ? 'border-purple-500/50 bg-slate-900/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                : 'border-white/5 border-dashed bg-slate-900/40 hover:border-purple-500/30'
             }
        `}>
            {echo ? (
                <div className="w-full h-full relative">
                    <img src={echo.image} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent"></div>
                    <div className="absolute bottom-1 w-full text-center text-[9px] font-bold text-white truncate px-1">
                        {echo.name}
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-1">
                    <Infinity className="w-5 h-5 opacity-40 text-purple-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 text-center leading-none">Vínculo</span>
                </div>
            )}
        </div>
    );

    return (
      <div className="flex flex-col gap-6">
          {/* Equipment Slots (Paperdoll) */}
          <div className="shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                  <Shield className="w-4 h-4 text-gold-500" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Equipo Actual</h3>
              </div>
              <div className="grid grid-cols-6 gap-2 md:gap-4 bg-slate-900/40 p-3 md:p-5 rounded-2xl border border-white/5">
                  {equipConfig.map((slot) => (
                      <div key={slot.type} className="flex flex-col items-center gap-1">
                          <InventorySlot 
                              item={player.equipment[slot.type as keyof Equipment]} 
                              isEquipped 
                              label={slot.label}
                              placeholderIcon={slot.icon}
                              onClick={() => onUnequipItem(slot.type as any)}
                              player={player}
                          />
                      </div>
                  ))}
                  
                  {/* ECHO SLOT (NEW) */}
                  <div className="flex flex-col items-center gap-1">
                      <TooltipTrigger content={player.equippedEcho 
                          ? <div>
                                <h4 className="font-bold text-purple-400 mb-1">{player.equippedEcho.name}</h4>
                                <p className="text-xs italic text-slate-400 mb-2">{player.equippedEcho.lore}</p>
                                <div className="text-[10px] text-slate-300">{player.equippedEcho.passiveEffect}</div>
                            </div>
                          : "Eco del Vacío. Equipa un eco desde el Altar para ganar poderes pasivos."
                      }>
                        <div className="w-full h-full">
                            <EchoSlot echo={player.equippedEcho} />
                        </div>
                      </TooltipTrigger>
                  </div>
              </div>
          </div>

          {/* Inventory Grid */}
          <div className="flex flex-col bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden">
              <div className="shrink-0 p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-2">
                      <Backpack className="w-4 h-4 text-gold-500" />
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Mochila</h3>
                  </div>
                  <TooltipTrigger content="Límite de objetos. Vende los que no uses en el Mercader.">
                      <span className={`text-xs font-mono font-bold cursor-help ${player.inventory.length >= 20 ? 'text-red-400' : 'text-slate-500'}`}>
                          {player.inventory.length}/20
                      </span>
                  </TooltipTrigger>
              </div>
              
              <div className="p-3">
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                      {player.inventory.map((item) => (
                          <InventorySlot 
                              key={item.id} 
                              item={item} 
                              onClick={() => item.type === ItemType.FOOD ? onConsumeItem(item) : onEquipItem(item)}
                              player={player}
                          />
                      ))}
                      {/* Empty Slots Fillers */}
                      {[...Array(Math.max(0, 20 - player.inventory.length))].map((_, i) => (
                          <InventorySlot key={`empty-${i}`} />
                      ))}
                  </div>
              </div>
          </div>
      </div>
    );
};

const CosmeticSection: React.FC<{
  player: Player;
  onSetCosmetic: (type: 'TITLE' | 'FRAME' | 'BACKGROUND', id: string | null) => void;
}> = ({ player, onSetCosmetic }) => {
  const [filter, setFilter] = useState<'TITLE' | 'FRAME' | 'BACKGROUND'>('TITLE');

  const items = useMemo(() => COSMETICS_DATA.filter(c => c.type === filter), [filter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['TITLE', 'FRAME', 'BACKGROUND'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
              filter === t ? 'bg-gold-600 text-black border-gold-400' : 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-white/20'
            }`}
          >
            {t === 'TITLE' ? <Type className="w-3 h-3 mx-auto mb-1" /> : t === 'FRAME' ? <Frame className="w-3 h-3 mx-auto mb-1" /> : <ImageIcon className="w-3 h-3 mx-auto mb-1" />}
            {t === 'TITLE' ? 'Títulos' : t === 'FRAME' ? 'Marcos' : 'Fondos'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map(item => {
          const isUnlocked = player.cosmetics.unlockedIds.includes(item.id);
          const isActive = player.cosmetics.activeTitle === item.id || player.cosmetics.activeFrame === item.id || player.cosmetics.activeBackground === item.id;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isActive ? 'bg-gold-600/10 border-gold-500/50' : 'bg-slate-900/40 border-white/5'
              } ${!isUnlocked && 'opacity-50'}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isActive ? 'text-gold-400' : 'text-slate-200'}`}>{item.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${
                    item.rarity === 'Legendario' ? 'bg-orange-500/20 text-orange-400' : 
                    item.rarity === 'Épico' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.rarity}
                  </span>
                </div>
                {item.requirement && <p className="text-[10px] text-slate-500 mt-0.5">Req: {item.requirement}</p>}
              </div>

              {isUnlocked ? (
                <button
                  onClick={() => onSetCosmetic(item.type as any, item.id)}
                  disabled={isActive}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isActive ? 'Activo' : 'Usar'}
                </button>
              ) : (
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Bloqueado</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const ProfileView: React.FC<ProfileViewProps> = ({ player, onTrainStat, onEquipItem, onUnequipItem, onConsumeItem, onSetCosmetic }) => {
  const [activeTab, setActiveTab] = useState<'HERO' | 'GEAR' | 'COSMETICS'>('HERO'); // Mobile Tab State
  
  // Memoize Total Stats to avoid recalculation on unrelated renders
  const totalStats = useMemo(() => calculatePlayerTotalStats(player), [player.stats, player.equipment, player.equippedEcho]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20 md:pb-6">
      
      {/* 1. TOP HEADER (Wealth) */}
      <div className="shrink-0 grid grid-cols-3 gap-3">
         <TooltipTrigger content="Oro. Moneda común utilizada para entrenar atributos y comprar equipo básico en el Mercader.">
             <div className="bg-slate-900/80 border border-gold-500/20 p-2 md:p-3 rounded-xl flex items-center justify-between shadow-lg cursor-help">
                <div className="min-w-0">
                    <p className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest">Oro</p>
                    <p className="text-sm md:text-lg font-mono font-bold text-gold-400 leading-none truncate">{player.gold.toLocaleString()}</p>
                </div>
                <Coins className="w-4 h-4 md:w-5 md:h-5 text-gold-500 opacity-80" />
             </div>
         </TooltipTrigger>
         
         <TooltipTrigger content="Rubíes. Moneda premium. Úsala para recargar energía, refrescar misiones de la taberna o invocar Ecos.">
             <div className="bg-slate-900/80 border border-red-500/20 p-2 md:p-3 rounded-xl flex items-center justify-between shadow-lg cursor-help">
                <div className="min-w-0">
                    <p className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest">Rubíes</p>
                    <p className="text-sm md:text-lg font-mono font-bold text-red-400 leading-none truncate">{player.rubies.toLocaleString()}</p>
                </div>
                <Gem className="w-4 h-4 md:w-5 md:h-5 text-red-500 opacity-80" />
             </div>
         </TooltipTrigger>
         
         <TooltipTrigger content="Polvo Onírico. Obtenido al sacrificar Ecos. Se usa para invocaciones especiales.">
             <div className="bg-slate-900/80 border border-cyan-500/20 p-2 md:p-3 rounded-xl flex items-center justify-between shadow-lg cursor-help">
                <div className="min-w-0">
                    <p className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest">Polvo</p>
                    <p className="text-sm md:text-lg font-mono font-bold text-cyan-400 leading-none truncate">{player.voidDust.toLocaleString()}</p>
                </div>
                <Dna className="w-4 h-4 md:w-5 md:h-5 text-cyan-500 opacity-80" />
             </div>
         </TooltipTrigger>
      </div>

      {/* 2. MOBILE TABS TOGGLE (Visible only on mobile) */}
      <div className="md:hidden shrink-0 flex p-1 bg-slate-900 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('HERO')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'HERO' ? 'bg-slate-800 text-gold-400 shadow-md' : 'text-slate-500'}`}
          >
              Héroe
          </button>
          <button 
            onClick={() => setActiveTab('GEAR')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'GEAR' ? 'bg-slate-800 text-blue-400 shadow-md' : 'text-slate-500'}`}
          >
              Equipo
          </button>
          <button 
            onClick={() => setActiveTab('COSMETICS')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'COSMETICS' ? 'bg-slate-800 text-purple-400 shadow-md' : 'text-slate-500'}`}
          >
              Estilo
          </button>
      </div>

      {/* 3. MAIN CONTENT AREA (Split on Desktop, Swapped on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: HERO STATS */}
          <div className={`md:col-span-5 lg:col-span-4 ${activeTab === 'HERO' ? 'block' : 'hidden md:block'}`}>
              <HeroStatsSection 
                  player={player} 
                  totalStats={totalStats} 
                  onTrainStat={onTrainStat} 
              />
          </div>

          {/* RIGHT PANEL: GEAR & INVENTORY / COSMETICS */}
          <div className={`md:col-span-7 lg:col-span-8 ${activeTab === 'GEAR' || activeTab === 'COSMETICS' ? 'block' : 'hidden md:block'}`}>
              {activeTab === 'COSMETICS' ? (
                <CosmeticSection player={player} onSetCosmetic={onSetCosmetic} />
              ) : (
                <GearSection 
                  player={player} 
                  onEquipItem={onEquipItem} 
                  onUnequipItem={onUnequipItem} 
                  onConsumeItem={onConsumeItem} 
                />
              )}
          </div>

      </div>
    </div>
  );
};
