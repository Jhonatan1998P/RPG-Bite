
import React, { useState } from 'react';
import { ViewState, BattleLog, Enemy, ArenaOpponent } from './types';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/Layout/MobileNav';
import { ProfileView } from './components/Views/ProfileView';
import { TavernView } from './components/Views/TavernView';
import { ArenaView } from './components/Views/ArenaView';
import { RankingsView } from './components/Views/RankingsView';
import { BattleView } from './components/Views/BattleView';
import { ReportsView } from './components/Views/ReportsView';
import { MerchantView } from './components/Views/MerchantView';
import { WelcomeView } from './components/Views/WelcomeView';
import { GachaView } from './components/Views/GachaView'; // Import
import { ToastSystem } from './components/UI/ToastSystem';
import { TooltipSystem } from './components/UI/TooltipSystem';
import { generateBattleNarrative } from './services/geminiService';
import { simulateCombat } from './utils/gameEngine';
import { StorageService } from './utils/storage';
import { Shield } from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import { eventBus, EventTypes } from './services/eventBus';

export default function App() {
  const { player, gameStarted, actions } = useGameState();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.WELCOME);
  
  // UI State for Battle (Animation only)
  const [activeBattle, setActiveBattle] = useState<{ enemy: Enemy; result: BattleLog; narrative: string, opponentData?: ArenaOpponent } | null>(null);
  const [isInitializingBattle, setIsInitializingBattle] = useState(false);

  // --- VIEW LOGIC ---

  const handleStartBattle = async (opponent: ArenaOpponent) => {
      if (isInitializingBattle) return;
      if (Date.now() < player.nextArenaBattle) {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Debes descansar.", type: 'info' });
          return;
      }

      setIsInitializingBattle(true);
      
      // Calculate Result (Pure Logic)
      const simulation = simulateCombat(player, opponent);
      const isVictory = simulation.isVictory;
      
      const xpGain = isVictory ? Math.floor(opponent.level * 10) : Math.floor(opponent.level * 2);
      const goldGain = isVictory ? opponent.goldReward : 0;
      const rankChange = isVictory && (opponent.arenaRank || 50) < player.arenaRank 
          ? player.arenaRank - (opponent.arenaRank || 50) 
          : 0;

      const battleLog: BattleLog = {
          id: `BTL-${Date.now()}`,
          timestamp: new Date(),
          enemyName: opponent.name,
          enemyLevel: opponent.level,
          result: isVictory ? 'VICTORIA' : 'DERROTA',
          goldChange: goldGain,
          xpChange: xpGain,
          roundsTaken: simulation.rounds,
          details: "Cargando crónica...",
          turns: simulation.turns,
          rankChange: rankChange
      };

      // Set UI for Battle View
      setActiveBattle({ 
          enemy: opponent, 
          result: battleLog, 
          narrative: "", 
          opponentData: opponent 
      });
      setCurrentView(ViewState.BATTLE);
      setIsInitializingBattle(false);

      // Async Narrative Generation
      try {
          const narrative = await generateBattleNarrative(player, opponent.name, isVictory, simulation.rounds);
          setActiveBattle(prev => prev ? { ...prev, narrative, result: { ...prev.result, details: narrative } } : null);
      } catch {
          setActiveBattle(prev => prev ? { ...prev, narrative: "Combate finalizado." } : null);
      }
  };

  const handleFinishBattle = () => {
      if (activeBattle && activeBattle.opponentData) {
          actions.processBattleResult(activeBattle.result, activeBattle.opponentData.arenaRank || 50);
      }
      setActiveBattle(null);
      setCurrentView(ViewState.ARENA);
  };

  const handleNewGame = (name: string) => {
      actions.startGame(name);
      setCurrentView(ViewState.PROFILE);
  };

  const handleLoadGame = () => {
      if (actions.loadGame()) {
          setCurrentView(ViewState.PROFILE);
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Partida cargada.", type: 'success' });
      }
  };

  const handleImportGame = async (file: File) => {
      if (await actions.importGame(file)) {
          setCurrentView(ViewState.PROFILE);
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Partida importada.", type: 'success' });
      } else {
          eventBus.emit(EventTypes.SHOW_TOAST, { message: "Error al importar.", type: 'error' });
      }
  };

  const handleExit = () => {
      actions.setGameStarted(false);
      setCurrentView(ViewState.WELCOME);
  };

  // --- RENDER ---

  if (!gameStarted) {
      return (
          <div className="h-[100dvh] bg-void text-slate-200 font-sans">
              <ToastSystem />
              <WelcomeView 
                onNewGame={handleNewGame} 
                onLoadGame={handleLoadGame} 
                onImportGame={handleImportGame}
                hasSavedGame={StorageService.hasSave()}
              />
          </div>
      )
  }

  return (
    <div className="h-[100dvh] bg-void text-slate-200 font-sans bg-dark-pattern bg-fixed bg-cover bg-no-repeat flex flex-col overflow-hidden">
        <ToastSystem />
        <TooltipSystem />
        <div className="fixed inset-0 bg-slate-900/85 pointer-events-none z-0"></div>

        {currentView === ViewState.BATTLE && activeBattle && (
            <BattleView 
                player={player} 
                enemy={activeBattle.enemy} 
                narrative={activeBattle.narrative} 
                result={activeBattle.result} 
                onFinish={handleFinishBattle} 
            />
        )}

        <div className="md:hidden relative z-20 flex items-center justify-center p-4 glass-panel border-b border-white/5 shrink-0">
            <Shield className="w-6 h-6 text-gold-500 mr-2" />
            <h1 className="font-serif text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 tracking-wider">
              SHADOWBOUND
            </h1>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row flex-grow overflow-hidden p-0 md:p-8 gap-6 max-w-7xl mx-auto w-full">
            {currentView !== ViewState.BATTLE && <Sidebar currentView={currentView} setView={setCurrentView} onExport={() => StorageService.export(player)} onExit={handleExit} />}
            
            <main className="flex-grow flex flex-col min-h-0 relative">
                <div className="flex-grow overflow-y-auto overflow-x-hidden p-4 md:pr-2 pb-24 md:pb-10 custom-scrollbar">
                    {currentView === ViewState.PROFILE && (
                        <ProfileView 
                            player={player} 
                            onTrainStat={actions.trainStat} 
                            onEquipItem={actions.equipItem}
                            onUnequipItem={actions.unequipItem}
                            onConsumeItem={actions.consumeItem}
                        />
                    )}
                    
                    {currentView === ViewState.TAVERN && (
                        <TavernView 
                            player={player} 
                            onAcceptQuest={actions.processQuest} 
                            onDeductGold={actions.spendGold}
                            onRefreshTavern={actions.refreshTavernTimer}
                            onUpdateQuests={actions.updateQuests}
                            onUseRuby={actions.spendRubies}
                            onRefreshSingleQuest={actions.refreshSingleQuest}
                        />
                    )}
                    
                    {currentView === ViewState.ARENA && (
                        <ArenaView 
                            player={player} 
                            ladder={player.arenaLadder}
                            onStartBattle={handleStartBattle} 
                            isInitializing={isInitializingBattle} 
                            onUseRuby={actions.spendRubies}
                        />
                    )}

                    {currentView === ViewState.GACHA && (
                        <GachaView 
                            player={player} 
                            onSummon={actions.performSummon}
                            onEquip={actions.equipEcho}
                            onBurn={actions.burnEcho}
                        />
                    )}

                    {currentView === ViewState.RANKINGS && (
                        <RankingsView player={player} ladder={player.arenaLadder} />
                    )}

                    {currentView === ViewState.REPORTS && (
                        <ReportsView history={player.battleHistory} />
                    )}
                    
                    {currentView === ViewState.MERCHANT && (
                        <MerchantView 
                            player={player} 
                            onBuyItem={actions.buyItem}
                            onSellItem={actions.sellItem}
                            onDeductGold={actions.spendGold}
                            onDeductRubies={actions.spendRubies}
                        />
                    )}
                </div>
            </main>
        </div>

        {currentView !== ViewState.BATTLE && <MobileNav currentView={currentView} setView={setCurrentView} onExit={handleExit} />}
    </div>
  );
}
