
import { StatType, ItemType, QuestRarity, EchoRarity } from "../types";

export const QUEST_TITLES_PREFIX = ['Ruinas', 'Bosque', 'Cripta', 'Torre', 'Caverna', 'Páramo', 'Ciudadela', 'Puerto', 'Laberinto', 'Abismo'];
export const QUEST_TITLES_SUFFIX = ['Olvidadas', 'Maldito', 'del Rey', 'Oscura', 'de Hielo', 'Ardiente', 'de Sombras', 'Muerto', 'del Vacío', 'Eterno'];

// --- GAMER TAG GENERATION DATA ---

export const GAMER_ROOTS = [
    // A-E
    'Azrael', 'Arkon', 'Abyss', 'Asura', 'Ares', 'Akira',
    'Blade', 'Bane', 'Blood', 'Beast', 'Baron',
    'Chronos', 'Cypher', 'Chaos', 'Crow', 'Crixus',
    'Draven', 'Dante', 'Doom', 'Drift', 'Draco', 'Dreus',
    'Exar', 'Eclipse', 'Enigma', 'Eternum',
    // F-J
    'Frost', 'Fenris', 'Falcon', 'Fate', 'Fury',
    'Ghost', 'Grim', 'Gore', 'Glitch', 'Goku',
    'Hades', 'Havoc', 'Hydra', 'Hawk', 'Hunter',
    'Ixion', 'Inferno', 'Iron', 'Ice',
    'Jax', 'Jinx', 'Joker',
    // K-O
    'Kael', 'Kratos', 'Kronos', 'Kane', 'Kirito', 'Killa',
    'Loki', 'Lucius', 'Luna', 'Legend', 'Lord',
    'Magnus', 'Morpheus', 'Mist', 'Maverick',
    'Nyx', 'Neo', 'Nexus', 'Nova', 'Nemesis', 'Ninja',
    'Orion', 'Omega', 'Onyx', 'Overlord',
    // P-T
    'Phantom', 'Pyro', 'Prime', 'Pain',
    'Quake',
    'Ragnar', 'Raven', 'Raze', 'Ryze', 'Reaper', 'Ronin',
    'Shadow', 'Storm', 'Stryker', 'Snake', 'Slayer', 'Specter', 'Sypher',
    'Titan', 'Talon', 'Thor', 'Thorne', 'Toxic',
    // U-Z
    'Ultra', 'Umbra',
    'Viper', 'Void', 'Venom', 'Vortex', 'Vader',
    'Wolf', 'Wrath', 'Wraith', 'Wick',
    'Xenos', 'Xar', 'Xion', 'Xerxes',
    'Yuki', 'Ymir',
    'Zed', 'Zephyr', 'Zero', 'Zeus', 'Zod'
];

export const GAMER_TAGS_PREFIX = [
    'xX', 'Xx', 'iAm', 'The', 'Da', 'Pro', 'Dr', 'Mr', 'Itz', 'Real', 'Dark', 'Lord', 'PvP_', 'FaZe_', 'SK_', 'OG_'
];

export const GAMER_TAGS_SUFFIX = [
    'Xx', 'xX', '_PvP', '_HD', '_YT', '_TV', '123', '99', '23', '07', '69', '420', '3000', 'God', 'King', 'Pro', 'Slayer', 'Gaming', 'Plays'
];

export const ENEMY_ARCHETYPES = [
    // CLÁSICOS
    { name: 'Coloso', description: 'Tanque Puro (Alta CON)', icon: 'Shield', weights: { [StatType.STRENGTH]: 0.2, [StatType.DEXTERITY]: 0.0, [StatType.INTELLIGENCE]: 0.0, [StatType.CONSTITUTION]: 0.8 } }, 
    { name: 'Bruto', description: 'Daño Físico (Alta STR)', icon: 'Sword', weights: { [StatType.STRENGTH]: 0.6, [StatType.DEXTERITY]: 0.1, [StatType.INTELLIGENCE]: 0.0, [StatType.CONSTITUTION]: 0.3 } }, 
    { name: 'Mago', description: 'Daño Mágico (Alta INT)', icon: 'Brain', weights: { [StatType.STRENGTH]: 0.0, [StatType.DEXTERITY]: 0.2, [StatType.INTELLIGENCE]: 0.7, [StatType.CONSTITUTION]: 0.1 } }, 
    { name: 'Pícaro', description: 'Velocidad (Alta DEX)', icon: 'Wind', weights: { [StatType.STRENGTH]: 0.2, [StatType.DEXTERITY]: 0.7, [StatType.INTELLIGENCE]: 0.0, [StatType.CONSTITUTION]: 0.1 } },
    
    // HÍBRIDOS (NUEVOS)
    { name: 'Paladín', description: 'Tanque Mágico (CON + INT)', icon: 'Shield', weights: { [StatType.STRENGTH]: 0.2, [StatType.DEXTERITY]: 0.0, [StatType.INTELLIGENCE]: 0.4, [StatType.CONSTITUTION]: 0.4 } },
    { name: 'Asesino', description: 'Burst Físico (STR + DEX)', icon: 'Sword', weights: { [StatType.STRENGTH]: 0.4, [StatType.DEXTERITY]: 0.4, [StatType.INTELLIGENCE]: 0.0, [StatType.CONSTITUTION]: 0.2 } },
    { name: 'Duelista', description: 'Velocidad Mágica (DEX + INT)', icon: 'Wind', weights: { [StatType.STRENGTH]: 0.0, [StatType.DEXTERITY]: 0.5, [StatType.INTELLIGENCE]: 0.4, [StatType.CONSTITUTION]: 0.1 } }
];

export interface League {
    id: string;
    name: string;
    minScore: number;
    maxScore: number;
    color: string;
    iconColor: string;
    bgGradient: string;
    rewardsMult: number;
}

export const LEAGUES: League[] = [
    { id: 'INITIATE', name: 'Iniciado', minScore: 0, maxScore: 999, color: 'text-slate-400', iconColor: 'bg-slate-500', bgGradient: 'from-slate-800 to-slate-900', rewardsMult: 1.0 },
    { id: 'BRONZE', name: 'Bronce', minScore: 1000, maxScore: 1999, color: 'text-orange-400', iconColor: 'bg-orange-600', bgGradient: 'from-orange-950 to-slate-900', rewardsMult: 1.2 },
    { id: 'SILVER', name: 'Plata', minScore: 2000, maxScore: 2999, color: 'text-slate-200', iconColor: 'bg-slate-300', bgGradient: 'from-slate-700 to-slate-900', rewardsMult: 1.4 },
    { id: 'GOLD', name: 'Oro', minScore: 3000, maxScore: 3999, color: 'text-yellow-400', iconColor: 'bg-yellow-500', bgGradient: 'from-yellow-900 to-slate-900', rewardsMult: 1.6 },
    { id: 'PLATINUM', name: 'Platino', minScore: 4000, maxScore: 4999, color: 'text-cyan-400', iconColor: 'bg-cyan-500', bgGradient: 'from-cyan-900 to-slate-900', rewardsMult: 1.8 },
    { id: 'DIAMOND', name: 'Diamante', minScore: 5000, maxScore: 5999, color: 'text-blue-400', iconColor: 'bg-blue-600', bgGradient: 'from-blue-900 to-slate-900', rewardsMult: 2.2 },
    { id: 'SHADOW', name: 'Sombra Eterna', minScore: 6000, maxScore: 99999, color: 'text-purple-400', iconColor: 'bg-purple-600', bgGradient: 'from-purple-950 to-black', rewardsMult: 3.0 },
];


// --- PROCEDURAL ITEM GENERATION CONSTANTS ---

export interface ItemTemplate {
    type: ItemType;
    subtype: string;
    baseStat: StatType;
    baseVal: number;
    nameTemplate: string; // e.g. "Espada"
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
    // WEAPONS (Base bumped for new combat system)
    { type: ItemType.WEAPON, subtype: 'sword', baseStat: StatType.STRENGTH, baseVal: 14, nameTemplate: "Espada" },
    { type: ItemType.WEAPON, subtype: 'axe', baseStat: StatType.STRENGTH, baseVal: 18, nameTemplate: "Hacha" },
    { type: ItemType.WEAPON, subtype: 'dagger', baseStat: StatType.DEXTERITY, baseVal: 10, nameTemplate: "Daga" },
    { type: ItemType.WEAPON, subtype: 'bow', baseStat: StatType.DEXTERITY, baseVal: 12, nameTemplate: "Arco" },
    { type: ItemType.WEAPON, subtype: 'staff', baseStat: StatType.INTELLIGENCE, baseVal: 16, nameTemplate: "Bastón" },
    { type: ItemType.WEAPON, subtype: 'wand', baseStat: StatType.INTELLIGENCE, baseVal: 12, nameTemplate: "Varita" },
    
    // ARMOR (Armor is valuable now)
    { type: ItemType.ARMOR, subtype: 'heavy', baseStat: StatType.CONSTITUTION, baseVal: 20, nameTemplate: "Placas" },
    { type: ItemType.ARMOR, subtype: 'light', baseStat: StatType.DEXTERITY, baseVal: 12, nameTemplate: "Cuero" },
    { type: ItemType.ARMOR, subtype: 'robe', baseStat: StatType.INTELLIGENCE, baseVal: 10, nameTemplate: "Túnica" },

    // HELMETS
    { type: ItemType.HELMET, subtype: 'helm', baseStat: StatType.CONSTITUTION, baseVal: 10, nameTemplate: "Yelmo" },
    { type: ItemType.HELMET, subtype: 'hood', baseStat: StatType.DEXTERITY, baseVal: 8, nameTemplate: "Capucha" },

    // BOOTS
    { type: ItemType.BOOTS, subtype: 'boots', baseStat: StatType.DEXTERITY, baseVal: 6, nameTemplate: "Botas" },
    { type: ItemType.BOOTS, subtype: 'greaves', baseStat: StatType.STRENGTH, baseVal: 8, nameTemplate: "Grebas" },

    // AMULETS
    { type: ItemType.AMULET, subtype: 'ring', baseStat: StatType.INTELLIGENCE, baseVal: 5, nameTemplate: "Anillo" },
    { type: ItemType.AMULET, subtype: 'necklace', baseStat: StatType.CONSTITUTION, baseVal: 6, nameTemplate: "Colgante" },

    // FOOD
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
        { name: "Pesada", stat: StatType.STRENGTH, mod: 1.1 },
        { name: "Ágil", stat: StatType.DEXTERITY, mod: 1.1 },
        { name: "Arcana", stat: StatType.INTELLIGENCE, mod: 1.1 },
        { name: "Robusta", stat: StatType.CONSTITUTION, mod: 1.1 },
        { name: "Mortal", stat: StatType.STRENGTH, mod: 1.2 },
        { name: "Sombría", stat: StatType.DEXTERITY, mod: 1.2 },
    ],
    SUFFIXES: [
        { name: "del Oso", stat: StatType.CONSTITUTION, mod: 1.1 },
        { name: "del Tigre", stat: StatType.STRENGTH, mod: 1.1 },
        { name: "del Halcón", stat: StatType.DEXTERITY, mod: 1.1 },
        { name: "del Búho", stat: StatType.INTELLIGENCE, mod: 1.1 },
        { name: "del Dragón", stat: StatType.STRENGTH, mod: 1.3 },
        { name: "del Vacío", stat: StatType.INTELLIGENCE, mod: 1.3 },
    ]
};

export const ITEM_ASSETS: Record<string, string[]> = {
    'sword': [
        "https://images.unsplash.com/photo-1595590424283-b8f17842773f?q=80&w=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1589993356658-963d89856e72?q=80&w=200&auto=format&fit=crop"
    ],
    'axe': [
        "https://images.unsplash.com/photo-1593175866164-323e06f97f8c?q=80&w=200&auto=format&fit=crop" 
    ],
    'dagger': [
        "https://images.unsplash.com/photo-1615672968436-3b7c2b5d4361?q=80&w=200&auto=format&fit=crop"
    ],
    'staff': [
        "https://images.unsplash.com/photo-1535581652167-3d6b9bc27633?q=80&w=200&auto=format&fit=crop"
    ],
    'armor': [
        "https://images.unsplash.com/photo-1445633760012-6eb6d31849a6?q=80&w=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549488347-194165d2df89?q=80&w=200&auto=format&fit=crop"
    ],
    'helmet': [
        "https://images.unsplash.com/photo-1509623233860-2525492d501b?q=80&w=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1565551829623-e4c19790604e?q=80&w=200&auto=format&fit=crop"
    ],
    'boots': [
        "https://images.unsplash.com/photo-1605218427306-0222070cca9a?q=80&w=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1559563458-52c69c8e3079?q=80&w=200&auto=format&fit=crop"
    ],
    'amulet': [
        "https://images.unsplash.com/photo-1605218456209-642594582f6e?q=80&w=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1616773539828-56890333066a?q=80&w=200&auto=format&fit=crop"
    ],
    'bread': [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop"
    ],
    'stew': [
        "https://images.unsplash.com/photo-1547592166-23acbe346499?q=80&w=200&auto=format&fit=crop"
    ],
    'roast': [
        "https://images.unsplash.com/photo-1532592333381-a12f8480d2ad?q=80&w=200&auto=format&fit=crop"
    ]
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
    DUST_PER_BURN: {
        'Marchito': 5,
        'Resonante': 20,
        'Luminoso': 100,
        'Ascendido': 500
    },
    PROBABILITIES: {
        // Base probabilities
        'Ascendido': 0.01,
        'Luminoso': 0.05,
        'Resonante': 0.20,
        'Marchito': 0.74
    },
    PITY_THRESHOLD: 20 // Guaranteed Legendary after 20 pulls without one (generous for demo)
};

export const ECHO_TEMPLATES: EchoTemplate[] = [
    // --- ASCENDIDO (LEGENDARY) ---
    {
        id: 'echo_dragon',
        name: 'Corazón del Dragón',
        rarity: 'Ascendido',
        stats: { [StatType.STRENGTH]: 20, [StatType.CONSTITUTION]: 15 },
        passiveEffect: 'Tus ataques ignoran el 20% de la armadura rival.',
        image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=400&auto=format&fit=crop',
        lore: 'El latido de una bestia antigua que se niega a morir.'
    },
    {
        id: 'echo_lich',
        name: 'Susurro del Lich',
        rarity: 'Ascendido',
        stats: { [StatType.INTELLIGENCE]: 25, [StatType.CONSTITUTION]: 10 },
        passiveEffect: 'Inicias el combate con un escudo del 25% de tu HP.',
        image: 'https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=400&auto=format&fit=crop',
        lore: 'El conocimiento prohibido tiene un precio gélido.'
    },
    {
        id: 'echo_assassin',
        name: 'Sombra Silenciosa',
        rarity: 'Ascendido',
        stats: { [StatType.DEXTERITY]: 22, [StatType.STRENGTH]: 12 },
        passiveEffect: '+15% Probabilidad de Crítico.',
        image: 'https://images.unsplash.com/photo-1533518463841-d62e1fc91373?q=80&w=400&auto=format&fit=crop',
        lore: 'Nadie la vio llegar. Nadie la vio irse.'
    },

    // --- LUMINOSO (EPIC) ---
    {
        id: 'echo_bear',
        name: 'Espíritu del Oso',
        rarity: 'Luminoso',
        stats: { [StatType.CONSTITUTION]: 18 },
        passiveEffect: 'Gran aumento de vitalidad.',
        image: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=400&auto=format&fit=crop',
        lore: 'Furia inquebrantable de la naturaleza.'
    },
    {
        id: 'echo_storm',
        name: 'Ojo de la Tormenta',
        rarity: 'Luminoso',
        stats: { [StatType.INTELLIGENCE]: 15, [StatType.DEXTERITY]: 5 },
        passiveEffect: 'Tus hechizos golpean con precisión.',
        image: 'https://images.unsplash.com/photo-1534274988754-c6a60bf93c61?q=80&w=400&auto=format&fit=crop',
        lore: 'El caos controlado es la verdadera magia.'
    },
    {
        id: 'echo_berserker',
        name: 'Furia Sangrienta',
        rarity: 'Luminoso',
        stats: { [StatType.STRENGTH]: 16, [StatType.CONSTITUTION]: 4 },
        passiveEffect: 'Daño bruto puro.',
        image: 'https://images.unsplash.com/photo-1590625902919-21d17d23f79d?q=80&w=400&auto=format&fit=crop',
        lore: 'Golpear primero. Golpear fuerte.'
    },

    // --- RESONANTE (RARE) ---
    { id: 'echo_wolf', name: 'Colmillo de Lobo', rarity: 'Resonante', stats: { [StatType.DEXTERITY]: 10 }, passiveEffect: 'Agilidad mejorada.', image: '', lore: 'Caza en manada.' },
    { id: 'echo_golem', name: 'Núcleo de Piedra', rarity: 'Resonante', stats: { [StatType.CONSTITUTION]: 10 }, passiveEffect: 'Piel dura.', image: '', lore: 'Inamovible.' },
    { id: 'echo_ember', name: 'Ascua Eterna', rarity: 'Resonante', stats: { [StatType.INTELLIGENCE]: 10 }, passiveEffect: 'Mente ardiente.', image: '', lore: 'Pequeña pero peligrosa.' },
    { id: 'echo_steel', name: 'Voluntad de Acero', rarity: 'Resonante', stats: { [StatType.STRENGTH]: 10 }, passiveEffect: 'Golpes sólidos.', image: '', lore: 'Forjado en batalla.' },

    // --- MARCHITO (COMMON) ---
    { id: 'echo_wisp', name: 'Fuego Fatuo', rarity: 'Marchito', stats: { [StatType.INTELLIGENCE]: 4 }, passiveEffect: 'Brillo tenue.', image: '', lore: 'Apenas una chispa.' },
    { id: 'echo_rat', name: 'Astucia de Rata', rarity: 'Marchito', stats: { [StatType.DEXTERITY]: 4 }, passiveEffect: 'Rapidez básica.', image: '', lore: 'Sobrevivir es ganar.' },
    { id: 'echo_boar', name: 'Cuero de Jabalí', rarity: 'Marchito', stats: { [StatType.CONSTITUTION]: 4 }, passiveEffect: 'Resistencia leve.', image: '', lore: 'Gruñidos y golpes.' },
    { id: 'echo_club', name: 'Fuerza Bruta', rarity: 'Marchito', stats: { [StatType.STRENGTH]: 4 }, passiveEffect: 'Empuje simple.', image: '', lore: 'Sin técnica.' },
];
