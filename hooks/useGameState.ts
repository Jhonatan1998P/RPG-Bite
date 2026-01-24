
import { useState, useEffect, useCallback } from 'react';
import { Player, StatType, Item, ItemType, Equipment, Quest, BattleLog, ArenaOpponent, Echo } from '../types';
import { StorageService } from '../utils/storage';
import { calculatePlayerTotalStats, calculateStatCost, calculateFoodHealing, calculateQuestSuccessChance, checkLevelUp, generateLeagueLadder, generateProceduralQuest, calculateMaxXp, getNextLeague, generateShopItems, summonEcho } from '../utils/gameEngine';
import { generateQuestResult } from '../services/geminiService';
import { eventBus, EventTypes } from '../services/eventBus';
import { GACHA_CONFIG } from '../data/constants';

const INITIAL_PLAYER: Player = {
  name: 'Viajero',
  level: 1,
  xp: 0,
  maxXp: 129, 
  hp: 100,
  maxHp: 100,
  gold: 300,
  rubies: 100, // Increased starting rubies to try gacha
  voidDust: 0,
  energy: 50,
  maxEnergy: 50,
  battleHistory: [],
  stats: {
    [StatType.STRENGTH]: 5,
    [StatType.DEXTERITY]: 5,
    [StatType.INTELLIGENCE]: 5,
    [StatType.CONSTITUTION]: 5
  },
  inventory: [],
  equipment: {
      [ItemType.WEAPON]: null,
      [ItemType.HELMET]: null,
      [ItemType.ARMOR]: null,
      [ItemType.BOOTS]: null,
      [ItemType.AMULET]: null
  },
  
  // New Gacha State
  echoesInventory: [],
  equippedEcho: null,
  pityCounter: 0,
  lastDailySummon: 0,

  currentQuests: [],
  nextArenaBattle: 0,
  nextTavernRefresh: 0,
  arenaRank: 50, 
  arenaLeague: 'INITIATE',
  arenaLadder: [],
  merchantInventory: [],
  nextMerchantRefresh: 0
};

export const useGameState = () => {
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [gameStarted, setGameStarted] = useState(false);

  // --- PERSISTENCE & INIT ---
  useEffect(() => {
    if (gameStarted) {
      StorageService.save(player);
    }
  }, [player, gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
        setPlayer(p => {
             const hpRegen = Math.max(1, Math.ceil(p.maxHp * 0.02));
             let newMerchantInv = p.merchantInventory;
             let newMerchantTimer = p.nextMerchantRefresh;
             
             if (Date.now() > p.nextMerchantRefresh) {
                 newMerchantInv = generateShopItems(p.level);
                 newMerchantTimer = Date.now() + (2 * 60 * 60 * 1000); 
                 if (p.nextMerchantRefresh !== 0) {
                    eventBus.emit(EventTypes.SHOW_TOAST, { message: "Mercado actualizado.", type: 'info' });
                 }
             }

             return {
                ...p,
                hp: Math.min(p.maxHp, p.hp + hpRegen), 
                energy: Math.min(p.maxEnergy, p.energy + 1),
                merchantInventory: newMerchantInv,
                nextMerchantRefresh: newMerchantTimer
             }
        });
    }, 60000); 
    
    setPlayer(prev => {
        if (prev.merchantInventory.length === 0 || Date.now() > prev.nextMerchantRefresh) {
             return {
                 ...prev,
                 merchantInventory: generateShopItems(prev.level),
                 nextMerchantRefresh: Date.now() + (2 * 60 * 60 * 1000)
             };
        }
        return prev;
    });
    return () => clearInterval(interval);
  }, [gameStarted]);

  // Recalculate MaxHP on stat changes
  useEffect(() => {
      if (!gameStarted) return;
      setPlayer(prev => {
          const totalStats = calculatePlayerTotalStats(prev);
          const newMaxHp = totalStats[StatType.CONSTITUTION] * 12 + 50;
          if (prev.maxHp !== newMaxHp) {
              return { ...prev, maxHp: newMaxHp };
          }
          return prev;
      });

      setPlayer(prev => {
          if (prev.arenaLadder.length === 0 || prev.arenaLadder[0].id.split('-')[1] !== prev.arenaLeague) {
              return { ...prev, arenaLadder: generateLeagueLadder(prev.arenaLeague, prev) };
          }
          return prev;
      });
  }, [player.stats, player.equipment, player.equippedEcho, player.arenaLeague, gameStarted]);

  // --- ACTIONS ---

  const startGame = (name: string) => {
      setPlayer({ ...INITIAL_PLAYER, name });
      setGameStarted(true);
  };

  const loadGame = (): boolean => {
      const loaded = StorageService.load(INITIAL_PLAYER);
      if (loaded) {
          setPlayer(loaded);
          setGameStarted(true);
          return true;
      }
      return false;
  };

  const importGame = async (file: File) => {
      try {
          const data = await StorageService.import(file);
          setPlayer({ ...INITIAL_PLAYER, ...data });
          setGameStarted(true);
          return true;
      } catch (e) {
          return false;
      }
  };

  const trainStat = (stat: StatType) => {
      const cost = calculateStatCost(player.stats[stat]);
      if (player.gold >= cost) {
          setPlayer(prev => ({
              ...prev,
              gold: prev.gold - cost,
              stats: { ...prev.stats, [stat]: prev.stats[stat] + 1 }
          }));
          eventBus.emit(EventTypes.SHOW_TOAST, { message: `¡${stat} mejorada!`, type: 'success' });
      } else {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: `Necesitas ${cost} de oro.`, type: 'error' });
      }
  };

  // --- ITEM ACTIONS ---
  const equipItem = (item: Item) => {
      setPlayer(prev => {
          const currentEquip = prev.equipment[item.type as keyof Equipment];
          const newInventory = prev.inventory.filter(i => i.id !== item.id);
          if (currentEquip) newInventory.push(currentEquip);

          return {
              ...prev,
              inventory: newInventory,
              equipment: { ...prev.equipment, [item.type]: item }
          };
      });
      eventBus.emit(EventTypes.SHOW_TOAST, { message: `Equipado: ${item.name}`, type: 'success' });
  };

  const unequipItem = (type: ItemType) => {
      if (player.inventory.length >= 20) {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Inventario lleno.", type: 'error' });
          return;
      }
      setPlayer(prev => {
          const currentEquip = prev.equipment[type as keyof Equipment];
          if (!currentEquip) return prev;
          return {
              ...prev,
              equipment: { ...prev.equipment, [type]: null },
              inventory: [...prev.inventory, currentEquip]
          };
      });
  };

  const consumeItem = (item: Item) => {
      if (item.type !== ItemType.FOOD) return;
      if (player.hp >= player.maxHp) {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Salud al máximo.", type: 'info' });
          return;
      }
      const healing = calculateFoodHealing(item, player);
      setPlayer(prev => ({
          ...prev,
          hp: Math.min(prev.maxHp, prev.hp + healing),
          inventory: prev.inventory.filter(i => i.id !== item.id)
      }));
      eventBus.emit(EventTypes.SHOW_TOAST, { message: `Recuperaste ${healing} HP.`, type: 'success' });
  };

  const buyItem = (item: Item): boolean => {
      if (player.inventory.length >= 20) {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Inventario lleno.", type: 'error' });
          return false;
      }
      if (player.gold >= item.cost) {
          setPlayer(prev => ({
              ...prev,
              gold: prev.gold - item.cost,
              inventory: [...prev.inventory, item],
              merchantInventory: prev.merchantInventory.filter(i => i.id !== item.id)
          }));
          eventBus.emit(EventTypes.SHOW_TOAST, { message: `Comprado: ${item.name}`, type: 'success' });
          return true;
      }
      return false;
  };

  const sellItem = (item: Item) => {
      const price = Math.floor(item.cost * 0.5);
      setPlayer(prev => ({
          ...prev,
          gold: prev.gold + price,
          inventory: prev.inventory.filter(i => i.id !== item.id)
      }));
      eventBus.emit(EventTypes.SHOW_TOAST, { message: `Vendido por ${price}g`, type: 'success' });
  };

  // --- GACHA ACTIONS ---

  const performSummon = (type: 'SINGLE' | 'MULTI', currency: 'RUBY' | 'DUST' | 'FREE'): Echo[] | null => {
      const isMulti = type === 'MULTI';
      const count = isMulti ? 10 : 1;
      let cost = 0;
      
      if (currency === 'RUBY') cost = count * (isMulti ? 90 : 100); // 10% discount on multi
      if (currency === 'DUST') cost = count * GACHA_CONFIG.COST_DUST;

      // Check Currency
      if (currency === 'RUBY' && player.rubies < cost) {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Faltan Rubíes.", type: 'error' });
          return null;
      }
      if (currency === 'DUST' && player.voidDust < cost) {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Falta Polvo Onírico.", type: 'error' });
          return null;
      }
      if (currency === 'FREE') {
          const now = Date.now();
          if (now - player.lastDailySummon < 24 * 60 * 60 * 1000) {
              eventBus.emit(EventTypes.SHOW_TOAST, { message: "Invocación diaria ya usada.", type: 'error' });
              return null;
          }
      }

      const results: Echo[] = [];
      let tempPity = player.pityCounter;

      for(let i=0; i<count; i++) {
          const res = summonEcho(tempPity);
          results.push(res.echo);
          tempPity = res.newPity;
      }

      setPlayer(prev => ({
          ...prev,
          rubies: currency === 'RUBY' ? prev.rubies - cost : prev.rubies,
          voidDust: currency === 'DUST' ? prev.voidDust - cost : prev.voidDust,
          lastDailySummon: currency === 'FREE' ? Date.now() : prev.lastDailySummon,
          pityCounter: tempPity,
          echoesInventory: [...prev.echoesInventory, ...results]
      }));

      return results;
  };

  const equipEcho = (echo: Echo) => {
      setPlayer(prev => ({
          ...prev,
          equippedEcho: echo
      }));
      eventBus.emit(EventTypes.SHOW_TOAST, { message: "Eco vinculado.", type: 'success' });
  };

  const burnEcho = (echo: Echo) => {
      // Cannot burn equipped
      if (player.equippedEcho?.id === echo.id) {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "No puedes sacrificar el eco equipado.", type: 'error' });
          return;
      }
      
      const dustGain = GACHA_CONFIG.DUST_PER_BURN[echo.rarity];
      setPlayer(prev => ({
          ...prev,
          voidDust: prev.voidDust + dustGain,
          echoesInventory: prev.echoesInventory.filter(e => e.id !== echo.id)
      }));
      eventBus.emit(EventTypes.SHOW_TOAST, { message: `Sacrificado: +${dustGain} Polvo Onírico`, type: 'info' });
  };


  const refreshMerchant = () => {
      const COST = 5;
      if (player.rubies >= COST) {
           setPlayer(prev => ({
               ...prev,
               rubies: prev.rubies - COST,
               merchantInventory: generateShopItems(prev.level)
           }));
           eventBus.emit(EventTypes.SHOW_TOAST, { message: "Mercado renovado.", type: 'success' });
           return true;
      } else {
           eventBus.emit(EventTypes.SHOW_TOAST, { message: `Necesitas ${COST} Rubíes.`, type: 'error' });
           return false;
      }
  };

  const processQuest = async (quest: Quest): Promise<string> => {
      setPlayer(prev => ({ ...prev, energy: prev.energy - quest.energyCost }));
      const successChance = calculateQuestSuccessChance(quest, player);
      const isSuccess = Math.random() <= successChance;
      const resultText = await generateQuestResult(quest.title, isSuccess);

      if (isSuccess) {
          setPlayer(prev => {
              const newXp = prev.xp + quest.xpReward;
              const levelCheck = checkLevelUp(newXp, prev.maxXp, prev.level);
              if (levelCheck.leveledUp) eventBus.emit(EventTypes.SHOW_TOAST, { message: "¡SUBIDA DE NIVEL!", type: 'success' });
              
              const updatedInv = [...prev.inventory];
              if (quest.itemReward && updatedInv.length < 20) {
                  updatedInv.push(quest.itemReward);
                  eventBus.emit(EventTypes.SHOW_TOAST, { message: `¡Obtuviste ${quest.itemReward.name}!`, type: 'success' });
              }

              return {
                  ...prev,
                  gold: prev.gold + quest.goldReward,
                  xp: levelCheck.remainingXp,
                  level: levelCheck.newLevel,
                  maxXp: levelCheck.newMaxXp,
                  stats: levelCheck.leveledUp ? { 
                      ...prev.stats, 
                      [StatType.STRENGTH]: prev.stats[StatType.STRENGTH] + 1, 
                      [StatType.CONSTITUTION]: prev.stats[StatType.CONSTITUTION] + 1 
                  } : prev.stats,
                  hp: levelCheck.leveledUp ? prev.maxHp : prev.hp,
                  energy: levelCheck.leveledUp ? prev.maxEnergy : prev.energy,
                  inventory: updatedInv
              };
          });
      } else {
          const hpLoss = Math.floor(player.maxHp * (quest.difficulty === 'Mortal' ? 0.4 : quest.difficulty === 'Difícil' ? 0.25 : 0.10));
          setPlayer(prev => ({
              ...prev,
              hp: Math.max(1, prev.hp - hpLoss),
              xp: prev.xp + Math.floor(quest.xpReward * 0.15)
          }));
          eventBus.emit(EventTypes.SHOW_TOAST, { message: `Misión fallida. -${hpLoss} HP`, type: 'error' });
      }
      return resultText;
  };

  const processBattleResult = (log: BattleLog, opponentRank: number) => {
      setPlayer(prev => {
          const newXp = prev.xp + log.xpChange;
          const levelCheck = checkLevelUp(newXp, prev.maxXp, prev.level);
          const finalHp = log.turns[log.turns.length - 1].playerHp;
          
          let newRank = prev.arenaRank;
          let newLadder = [...prev.arenaLadder];
          let newLeague = prev.arenaLeague;

          if (log.result === 'VICTORIA' && opponentRank < prev.arenaRank) {
              newRank = opponentRank;
              // Ladder Swap Logic
              newLadder = newLadder.map(bot => 
                  bot.arenaRank === opponentRank ? { ...bot, arenaRank: prev.arenaRank } : bot
              ).sort((a,b) => (a.arenaRank||50) - (b.arenaRank||50));
              
              eventBus.emit(EventTypes.SHOW_TOAST, { message: `¡Rango #${newRank} alcanzado!`, type: 'success' });
              
              // League Promotion
              if (newRank === 1) {
                  const nextLeague = getNextLeague(prev.arenaLeague);
                  if (nextLeague) {
                      newLeague = nextLeague.id;
                      newRank = 50;
                      newLadder = []; // Will regenerate in effect
                      eventBus.emit(EventTypes.SHOW_TOAST, { message: `¡Ascendido a ${nextLeague.name}!`, type: 'success', duration: 5000 });
                  }
              }
          }

          return {
              ...prev,
              gold: prev.gold + log.goldChange,
              xp: levelCheck.remainingXp,
              level: levelCheck.newLevel,
              maxXp: levelCheck.newMaxXp,
              stats: levelCheck.leveledUp ? { 
                  ...prev.stats, 
                  [StatType.STRENGTH]: prev.stats[StatType.STRENGTH] + 1,
                  [StatType.CONSTITUTION]: prev.stats[StatType.CONSTITUTION] + 1 
              } : prev.stats,
              hp: Math.max(1, finalHp),
              battleHistory: [...prev.battleHistory, log],
              arenaRank: newRank,
              arenaLeague: newLeague,
              arenaLadder: newLadder,
              nextArenaBattle: Date.now() + 150000 // Cooldown handled here
          };
      });
  };

  // Currency Helpers
  const spendGold = (amount: number) => {
      if (player.gold >= amount) {
          setPlayer(prev => ({ ...prev, gold: prev.gold - amount }));
          return true;
      }
      return false;
  };

  const spendRubies = (amount: number, reason: 'ENERGY' | 'ARENA' | 'TAVERN') => {
      if (player.rubies >= amount) {
          setPlayer(prev => {
              const updates: Partial<Player> = { rubies: prev.rubies - amount };
              if (reason === 'ENERGY') updates.energy = prev.maxEnergy;
              if (reason === 'ARENA') updates.nextArenaBattle = 0;
              if (reason === 'TAVERN') updates.nextTavernRefresh = 0;
              return { ...prev, ...updates };
          });
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Rubíes canjeados.", type: 'success' });
          return true;
      }
      eventBus.emit(EventTypes.SHOW_TOAST, { message: "Faltan Rubíes.", type: 'error' });
      return false;
  };

  const updateQuests = (quests: Quest[]) => setPlayer(prev => ({ ...prev, currentQuests: quests }));
  const refreshTavernTimer = () => setPlayer(prev => ({ ...prev, nextTavernRefresh: Date.now() + 300000 }));
  const refreshSingleQuest = (questId: string) => {
      if (player.rubies >= 1) {
          setPlayer(prev => {
             const newQuest = generateProceduralQuest(prev, Math.floor(Math.random() * 1000));
             return {
                 ...prev,
                 rubies: prev.rubies - 1, 
                 currentQuests: prev.currentQuests.map(q => q.id === questId ? newQuest : q)
             };
          });
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Misión renovada.", type: 'success' });
          return true;
      } else {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Faltan Rubíes.", type: 'error' });
          return false;
      }
  };

  return {
    player,
    gameStarted,
    actions: {
        startGame,
        loadGame,
        importGame,
        setGameStarted, // For exit
        trainStat,
        equipItem,
        unequipItem,
        consumeItem,
        buyItem,
        sellItem,
        refreshMerchant,
        processQuest,
        processBattleResult,
        spendGold,
        spendRubies,
        updateQuests,
        refreshTavernTimer,
        refreshSingleQuest,
        // Gacha Actions
        performSummon,
        equipEcho,
        burnEcho
    }
  };
};
