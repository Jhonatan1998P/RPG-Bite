
import { StatType, ItemType, QuestRarity, EchoRarity, WorldEvent, EventType, MaterialType } from "../types";

// --- CRAFTING & MATERIALS ---

export const MATERIALS_CONFIG: Record<MaterialType, { name: string, rarity: QuestRarity, cost: number, description: string }> = {
    [MaterialType.SCRAP]: { name: "Chatarra", rarity: 'Común', cost: 5, description: "Restos de metal y tela inservibles." },
    [MaterialType.WOOD]: { name: "Madera Noble", rarity: 'Común', cost: 10, description: "Material básico para armas y estructuras." },
    [MaterialType.LEATHER]: { name: "Cuero Curtido", rarity: 'Poco Común', cost: 25, description: "Flexible y resistente." },
    [MaterialType.ORE]: { name: "Lingote de Hierro", rarity: 'Raro', cost: 50, description: "Metal refinado de alta calidad." },
    [MaterialType.ESSENCE]: { name: "Polvo Arcano", rarity: 'Épico', cost: 150, description: "Residuo mágico brillante." },
    [MaterialType.GEM]: { name: "Gema de Poder", rarity: 'Legendario', cost: 500, description: "Pulsante energía cristalizada." }
};

export const UPGRADE_CONFIG = {
    MAX_LEVEL: 10,
    BASE_COST_GOLD: 50,
    COST_MULTIPLIER: 1.5,
    STAT_GROWTH: 1.1 // 10% increase per level
};

// Key: ItemType -> Rarity -> Materials needed
export const CRAFTING_RECIPES: Record<string, Record<QuestRarity, Partial<Record<MaterialType, number>>>> = {
    [ItemType.WEAPON]: {
        'Común': { [MaterialType.WOOD]: 3, [MaterialType.SCRAP]: 2 },
        'Poco Común': { [MaterialType.WOOD]: 5, [MaterialType.ORE]: 2 },
        'Raro': { [MaterialType.WOOD]: 10, [MaterialType.ORE]: 5, [MaterialType.ESSENCE]: 1 },
        'Épico': { [MaterialType.WOOD]: 20, [MaterialType.ORE]: 10, [MaterialType.ESSENCE]: 5 },
        'Legendario': { [MaterialType.WOOD]: 50, [MaterialType.ORE]: 25, [MaterialType.ESSENCE]: 10, [MaterialType.GEM]: 1 }
    },
    [ItemType.ARMOR]: {
        'Común': { [MaterialType.SCRAP]: 5 },
        'Poco Común': { [MaterialType.LEATHER]: 3, [MaterialType.SCRAP]: 5 },
        'Raro': { [MaterialType.LEATHER]: 8, [MaterialType.ORE]: 2 },
        'Épico': { [MaterialType.LEATHER]: 15, [MaterialType.ORE]: 5, [MaterialType.ESSENCE]: 3 },
        'Legendario': { [MaterialType.LEATHER]: 30, [MaterialType.ORE]: 15, [MaterialType.ESSENCE]: 8, [MaterialType.GEM]: 1 }
    },
    [ItemType.HELMET]: {
        'Común': { [MaterialType.SCRAP]: 3 },
        'Poco Común': { [MaterialType.LEATHER]: 2, [MaterialType.SCRAP]: 3 },
        'Raro': { [MaterialType.LEATHER]: 5, [MaterialType.ORE]: 1 },
        'Épico': { [MaterialType.LEATHER]: 10, [MaterialType.ORE]: 3, [MaterialType.ESSENCE]: 2 },
        'Legendario': { [MaterialType.LEATHER]: 20, [MaterialType.ORE]: 8, [MaterialType.ESSENCE]: 5, [MaterialType.GEM]: 1 }
    },
    [ItemType.BOOTS]: {
        'Común': { [MaterialType.SCRAP]: 2, [MaterialType.LEATHER]: 1 },
        'Poco Común': { [MaterialType.LEATHER]: 3, [MaterialType.SCRAP]: 2 },
        'Raro': { [MaterialType.LEATHER]: 6, [MaterialType.ESSENCE]: 1 },
        'Épico': { [MaterialType.LEATHER]: 12, [MaterialType.ESSENCE]: 3 },
        'Legendario': { [MaterialType.LEATHER]: 25, [MaterialType.ESSENCE]: 8, [MaterialType.GEM]: 1 }
    },
    [ItemType.AMULET]: {
        'Común': { [MaterialType.SCRAP]: 5 },
        'Poco Común': { [MaterialType.ORE]: 2, [MaterialType.ESSENCE]: 1 },
        'Raro': { [MaterialType.ORE]: 5, [MaterialType.ESSENCE]: 3 },
        'Épico': { [MaterialType.ORE]: 10, [MaterialType.ESSENCE]: 8 },
        'Legendario': { [MaterialType.ORE]: 20, [MaterialType.ESSENCE]: 15, [MaterialType.GEM]: 2 }
    }
};

export const QUEST_TITLES_PREFIX = ['Ruinas', 'Bosque', 'Cripta', 'Torre', 'Caverna', 'Páramo', 'Ciudadela', 'Puerto', 'Laberinto', 'Abismo'];
export const QUEST_TITLES_SUFFIX = ['Olvidadas', 'Maldito', 'del Rey', 'Oscura', 'de Hielo', 'Ardiente', 'de Sombras', 'Muerto', 'del Vacío', 'Eterno'];

// --- GAMER TAG GENERATION DATA ---
export const GAMER_ROOTS = ['Azrael', 'Arkon', 'Blade', 'Chronos', 'Draven', 'Exar', 'Frost', 'Ghost', 'Hades', 'Ixion', 'Jax', 'Kael', 'Loki', 'Magnus', 'Nyx', 'Orion', 'Phantom', 'Ragnar', 'Shadow', 'Titan', 'Viper', 'Wolf', 'Xenos', 'Zed'];
export const GAMER_TAGS_PREFIX = ['xX', 'iAm', 'The', 'Da', 'Pro', 'Dr', 'Mr', 'Itz', 'Real', 'Dark', 'Lord'];
export const GAMER_TAGS_SUFFIX = ['_PvP', '_HD', '123', '99', 'God', 'King', 'Slayer'];

// --- WORLD EVENTS CONFIGURATION ---
export const GAME_EVENTS: WorldEvent[] = [
    {
        type: EventType.RUBY_HUNT,
        name: "Luna de Sangre",
        description: "El velo se debilita. 5% Probabilidad de encontrar Rubíes en misiones y arena.",
        color: "text-red-500",
        duration: 10 * 60 * 1000, // 10 Minutos
        multiplier: 0.05, // 5% chance
        iconName: 'Moon'
    },
    {
        type: EventType.GOLD_RUSH,
        name: "Fiebre del Oro",
        description: "Las rutas comerciales florecen. +50% de Oro obtenido.",
        color: "text-yellow-400",
        duration: 15 * 60 * 1000,
        multiplier: 1.5,
        iconName: 'Coins'
    },
    {
        type: EventType.XP_BOOST,
        name: "Iluminación Arcana",
        description: "Tu mente se expande. +50% Experiencia obtenida.",
        color: "text-blue-400",
        duration: 15 * 60 * 1000,
        multiplier: 1.5,
        iconName: 'Zap'
    },
    {
        type: EventType.DISCOUNT,
        name: "Mercado Negro",
        description: "Los instructores bajan sus precios. -30% Coste de entrenamiento.",
        color: "text-emerald-400",
        duration: 10 * 60 * 1000,
        multiplier: 0.7, // 30% discount = 0.7 multiplier
        iconName: 'TrendingDown'
    },
    {
        type: EventType.SPEED,
        name: "Vientos Alíseos",
        description: "El tiempo fluye rápido. Cooldowns reducidos a la mitad.",
        color: "text-cyan-400",
        duration: 10 * 60 * 1000,
        multiplier: 0.5,
        iconName: 'Wind'
    },
    {
        type: EventType.LUCKY_LOOT,
        name: "Fortuna Divina",
        description: "Los dioses sonríen. Mayor probabilidad de objetos y legendarios.",
        color: "text-purple-400",
        duration: 12 * 60 * 1000,
        multiplier: 2.0, // Double drop rate chance
        iconName: 'Sparkles'
    }
];


// --- ARENA CONFIGURATION ---

export const ENEMY_ARCHETYPES = [
    { 
        name: 'Titán', 
        description: 'Tanque Puro. Aguante extremo.', 
        icon: 'Shield', 
        weights: { [StatType.STRENGTH]: 0.1, [StatType.DEXTERITY]: 0.0, [StatType.INTELLIGENCE]: 0.0, [StatType.CONSTITUTION]: 0.9 } 
    }, 
    { 
        name: 'Gladiador', 
        description: 'Fuerza Bruta. Golpes devastadores.', 
        icon: 'Sword', 
        weights: { [StatType.STRENGTH]: 0.7, [StatType.DEXTERITY]: 0.1, [StatType.INTELLIGENCE]: 0.0, [StatType.CONSTITUTION]: 0.2 } 
    }, 
    { 
        name: 'Erudito', 
        description: 'Daño Mágico. Ignora armadura física.', 
        icon: 'Brain', 
        weights: { [StatType.STRENGTH]: 0.0, [StatType.DEXTERITY]: 0.1, [StatType.INTELLIGENCE]: 0.8, [StatType.CONSTITUTION]: 0.1 } 
    }, 
    { 
        name: 'Asesino', 
        description: 'Velocidad y Críticos.', 
        icon: 'Wind', 
        weights: { [StatType.STRENGTH]: 0.2, [StatType.DEXTERITY]: 0.7, [StatType.INTELLIGENCE]: 0.0, [StatType.CONSTITUTION]: 0.1 } 
    },
    { 
        name: 'Duelista', 
        description: 'Híbrido equilibrado.', 
        icon: 'Swords', 
        weights: { [StatType.STRENGTH]: 0.3, [StatType.DEXTERITY]: 0.3, [StatType.INTELLIGENCE]: 0.1, [StatType.CONSTITUTION]: 0.3 } 
    }
];

export interface League {
    id: string;
    name: string;
    rankIndex: number; // 0 to 9
    color: string;
    bgGradient: string;
    rewardsMult: number;
}

export const LEAGUES: League[] = [
    { id: 'WOOD', name: 'Madera', rankIndex: 0, color: 'text-amber-700', bgGradient: 'from-amber-950 to-slate-900', rewardsMult: 1.0 },
    { id: 'STONE', name: 'Piedra', rankIndex: 1, color: 'text-slate-400', bgGradient: 'from-slate-700 to-slate-900', rewardsMult: 1.2 },
    { id: 'IRON', name: 'Hierro', rankIndex: 2, color: 'text-slate-300', bgGradient: 'from-slate-600 to-slate-800', rewardsMult: 1.5 },
    { id: 'BRONZE', name: 'Bronce', rankIndex: 3, color: 'text-orange-600', bgGradient: 'from-orange-900 to-slate-900', rewardsMult: 2.0 },
    { id: 'SILVER', name: 'Plata', rankIndex: 4, color: 'text-slate-200', bgGradient: 'from-slate-400 to-slate-800', rewardsMult: 2.8 },
    { id: 'GOLD', name: 'Oro', rankIndex: 5, color: 'text-yellow-400', bgGradient: 'from-yellow-700 to-black', rewardsMult: 4.0 },
    { id: 'PLATINUM', name: 'Platino', rankIndex: 6, color: 'text-cyan-400', bgGradient: 'from-cyan-900 to-black', rewardsMult: 6.0 },
    { id: 'DIAMOND', name: 'Diamante', rankIndex: 7, color: 'text-blue-400', bgGradient: 'from-blue-900 to-black', rewardsMult: 9.0 },
    { id: 'MASTER', name: 'Maestro', rankIndex: 8, color: 'text-purple-400', bgGradient: 'from-purple-900 to-black', rewardsMult: 15.0 },
    { id: 'ETERNAL', name: 'Eterno', rankIndex: 9, color: 'text-red-500', bgGradient: 'from-red-950 to-black', rewardsMult: 25.0 },
];

// Nombres temáticos por liga (50 bots = se pueden repetir o combinar, aquí pondremos bases sólidas)
export const LEAGUE_NAMES: Record<string, string[]> = {
    'WOOD': ['Bandido Torpe', 'Rata Gigante', 'Vagabundo', 'Espantapájaros', 'Recluta Asustado', 'Ladrón de Gallinas', 'Borracho de Taberna', 'Escudero Novato', 'Granjerooj', 'Lobo Sarnoso', 'Duende Menor', 'Kobold Minero'],
    'STONE': ['Guardia de la Puerta', 'Mercenario Básico', 'Soldado Raso', 'Gargola de Piedra', 'Trol de Cueva', 'Ogro Joven', 'Guerrero de Arcilla', 'Golem Roto', 'Minero Enano', 'Berserker Novato'],
    'IRON': ['Caballero Errante', 'Inquisidor', 'Verdugo', 'Capitán de Guardia', 'Legionario', 'Centurión', 'Mercenario Veterano', 'Asesino a Sueldo', 'Mago de Batalla', 'Clérigo Oscuro'],
    'BRONZE': ['Campeón de la Arena', 'Gladiador Famoso', 'Bestia de Guerra', 'Señor de la Guerra', 'Samurai Caído', 'Vikingo', 'Espartano', 'Inmortal (Falso)', 'Ronin', 'Cazador de Cabezas'],
    'SILVER': ['Héroe Local', 'Paladín Real', 'Archimago', 'Sombra Veloz', 'Maestro de Espadas', 'General', 'Alto Inquisidor', 'Druida Anciano', 'Vampiro Joven', 'Licántropo Alfa'],
    'GOLD': ['Leyenda Viviente', 'Rey Bandido', 'Dragón Humanoide', 'Lich Menor', 'Santo de la Espada', 'Valquiria', 'Caballero del Dragón', 'Señor de las Bestias', 'Oráculo', 'Espectro Real'],
    'PLATINUM': ['Héroe Antiguo', 'Semidiós Olvidado', 'Ángel Caído', 'Demonio Mayor', 'Titán de Acero', 'Avatar de la Tormenta', 'Fénix Renacido', 'Señor del Trueno', 'Guardiana del Bosque', 'Emperador'],
    'DIAMOND': ['Dios Menor', 'Devorador de Almas', 'Rey Exánime', 'Leviatán', 'Behemoth', 'Kraken Humanoide', 'Seraphim', 'Archidemonio', 'Conquistador de Mundos', 'Heraldo del Fin'],
    'MASTER': ['Cronos', 'Destructor', 'El Fin', 'La Nada', 'Caos Primordial', 'Orden Absoluto', 'Verdad Dolorosa', 'Muerte Encarnada', 'Vida Eterna', 'El Juez'],
    'ETERNAL': ['EL CREADOR', 'LA SOMBRA ETERNA', 'SINGULARIDAD', 'EL VACÍO', 'OMEGA', 'ALFA', 'EL ARQUITECTO', 'NÉMESIS FINAL', 'DIOS DE DIOSES', 'ABSOLUTO']
};


// --- PROCEDURAL ITEM GENERATION CONSTANTS ---

export interface ItemTemplate {
    type: ItemType;
    subtype: string;
    baseStat: StatType;
    baseVal: number;
    nameTemplate: string;
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
    // Weapons - Strength
    { type: ItemType.WEAPON, subtype: 'sword', baseStat: StatType.STRENGTH, baseVal: 14, nameTemplate: "Espada" },
    { type: ItemType.WEAPON, subtype: 'axe', baseStat: StatType.STRENGTH, baseVal: 18, nameTemplate: "Hacha" },
    { type: ItemType.WEAPON, subtype: 'mace', baseStat: StatType.STRENGTH, baseVal: 16, nameTemplate: "Maza" },
    { type: ItemType.WEAPON, subtype: 'greatsword', baseStat: StatType.STRENGTH, baseVal: 22, nameTemplate: "Mandoble" },

    // Weapons - Dexterity
    { type: ItemType.WEAPON, subtype: 'dagger', baseStat: StatType.DEXTERITY, baseVal: 10, nameTemplate: "Daga" },
    { type: ItemType.WEAPON, subtype: 'bow', baseStat: StatType.DEXTERITY, baseVal: 12, nameTemplate: "Arco" },
    { type: ItemType.WEAPON, subtype: 'spear', baseStat: StatType.DEXTERITY, baseVal: 15, nameTemplate: "Lanza" },
    { type: ItemType.WEAPON, subtype: 'katana', baseStat: StatType.DEXTERITY, baseVal: 16, nameTemplate: "Katana" },

    // Weapons - Intelligence
    { type: ItemType.WEAPON, subtype: 'staff', baseStat: StatType.INTELLIGENCE, baseVal: 16, nameTemplate: "Bastón" },
    { type: ItemType.WEAPON, subtype: 'wand', baseStat: StatType.INTELLIGENCE, baseVal: 12, nameTemplate: "Varita" },
    { type: ItemType.WEAPON, subtype: 'book', baseStat: StatType.INTELLIGENCE, baseVal: 10, nameTemplate: "Grimorio" },
    { type: ItemType.WEAPON, subtype: 'orb', baseStat: StatType.INTELLIGENCE, baseVal: 14, nameTemplate: "Orbe" },

    // Armor
    { type: ItemType.ARMOR, subtype: 'heavy', baseStat: StatType.CONSTITUTION, baseVal: 20, nameTemplate: "Placas" },
    { type: ItemType.ARMOR, subtype: 'mail', baseStat: StatType.CONSTITUTION, baseVal: 16, nameTemplate: "Cota de Malla" },
    { type: ItemType.ARMOR, subtype: 'light', baseStat: StatType.DEXTERITY, baseVal: 12, nameTemplate: "Cuero" },
    { type: ItemType.ARMOR, subtype: 'robe', baseStat: StatType.INTELLIGENCE, baseVal: 10, nameTemplate: "Túnica" },

    // Helmets
    { type: ItemType.HELMET, subtype: 'helm', baseStat: StatType.CONSTITUTION, baseVal: 10, nameTemplate: "Yelmo" },
    { type: ItemType.HELMET, subtype: 'hood', baseStat: StatType.DEXTERITY, baseVal: 8, nameTemplate: "Capucha" },
    { type: ItemType.HELMET, subtype: 'crown', baseStat: StatType.INTELLIGENCE, baseVal: 8, nameTemplate: "Corona" },

    // Boots
    { type: ItemType.BOOTS, subtype: 'boots', baseStat: StatType.DEXTERITY, baseVal: 6, nameTemplate: "Botas" },
    { type: ItemType.BOOTS, subtype: 'greaves', baseStat: StatType.STRENGTH, baseVal: 8, nameTemplate: "Grebas" },

    // Amulets
    { type: ItemType.AMULET, subtype: 'ring', baseStat: StatType.INTELLIGENCE, baseVal: 5, nameTemplate: "Anillo" },
    { type: ItemType.AMULET, subtype: 'necklace', baseStat: StatType.CONSTITUTION, baseVal: 6, nameTemplate: "Colgante" },

    // Consumables
    { type: ItemType.FOOD, subtype: 'bread', baseStat: StatType.CONSTITUTION, baseVal: 5, nameTemplate: "Pan de Viaje" },
    { type: ItemType.FOOD, subtype: 'stew', baseStat: StatType.CONSTITUTION, baseVal: 10, nameTemplate: "Guiso Espeso" },
    { type: ItemType.FOOD, subtype: 'roast', baseStat: StatType.CONSTITUTION, baseVal: 15, nameTemplate: "Asado Real" },
];

export const RARITY_CONFIG: Record<QuestRarity, { mult: number, probability: number, slots: number, color: string }> = {
    'Común': { mult: 1.0, probability: 0.50, slots: 0, color: 'text-slate-400' },
    'Poco Común': { mult: 1.25, probability: 0.30, slots: 1, color: 'text-green-400' },
    'Raro': { mult: 1.6, probability: 0.15, slots: 2, color: 'text-blue-400' },
    'Épico': { mult: 2.2, probability: 0.04, slots: 3, color: 'text-purple-400' },
    'Legendario': { mult: 3.5, probability: 0.01, slots: 4, color: 'text-orange-400' }
};

export const AFFIXES = {
    PREFIXES: [
        // Generic High Tier
        { name: "Divina", stat: StatType.STRENGTH, mod: 1.5, allowedTypes: [] },
        { name: "Eterna", stat: StatType.CONSTITUTION, mod: 1.5, allowedTypes: [] },
        { name: "Infernal", stat: StatType.INTELLIGENCE, mod: 1.5, allowedTypes: [] },

        // Strength / Heavy
        { name: "Pesada", stat: StatType.STRENGTH, mod: 1.1, allowedTypes: [ItemType.ARMOR, ItemType.WEAPON] },
        { name: "Brutal", stat: StatType.STRENGTH, mod: 1.2, allowedTypes: [ItemType.WEAPON] },
        { name: "Titánica", stat: StatType.STRENGTH, mod: 1.3, allowedTypes: [ItemType.ARMOR] },
        { name: "Férrea", stat: StatType.CONSTITUTION, mod: 1.1, allowedTypes: [ItemType.ARMOR, ItemType.HELMET] },

        // Dexterity / Light
        { name: "Ágil", stat: StatType.DEXTERITY, mod: 1.1, allowedTypes: [ItemType.BOOTS, ItemType.WEAPON] },
        { name: "Sutil", stat: StatType.DEXTERITY, mod: 1.1, allowedTypes: [ItemType.ARMOR] },
        { name: "Veloz", stat: StatType.DEXTERITY, mod: 1.2, allowedTypes: [ItemType.BOOTS, ItemType.WEAPON] },
        { name: "Mortal", stat: StatType.DEXTERITY, mod: 1.3, allowedTypes: [ItemType.WEAPON] },

        // Intelligence / Magic
        { name: "Arcana", stat: StatType.INTELLIGENCE, mod: 1.1, allowedTypes: [ItemType.WEAPON, ItemType.AMULET] },
        { name: "Mística", stat: StatType.INTELLIGENCE, mod: 1.2, allowedTypes: [ItemType.HELMET, ItemType.AMULET] },
        { name: "Etérea", stat: StatType.INTELLIGENCE, mod: 1.3, allowedTypes: [ItemType.ARMOR, ItemType.WEAPON] },
        { name: "Sabia", stat: StatType.INTELLIGENCE, mod: 1.1, allowedTypes: [ItemType.HELMET] },

        // Defense
        { name: "Robusta", stat: StatType.CONSTITUTION, mod: 1.1, allowedTypes: [ItemType.ARMOR] },
        { name: "Impenetrable", stat: StatType.CONSTITUTION, mod: 1.3, allowedTypes: [ItemType.ARMOR, ItemType.HELMET] },
    ],
    SUFFIXES: [
        { name: "del Oso", stat: StatType.CONSTITUTION, mod: 1.1 },
        { name: "del Tigre", stat: StatType.STRENGTH, mod: 1.1 },
        { name: "del Halcón", stat: StatType.DEXTERITY, mod: 1.1 },
        { name: "del Búho", stat: StatType.INTELLIGENCE, mod: 1.1 },
        { name: "del Dragón", stat: StatType.STRENGTH, mod: 1.3 },
        { name: "del Vacío", stat: StatType.INTELLIGENCE, mod: 1.3 },
        { name: "de la Tormenta", stat: StatType.DEXTERITY, mod: 1.2 },
        { name: "del Volcán", stat: StatType.STRENGTH, mod: 1.2 },
        { name: "del Mar Profundo", stat: StatType.INTELLIGENCE, mod: 1.2 },
        { name: "de la Montaña", stat: StatType.CONSTITUTION, mod: 1.2 },
        { name: "del Verdugo", stat: StatType.STRENGTH, mod: 1.4 },
        { name: "del Asesino", stat: StatType.DEXTERITY, mod: 1.4 },
        { name: "del Archimago", stat: StatType.INTELLIGENCE, mod: 1.4 },
        { name: "del Inmortal", stat: StatType.CONSTITUTION, mod: 1.4 },
    ]
};

export const ITEM_ASSETS: Record<string, string[]> = {
    'sword': ["https://images.unsplash.com/photo-1595590424283-b8f17842773f?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1589993356658-963d89856e72?q=80&w=200&auto=format&fit=crop"],
    'axe': ["https://images.unsplash.com/photo-1593175866164-323e06f97f8c?q=80&w=200&auto=format&fit=crop"],
    'dagger': ["https://images.unsplash.com/photo-1615672968436-3b7c2b5d4361?q=80&w=200&auto=format&fit=crop"],
    'staff': ["https://images.unsplash.com/photo-1535581652167-3d6b9bc27633?q=80&w=200&auto=format&fit=crop"],
    'armor': ["https://images.unsplash.com/photo-1445633760012-6eb6d31849a6?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1549488347-194165d2df89?q=80&w=200&auto=format&fit=crop"],
    'helmet': ["https://images.unsplash.com/photo-1509623233860-2525492d501b?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1565551829623-e4c19790604e?q=80&w=200&auto=format&fit=crop"],
    'boots': ["https://images.unsplash.com/photo-1605218427306-0222070cca9a?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1559563458-52c69c8e3079?q=80&w=200&auto=format&fit=crop"],
    'amulet': ["https://images.unsplash.com/photo-1605218456209-642594582f6e?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1616773539828-56890333066a?q=80&w=200&auto=format&fit=crop"],
    'bread': ["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop"],
    'stew': ["https://images.unsplash.com/photo-1547592166-23acbe346499?q=80&w=200&auto=format&fit=crop"],
    'roast': ["https://images.unsplash.com/photo-1532592333381-a12f8480d2ad?q=80&w=200&auto=format&fit=crop"]
};

// --- GACHA (ECHOES) SYSTEM CONSTANTS ---

export interface EchoTemplate {
    id: string;
    name: string;
    rarity: EchoRarity;
    stats: Partial<Record<StatType, number>>;
    passiveEffect: string;
    image: string;
    lore: string;
}

export const GACHA_CONFIG = {
    COST_RUBIES: 100,
    COST_DUST: 50,
    DUST_PER_BURN: { 'Marchito': 5, 'Resonante': 20, 'Luminoso': 100, 'Ascendido': 500 },
    PROBABILITIES: { 'Ascendido': 0.01, 'Luminoso': 0.05, 'Resonante': 0.20, 'Marchito': 0.74 },
    PITY_THRESHOLD: 20
};

export const ECHO_TEMPLATES: EchoTemplate[] = [
    { id: 'echo_dragon', name: 'Corazón del Dragón', rarity: 'Ascendido', stats: { [StatType.STRENGTH]: 20, [StatType.CONSTITUTION]: 15 }, passiveEffect: 'Tus ataques ignoran el 20% de la armadura rival.', image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=400&auto=format&fit=crop', lore: 'El latido de una bestia antigua que se niega a morir.' },
    { id: 'echo_lich', name: 'Susurro del Lich', rarity: 'Ascendido', stats: { [StatType.INTELLIGENCE]: 25, [StatType.CONSTITUTION]: 10 }, passiveEffect: 'Inicias el combate con un escudo del 25% de tu HP.', image: 'https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=400&auto=format&fit=crop', lore: 'El conocimiento prohibido tiene un precio gélido.' },
    { id: 'echo_assassin', name: 'Sombra Silenciosa', rarity: 'Ascendido', stats: { [StatType.DEXTERITY]: 22, [StatType.STRENGTH]: 12 }, passiveEffect: '+15% Probabilidad de Crítico.', image: 'https://images.unsplash.com/photo-1533518463841-d62e1fc91373?q=80&w=400&auto=format&fit=crop', lore: 'Nadie la vio llegar. Nadie la vio irse.' },
    { id: 'echo_bear', name: 'Espíritu del Oso', rarity: 'Luminoso', stats: { [StatType.CONSTITUTION]: 18 }, passiveEffect: 'Gran aumento de vitalidad.', image: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=400&auto=format&fit=crop', lore: 'Furia inquebrantable de la naturaleza.' },
    { id: 'echo_storm', name: 'Ojo de la Tormenta', rarity: 'Luminoso', stats: { [StatType.INTELLIGENCE]: 15, [StatType.DEXTERITY]: 5 }, passiveEffect: 'Tus hechizos golpean con precisión.', image: 'https://images.unsplash.com/photo-1534274988754-c6a60bf93c61?q=80&w=400&auto=format&fit=crop', lore: 'El caos controlado es la verdadera magia.' },
    { id: 'echo_berserker', name: 'Furia Sangrienta', rarity: 'Luminoso', stats: { [StatType.STRENGTH]: 16, [StatType.CONSTITUTION]: 4 }, passiveEffect: 'Daño bruto puro.', image: 'https://images.unsplash.com/photo-1590625902919-21d17d23f79d?q=80&w=400&auto=format&fit=crop', lore: 'Golpear primero. Golpear fuerte.' },
    { id: 'echo_wolf', name: 'Colmillo de Lobo', rarity: 'Resonante', stats: { [StatType.DEXTERITY]: 10 }, passiveEffect: 'Agilidad mejorada.', image: '', lore: 'Caza en manada.' },
    { id: 'echo_golem', name: 'Núcleo de Piedra', rarity: 'Resonante', stats: { [StatType.CONSTITUTION]: 10 }, passiveEffect: 'Piel dura.', image: '', lore: 'Inamovible.' },
    { id: 'echo_ember', name: 'Ascua Eterna', rarity: 'Resonante', stats: { [StatType.INTELLIGENCE]: 10 }, passiveEffect: 'Mente ardiente.', image: '', lore: 'Pequeña pero peligrosa.' },
    { id: 'echo_steel', name: 'Voluntad de Acero', rarity: 'Resonante', stats: { [StatType.STRENGTH]: 10 }, passiveEffect: 'Golpes sólidos.', image: '', lore: 'Forjado en batalla.' },
    { id: 'echo_wisp', name: 'Fuego Fatuo', rarity: 'Marchito', stats: { [StatType.INTELLIGENCE]: 4 }, passiveEffect: 'Brillo tenue.', image: '', lore: 'Apenas una chispa.' },
    { id: 'echo_rat', name: 'Astucia de Rata', rarity: 'Marchito', stats: { [StatType.DEXTERITY]: 4 }, passiveEffect: 'Rapidez básica.', image: '', lore: 'Sobrevivir es ganar.' },
    { id: 'echo_boar', name: 'Cuero de Jabalí', rarity: 'Marchito', stats: { [StatType.CONSTITUTION]: 4 }, passiveEffect: 'Resistencia leve.', image: '', lore: 'Gruñidos y golpes.' },
    { id: 'echo_club', name: 'Fuerza Bruta', rarity: 'Marchito', stats: { [StatType.STRENGTH]: 4 }, passiveEffect: 'Empuje simple.', image: '', lore: 'Sin técnica.' },
];
