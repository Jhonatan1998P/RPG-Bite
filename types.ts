
export enum StatType {
  STRENGTH = 'Fuerza',
  DEXTERITY = 'Destreza',
  INTELLIGENCE = 'Inteligencia',
  CONSTITUTION = 'Constitución'
}

export interface Stats {
  [StatType.STRENGTH]: number;
  [StatType.DEXTERITY]: number;
  [StatType.INTELLIGENCE]: number;
  [StatType.CONSTITUTION]: number;
}

export enum ItemType {
  WEAPON = 'Arma',
  HELMET = 'Casco',
  ARMOR = 'Armadura',
  BOOTS = 'Botas',
  AMULET = 'Amuleto',
  POTION = 'Poción',
  FOOD = 'Comida'
}

export enum MaterialType {
  SCRAP = 'Chatarra',
  WOOD = 'Madera',
  ORE = 'Mineral',
  LEATHER = 'Cuero',
  ESSENCE = 'Esencia Mágica',
  GEM = 'Gema'
}

export type QuestRarity = 'Común' | 'Poco Común' | 'Raro' | 'Épico' | 'Legendario';
export type EchoRarity = 'Marchito' | 'Resonante' | 'Luminoso' | 'Ascendido';

export interface Item {
  id: string;
  name: string;
  level: number;
  type: ItemType;
  subtype?: string;
  rarity: QuestRarity;
  cost: number;
  stats: Partial<Stats>;
  image?: string;
  description: string;
  upgradeLevel?: number; // 0 to 10+
}

export interface Echo {
    id: string;
    templateId: string;
    name: string;
    rarity: EchoRarity;
    stats: Partial<Stats>;
    passiveEffect?: string; // Descripción del efecto especial
    image: string;
    lore: string;
}

export interface Equipment {
  [ItemType.WEAPON]: Item | null;
  [ItemType.HELMET]: Item | null;
  [ItemType.ARMOR]: Item | null;
  [ItemType.BOOTS]: Item | null;
  [ItemType.AMULET]: Item | null;
}

export interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  stats: Stats;
  classArchetype?: string;
  arenaRank?: number; // Position in ladder
  difficultyRating?: number;
}

export interface ArenaOpponent extends Enemy {
    id: string;
    winChance: number;
    pointsReward: number; // Used for XP calculation now
    goldReward: number;
    isPlayer?: boolean; // To mark the player in the ladder
}

// --- WORLD EVENTS ---
export enum EventType {
    GOLD_RUSH = 'FIEBRE_ORO',
    XP_BOOST = 'ILUMINACION',
    RUBY_HUNT = 'LUNA_SANGRE', // El evento de rubíes
    DISCOUNT = 'MERCADO_NEGRO',
    SPEED = 'VIENTO_VELOZ',
    LUCKY_LOOT = 'FORTUNA_DIVINA'
}

export interface WorldEvent {
    type: EventType;
    name: string;
    description: string;
    color: string; // Tailwind color class for UI
    duration: number; // Ms
    multiplier: number; // Generic multiplier for the logic to use
    iconName: string; // Icon identifier
}

export interface Cosmetic {
  id: string;
  name: string;
  type: 'TITLE' | 'FRAME' | 'BACKGROUND';
  value: string; // The CSS class, color, or image URL
  rarity: QuestRarity;
  requirement?: string;
}

export interface Player {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  gold: number;
  rubies: number;
  voidDust: number; 
  stats: Stats;
  energy: number;
  maxEnergy: number;
  battleHistory: BattleLog[];
  inventory: Item[];
  equipment: Equipment;
  
  // Echoes System
  echoesInventory: Echo[];
  equippedEcho: Echo | null;
  pityCounter: number; 
  lastDailySummon: number; 

  // World Event System
  activeEvent: WorldEvent | null;
  eventEndTime: number;
  nextEventCheck: number; // Timestamp to roll for next event

  // Cosmetics System
  cosmetics: {
    unlockedIds: string[];
    activeTitle: string | null;
    activeFrame: string | null;
    activeBackground: string | null;
  };

  currentQuests: Quest[]; 
  nextArenaBattle: number; 
  nextTavernRefresh: number;
  arenaRank: number; 
  arenaLeague: string; 
  arenaLadder: ArenaOpponent[]; 
  merchantInventory: Item[];
  nextMerchantRefresh: number;

  // Crafting System
  materials: Record<MaterialType, number>;
}

export interface Quest {
  id: string;
  title: string;
  rarity: QuestRarity;
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Mortal';
  duration: number;
  goldReward: number;
  xpReward: number;
  energyCost: number;
  description: string;
  recommendedStat: StatType;
  itemReward?: Item;
  materialReward?: { type: MaterialType, amount: number };
}

export interface BattleTurn {
    text: string;
    attacker: 'player' | 'enemy';
    damage: number;
    isCrit: boolean;
    isMiss: boolean;
    playerHp: number;
    enemyHp: number;
}

export interface CombatResult {
    isVictory: boolean;
    rounds: number;
    remainingHp: number;
    turns: BattleTurn[];
    loot?: { item?: Item, material?: { type: MaterialType, amount: number } };
}

export interface BattleLog {
  id: string;
  timestamp: Date;
  enemyName: string;
  enemyLevel: number;
  result: 'VICTORIA' | 'DERROTA';
  goldChange: number;
  xpChange: number;
  details: string;
  roundsTaken: number;
  turns: BattleTurn[];
  rankChange?: number; // How many positions climbed
  loot?: { item?: Item, material?: { type: MaterialType, amount: number } };
}

export enum ViewState {
  WELCOME = 'BIENVENIDA',
  PROFILE = 'PERFIL',
  TAVERN = 'TABERNA',
  ARENA = 'ARENA',
  RANKINGS = 'RANKINGS',
  BATTLE = 'BATALLA',
  REPORTS = 'INFORMES',
  MERCHANT = 'MERCADER',
  GACHA = 'ALTAR',
  FORGE = 'HERRERIA'
}
