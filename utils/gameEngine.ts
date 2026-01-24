
import { Player, Enemy, Stats, StatType, Quest, QuestRarity, Item, ItemType, BattleTurn, ArenaOpponent, CombatResult, Echo, EchoRarity, Equipment, WorldEvent, MaterialType } from "../types";
import { GAMER_ROOTS, GAMER_TAGS_PREFIX, GAMER_TAGS_SUFFIX, ENEMY_ARCHETYPES, QUEST_TITLES_PREFIX, QUEST_TITLES_SUFFIX, ITEM_TEMPLATES, RARITY_CONFIG, AFFIXES, ITEM_ASSETS, LEAGUES, League, GACHA_CONFIG, ECHO_TEMPLATES, LEAGUE_NAMES, GAME_EVENTS, MATERIALS_CONFIG, UPGRADE_CONFIG } from "../data/constants";

// --- GACHA ENGINE ---

export const summonEcho = (pityCounter: number): { echo: Echo, newPity: number } => {
    let rarity: EchoRarity = 'Marchito';
    const roll = Math.random();

    // Pity Check
    if (pityCounter >= GACHA_CONFIG.PITY_THRESHOLD) {
        rarity = 'Ascendido';
    } else {
        if (roll < GACHA_CONFIG.PROBABILITIES.Ascendido) rarity = 'Ascendido';
        else if (roll < GACHA_CONFIG.PROBABILITIES.Ascendido + GACHA_CONFIG.PROBABILITIES.Luminoso) rarity = 'Luminoso';
        else if (roll < GACHA_CONFIG.PROBABILITIES.Ascendido + GACHA_CONFIG.PROBABILITIES.Luminoso + GACHA_CONFIG.PROBABILITIES.Resonante) rarity = 'Resonante';
    }

    // Reset pity if legendary, else increment
    const newPity = rarity === 'Ascendido' ? 0 : pityCounter + 1;

    // Filter templates by rarity
    const pool = ECHO_TEMPLATES.filter(e => e.rarity === rarity);
    const template = pool[Math.floor(Math.random() * pool.length)] || ECHO_TEMPLATES[0];

    const newEcho: Echo = {
        id: `echo-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
        templateId: template.id,
        name: template.name,
        rarity: template.rarity,
        stats: template.stats,
        passiveEffect: template.passiveEffect,
        image: template.image || "https://images.unsplash.com/photo-1618193139062-2c5bf4f935b7?q=80&w=200&auto=format&fit=crop",
        lore: template.lore
    };

    return { echo: newEcho, newPity };
};


// --- PLAYER HELPERS ---

export const generateGamerTag = (): string => {
    const usePrefix = Math.random() > 0.7;
    const useSuffix = Math.random() > 0.6;
    const root = GAMER_ROOTS[Math.floor(Math.random() * GAMER_ROOTS.length)];
    const prefix = usePrefix ? GAMER_TAGS_PREFIX[Math.floor(Math.random() * GAMER_TAGS_PREFIX.length)] : '';
    const suffix = useSuffix ? GAMER_TAGS_SUFFIX[Math.floor(Math.random() * GAMER_TAGS_SUFFIX.length)] : '';
    return `${prefix}${root}${suffix}`;
};

export const generateRandomPlayerName = (): string => {
    return generateGamerTag();
};

export const calculateStatCost = (currentValue: number): number => {
    return Math.floor(15 + (currentValue * 8) + (Math.pow(currentValue, 2) * 0.4));
};

export const calculateMaxXp = (level: number): number => {
    return Math.floor(100 + (level * 25) + (Math.pow(level, 2) * 4));
};

export const checkLevelUp = (currentXp: number, maxXp: number, currentLevel: number) => {
    if (currentXp >= maxXp) {
        const nextLevel = currentLevel + 1;
        return {
            leveledUp: true,
            newLevel: nextLevel,
            remainingXp: currentXp - maxXp,
            newMaxXp: calculateMaxXp(nextLevel)
        };
    }
    return { leveledUp: false, newLevel: currentLevel, remainingXp: currentXp, newMaxXp: maxXp };
};

export const calculatePlayerTotalStats = (player: Player): Stats => {
    const totalStats = { ...player.stats };
    
    // Add Equipment Stats
    Object.values(player.equipment).forEach(item => {
        if (item) {
            Object.entries(item.stats).forEach(([stat, value]) => {
                totalStats[stat as StatType] = (totalStats[stat as StatType] || 0) + ((value as number) || 0);
            });
        }
    });

    // Add Echo Stats
    if (player.equippedEcho) {
        Object.entries(player.equippedEcho.stats).forEach(([stat, value]) => {
             totalStats[stat as StatType] = (totalStats[stat as StatType] || 0) + ((value as number) || 0);
        });
    }

    return totalStats;
};

export const calculateFoodHealing = (item: Item, player: Player): number => {
    if (item.type !== ItemType.FOOD) return 0;
    const baseHealingFromLevel = item.level * 8;
    const scalingFromCon = calculatePlayerTotalStats(player)[StatType.CONSTITUTION] * 3;
    return Math.floor(baseHealingFromLevel + scalingFromCon);
};

export const getLeagueInfo = (leagueId: string): League => {
    return LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
};

export const getNextLeague = (currentLeagueId: string): League | null => {
    const index = LEAGUES.findIndex(l => l.id === currentLeagueId);
    if (index !== -1 && index < LEAGUES.length - 1) {
        return LEAGUES[index + 1];
    }
    return null;
};

// --- WORLD EVENTS HELPERS ---

export const generateRandomEvent = (): WorldEvent => {
    return GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
};


// --- PROCEDURAL GENERATION ---

export const generateEnemy = (level: number, difficultyMult: number = 1, fixedSeed?: number): Enemy => {
    const archetypeIndex = fixedSeed !== undefined 
        ? fixedSeed % ENEMY_ARCHETYPES.length 
        : Math.floor(Math.random() * ENEMY_ARCHETYPES.length);
    
    const archetype = ENEMY_ARCHETYPES[archetypeIndex];
    
    const baseHp = 100 + (level * 25 * difficultyMult);
    const growthCurve = Math.pow(level, 1.3);
    const totalStatPoints = Math.floor(20 + (level * 4) + growthCurve);
    
    const stats: Stats = {
        [StatType.STRENGTH]: Math.floor(totalStatPoints * archetype.weights[StatType.STRENGTH]),
        [StatType.DEXTERITY]: Math.floor(totalStatPoints * archetype.weights[StatType.DEXTERITY]),
        [StatType.INTELLIGENCE]: Math.floor(totalStatPoints * archetype.weights[StatType.INTELLIGENCE]),
        [StatType.CONSTITUTION]: Math.floor(totalStatPoints * archetype.weights[StatType.CONSTITUTION]),
    };

    for (const key in stats) {
        if (stats[key as StatType] < 5) stats[key as StatType] = 5;
    }

    return {
        name: fixedSeed ? "Bot" : `${generateGamerTag()}`, 
        level,
        hp: baseHp,
        maxHp: baseHp,
        stats,
        classArchetype: archetype.name,
        difficultyRating: difficultyMult
    };
};

export const calculateWinChance = (player: Player, enemy: Enemy | ArenaOpponent): number => {
    const pStats = calculatePlayerTotalStats(player);
    const pPower = pStats[StatType.STRENGTH] + pStats[StatType.DEXTERITY] + pStats[StatType.INTELLIGENCE] + (pStats[StatType.CONSTITUTION] * 0.5);
    const ePower = enemy.stats[StatType.STRENGTH] + enemy.stats[StatType.DEXTERITY] + enemy.stats[StatType.INTELLIGENCE] + (enemy.stats[StatType.CONSTITUTION] * 0.5);
    
    const levelDiff = player.level - enemy.level;
    const powerRatio = pPower / Math.max(1, ePower);
    
    let chance = 0.5;
    chance += (powerRatio - 1) * 0.6; 
    chance += levelDiff * 0.01;

    return Math.max(0.01, Math.min(0.99, chance)); 
};

export const generateLeagueLadder = (leagueId: string, player: Player): ArenaOpponent[] => {
    const ladder: ArenaOpponent[] = [];
    const league = LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
    const namePool = LEAGUE_NAMES[leagueId] || LEAGUE_NAMES['WOOD'];
    
    for (let rank = 1; rank <= 50; rank++) {
        if (rank === player.arenaRank) continue;

        const leagueOffset = league.rankIndex * 50;
        const botStrengthIndex = 51 - rank; 
        const globalRank = leagueOffset + botStrengthIndex;
        const level = 1 + (globalRank * 2);
        const seed = globalRank * 12345;
        
        const enemy = generateEnemy(level, 1.0, seed);
        const nameIndex = seed % namePool.length;
        const suffix = rank <= 3 ? " [Elite]" : ""; 
        enemy.name = `${namePool[nameIndex]}${suffix}`;

        const goldReward = Math.floor((50 + (level * 15)) * league.rewardsMult);
        const xpReward = Math.floor(100 + (level * 20));

        ladder.push({
            ...enemy,
            id: `bot-${league.id}-${rank}`,
            arenaRank: rank,
            winChance: 0, 
            pointsReward: xpReward, 
            goldReward: goldReward
        });
    }
    return ladder;
};

export const getChallengers = (ladder: ArenaOpponent[], playerRank: number): ArenaOpponent[] => {
    const targets = [playerRank - 1, playerRank - 2, playerRank - 3, playerRank - 4, playerRank - 5];
    if (playerRank <= 10) targets.push(1, 2, 3);
    
    return ladder.filter(opp => targets.includes(opp.arenaRank || 999)).sort((a,b) => (a.arenaRank||0) - (b.arenaRank||0)).slice(0, 5);
};

export const generateProceduralItem = (level: number, rarityBonus: boolean = false, fixedRarity?: QuestRarity, fixedType?: ItemType): Item => {
    // Filter templates if fixedType is provided
    const templates = fixedType
        ? ITEM_TEMPLATES.filter(t => t.type === fixedType)
        : ITEM_TEMPLATES;

    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Rarity
    let rarity: QuestRarity = 'Común';
    
    if (fixedRarity) {
        rarity = fixedRarity;
    } else {
        const roll = Math.random();
        const effectiveRoll = rarityBonus ? Math.min(0.99, roll + 0.15) : roll;

        if (effectiveRoll > 0.98) rarity = 'Legendario';
        else if (effectiveRoll > 0.90) rarity = 'Épico';
        else if (effectiveRoll > 0.70) rarity = 'Raro';
        else if (effectiveRoll > 0.40) rarity = 'Poco Común';
    }

    const config = RARITY_CONFIG[rarity];
    
    // Stats
    const stats: Partial<Stats> = {};
    const mainStatVal = Math.max(1, Math.floor(template.baseVal * (1 + (level * 0.15)) * config.mult * (0.9 + Math.random() * 0.2)));
    stats[template.baseStat] = mainStatVal;

    // Affixes Logic (Smarter)
    let name = template.nameTemplate;
    const numAffixes = config.slots;
    
    // Filter valid affixes for this item type
    const validPrefixes = AFFIXES.PREFIXES.filter(p => !p.allowedTypes || p.allowedTypes.length === 0 || p.allowedTypes.includes(template.type));
    // Suffixes are generally generic in my config, but if I added restriction I should filter them too.
    // Assuming suffixes are generic for now or strictly stat based.
    const validSuffixes = AFFIXES.SUFFIXES; // Add filter if needed later

    for (let i = 0; i < numAffixes; i++) {
        // Force at least one prefix if possible for better naming
        const usePrefix = (Math.random() > 0.5) || (i === 0);

        if (usePrefix && validPrefixes.length > 0) {
            const prefix = validPrefixes[Math.floor(Math.random() * validPrefixes.length)];
            // Apply stat mod
            stats[prefix.stat] = (stats[prefix.stat] || 0) + Math.max(1, Math.floor(mainStatVal * (prefix.mod - 1.0) * 2)); // Logic changed: affix adds extra based on main stat
             if (!name.includes(prefix.name)) name = `${prefix.name} ${name}`;
        } else if (validSuffixes.length > 0) {
            const suffix = validSuffixes[Math.floor(Math.random() * validSuffixes.length)];
             stats[suffix.stat] = (stats[suffix.stat] || 0) + Math.max(1, Math.floor(mainStatVal * (suffix.mod - 1.0) * 2));
            if (!name.includes(suffix.name)) name = `${name} ${suffix.name}`;
        }
    }

    // Ensure main stat is present and dominant
    if (!stats[template.baseStat]) stats[template.baseStat] = mainStatVal;

    const assetList = ITEM_ASSETS[template.subtype] || [];
    const image = assetList.length > 0 ? assetList[Math.floor(Math.random() * assetList.length)] : "https://via.placeholder.com/150";

    return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
        name,
        level,
        type: template.type,
        subtype: template.subtype,
        rarity,
        cost: Math.floor(mainStatVal * 15 * config.mult),
        stats,
        description: `Objeto ${rarity.toLowerCase()} de nivel ${level}.`,
        image,
        upgradeLevel: 0
    };
};

export const generateLoot = (level: number): { item?: Item, material?: { type: MaterialType, amount: number } } => {
    const roll = Math.random();

    // 30% Chance for Gear
    if (roll < 0.3) {
        return { item: generateProceduralItem(level) };
    }

    // 50% Chance for Materials
    if (roll < 0.8) {
         const matRoll = Math.random();
         let matType = MaterialType.SCRAP;
         let amount = Math.floor(Math.random() * 3) + 1;

         if (matRoll > 0.95) { matType = MaterialType.GEM; amount = 1; }
         else if (matRoll > 0.85) { matType = MaterialType.ESSENCE; amount = Math.floor(Math.random() * 2) + 1; }
         else if (matRoll > 0.70) { matType = MaterialType.ORE; amount = Math.floor(Math.random() * 3) + 1; }
         else if (matRoll > 0.50) { matType = MaterialType.LEATHER; amount = Math.floor(Math.random() * 4) + 1; }
         else if (matRoll > 0.30) { matType = MaterialType.WOOD; amount = Math.floor(Math.random() * 5) + 1; }

         return { material: { type: matType, amount } };
    }

    // 20% Nothing (Just Gold/XP from source)
    return {};
};

export const salvageItem = (item: Item): { type: MaterialType, amount: number }[] => {
    const result: { type: MaterialType, amount: number }[] = [];

    // Base Scrap
    result.push({ type: MaterialType.SCRAP, amount: Math.max(1, Math.floor(item.level / 2)) });

    // Type specific
    if (item.type === ItemType.WEAPON) result.push({ type: MaterialType.WOOD, amount: Math.floor(Math.random() * 2) + 1 });
    if (item.type === ItemType.ARMOR) result.push({ type: MaterialType.LEATHER, amount: Math.floor(Math.random() * 2) + 1 });
    if (item.type === ItemType.HELMET) result.push({ type: MaterialType.ORE, amount: 1 });

    // Rarity Bonus
    if (item.rarity === 'Raro') result.push({ type: MaterialType.ORE, amount: 2 });
    if (item.rarity === 'Épico') result.push({ type: MaterialType.ESSENCE, amount: 1 });
    if (item.rarity === 'Legendario') result.push({ type: MaterialType.GEM, amount: 1 });

    return result;
};

export const upgradeItem = (item: Item): Item => {
    if ((item.upgradeLevel || 0) >= UPGRADE_CONFIG.MAX_LEVEL) return item;

    const newLevel = (item.upgradeLevel || 0) + 1;
    const newStats = { ...item.stats };

    // Increase all existing stats
    for (const key in newStats) {
        newStats[key as StatType] = Math.floor((newStats[key as StatType] || 0) * UPGRADE_CONFIG.STAT_GROWTH);
    }

    return {
        ...item,
        upgradeLevel: newLevel,
        stats: newStats,
        name: item.name.includes(`+${newLevel - 1}`) ? item.name.replace(`+${newLevel - 1}`, `+${newLevel}`) : `${item.name} +${newLevel}`
    };
};

export const generateShopItems = (level: number): Item[] => {
    const items: Item[] = [];
    const count = 6;
    for(let i=0; i<count; i++) {
        items.push(generateProceduralItem(level));
    }
    
    const foodAssets = ITEM_ASSETS['bread'] || [];
    items.push({
            id: `food-${Date.now()}-${Math.random()}`,
            name: "Ración de Viaje",
            level,
            type: ItemType.FOOD,
            subtype: 'bread',
            rarity: 'Común',
            cost: 10 * level,
            stats: {},
            description: "Restaura salud.",
            image: foodAssets[0] || ""
    });

    return items;
};

export const calculateQuestSuccessChance = (quest: Quest, player: Player): number => {
    const pStat = calculatePlayerTotalStats(player)[quest.recommendedStat];
    const reqStat = player.level * 5 * (quest.difficulty === 'Mortal' ? 2 : quest.difficulty === 'Difícil' ? 1.5 : 1);
    
    let chance = 0.7; // Base
    const diff = pStat - reqStat;
    chance += (diff * 0.02); // 2% per point diff

    return Math.max(0.1, Math.min(1.0, chance));
};

export const generateProceduralQuest = (player: Player, seed: number): Quest => {
    const prefix = QUEST_TITLES_PREFIX[Math.floor(Math.random() * QUEST_TITLES_PREFIX.length)];
    const suffix = QUEST_TITLES_SUFFIX[Math.floor(Math.random() * QUEST_TITLES_SUFFIX.length)];
    
    const roll = Math.random();
    let rarity: QuestRarity = 'Común';
    if (roll > 0.95) rarity = 'Legendario';
    else if (roll > 0.85) rarity = 'Épico';
    else if (roll > 0.60) rarity = 'Raro';
    else if (roll > 0.30) rarity = 'Poco Común';

    const difficultyRoll = Math.random();
    let difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Mortal' = 'Medio';
    let energyCost = 5;
    let multiplier = 1;
    
    if (difficultyRoll > 0.9) { difficulty = 'Mortal'; energyCost = 15; multiplier = 3; }
    else if (difficultyRoll > 0.7) { difficulty = 'Difícil'; energyCost = 10; multiplier = 2; }
    else if (difficultyRoll < 0.3) { difficulty = 'Fácil'; energyCost = 3; multiplier = 0.8; }

    const xpReward = Math.floor(player.level * 20 * multiplier * RARITY_CONFIG[rarity].mult);
    const goldReward = Math.floor(player.level * 15 * multiplier * RARITY_CONFIG[rarity].mult);

    const recommendedStat = [StatType.STRENGTH, StatType.DEXTERITY, StatType.INTELLIGENCE][Math.floor(Math.random() * 3)];

    // Loot Logic for Quest
    const loot = generateLoot(player.level);
    const itemReward = loot.item;
    const materialReward = loot.material;

    if (itemReward && rarity === 'Legendario') itemReward.rarity = 'Legendario'; 

    return {
        id: `qst-${Date.now()}-${seed}`,
        title: `${prefix} ${suffix}`,
        rarity,
        difficulty,
        duration: 5 + Math.floor(Math.random() * 10) * multiplier, // Seconds
        goldReward,
        xpReward,
        energyCost,
        description: "Cargando descripción...",
        recommendedStat,
        itemReward,
        materialReward
    };
};

export const simulateCombat = (player: Player, enemy: Enemy | ArenaOpponent): CombatResult => {
    let pHP = player.hp;
    let eHP = enemy.hp;
    const turns: BattleTurn[] = [];
    const pStats = calculatePlayerTotalStats(player);
    let round = 1;

    const pDmgMod = player.equippedEcho?.rarity === 'Ascendido' ? 1.2 : 1.0; 
    const pCritMod = player.equippedEcho?.rarity === 'Luminoso' ? 0.1 : 0.0;
    const pLifeSteal = player.equippedEcho?.id === 'echo_lich' ? 0.05 : 0; 

    while (pHP > 0 && eHP > 0 && round < 30) {
        // Player Turn
        const pHit = Math.random() + (pStats[StatType.DEXTERITY] * 0.005);
        const pCrit = Math.random() < (0.05 + (pStats[StatType.DEXTERITY] * 0.002) + pCritMod);
        
        let pDmg = 0;
        let pMiss = false;
        
        const hitThreshold = 0.2; 
        
        if (pHit > hitThreshold) {
            const rawDmg = (pStats[StatType.STRENGTH] * 0.6) + (pStats[StatType.INTELLIGENCE] * 0.4) + (Math.random() * 5);
            pDmg = Math.max(1, rawDmg * (pCrit ? 2 : 1) * pDmgMod);
            const mitigation = enemy.stats[StatType.CONSTITUTION] * 0.3;
            pDmg = Math.max(1, pDmg - mitigation);
            
            eHP -= pDmg;

            if (pLifeSteal > 0) pHP = Math.min(player.maxHp, pHP + (pDmg * pLifeSteal));

        } else {
            pMiss = true;
        }
        
        turns.push({
            text: pMiss ? `Fallas tu ataque contra ${enemy.name}.` : pCrit ? `¡CRÍTICO! Golpeas a ${enemy.name} por ${Math.floor(pDmg)} daño.` : `Golpeas a ${enemy.name} causando ${Math.floor(pDmg)} daño.`,
            attacker: 'player',
            damage: pDmg,
            isCrit: pCrit,
            isMiss: pMiss,
            playerHp: pHP,
            enemyHp: Math.max(0, eHP)
        });

        if (eHP <= 0) break;

        // Enemy Turn
        const eHit = Math.random() + (enemy.stats[StatType.DEXTERITY] * 0.005);
        const eCrit = Math.random() < 0.05;
        let eDmg = 0;
        let eMiss = false;

        if (eHit > hitThreshold + (pStats[StatType.DEXTERITY]*0.002)) { 
            const rawDmg = (enemy.stats[StatType.STRENGTH] * 0.6) + (enemy.stats[StatType.INTELLIGENCE] * 0.4) + (Math.random() * 5);
            eDmg = Math.max(1, rawDmg * (eCrit ? 2 : 1));
            const mitigation = pStats[StatType.CONSTITUTION] * 0.3;
            eDmg = Math.max(1, eDmg - mitigation);
            
            pHP -= eDmg;
        } else {
            eMiss = true;
        }

        turns.push({
            text: eMiss ? `${enemy.name} falla su ataque.` : eCrit ? `¡${enemy.name} te asesta un GOLPE CRÍTICO de ${Math.floor(eDmg)}!` : `${enemy.name} te ataca y recibes ${Math.floor(eDmg)} daño.`,
            attacker: 'enemy',
            damage: eDmg,
            isCrit: eCrit,
            isMiss: eMiss,
            playerHp: Math.max(0, pHP),
            enemyHp: Math.max(0, eHP)
        });

        round++;
    }

    const isVictory = pHP > 0;
    let loot = undefined;

    if (isVictory) {
        loot = generateLoot(enemy.level);
    }

    return {
        isVictory,
        rounds: round,
        remainingHp: pHP,
        turns,
        loot
    };
};
