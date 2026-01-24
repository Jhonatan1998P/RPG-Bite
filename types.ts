
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

export interface Player {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  gold: number;
  rubies: number;
  voidDust: number; // Nueva moneda para Gacha/Crafteo
  stats: Stats;
  energy: number;
  maxEnergy: number;
  battleHistory: BattleLog[];
  inventory: Item[];
  equipment: Equipment;
  
  // Echoes System
  echoesInventory: Echo[];
  equippedEcho: Echo | null;
  pityCounter: number; // Contador para asegurado
  lastDailySummon: number; // Timestamp

  currentQuests: Quest[]; 
  nextArenaBattle: number; 
  nextTavernRefresh: number;
  // Arena Specs - MOVED INSIDE PLAYER FOR PERSISTENCE
  arenaRank: number; // 1 to 50
  arenaLeague: string; // ID of the league
  arenaLadder: ArenaOpponent[]; 
  // Merchant Specs
  merchantInventory: Item[];
  nextMerchantRefresh: number;
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
  GACHA = 'ALTAR' // Nueva vista
}
