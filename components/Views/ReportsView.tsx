
import React, { useState } from 'react';
import { BattleLog } from '../../types';
import { FileText, Search, Trophy, Skull, Clock, ChevronRight, X } from 'lucide-react';

interface ReportsViewProps {
  history: BattleLog[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ history }) => {
  const [selectedLog, setSelectedLog] = useState<BattleLog | null>(null);

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full pb-8">
      
      {/* Header & Stats Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="font-serif text-2xl md:text-3xl text-slate-200 flex items-center gap-3">
                <FileText className="w-8 h-8 text-gold-500" /> Anales de Guerra
            </h2>
            <p className="text-slate-500 text-sm italic">Crónicas de tus encuentros en las sombras.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
             <div className="flex-grow md:flex-grow-0 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Buscar enemigo..."
                    className="bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-gold-500 outline-none w-full"
                />
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-grow min-h-0">
          
          {/* List Column */}
          <div className="xl:col-span-12 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col bg-slate-900/40">
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span className="w-12 text-center">Tipo</span>
                  <span className="flex-grow px-4">Adversario</span>
                  <span className="w-32 hidden md:block">Botín</span>
                  <span className="w-32 hidden md:block text-right">Fecha</span>
                  <span className="w-12"></span>
              </div>
              
              <div className="overflow-y-auto flex-grow custom-scrollbar">
                  {history.length === 0 ? (
                      <div className="p-20 text-center opacity-30 flex flex-col items-center gap-4">
                          <FileText className="w-16 h-16" />
                          <p className="font-serif text-xl italic underline decoration-gold-500/20 underline-offset-8">Aún no se han escrito crónicas...</p>
                      </div>
                  ) : (
                      history.slice().reverse().map((log) => (
                          <div 
                            key={log.id} 
                            onClick={() => setSelectedLog(log)}
                            className="group flex items-center p-4 border-b border-white/5 hover:bg-gold-500/5 transition-all cursor-pointer"
                          >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                                    log.result === 'VICTORIA' ? 'bg-gold-500/10 border-gold-500/20 text-gold-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}>
                                    {log.result === 'VICTORIA' ? <Trophy className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
                                </div>
                                
                                <div className="flex-grow px-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-200 group-hover:text-gold-400 transition-colors">{log.enemyName}</h4>
                                        <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">NVL {log.enemyLevel}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 md:hidden">
                                        <Clock className="w-2.5 h-2.5" /> {log.timestamp.toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="w-32 hidden md:flex flex-col gap-0.5">
                                    <span className="text-xs font-mono text-gold-500">+{log.goldChange} Oro</span>
                                    <span className="text-[10px] font-mono text-purple-400">+{log.xpChange} XP</span>
                                </div>

                                <div className="w-32 hidden md:block text-right">
                                    <div className="text-[11px] font-mono text-slate-500">{log.timestamp.toLocaleDateString()}</div>
                                    <div className="text-[10px] font-mono text-slate-600">{log.timestamp.toLocaleTimeString()}</div>
                                </div>

                                <div className="w-12 flex justify-center text-slate-700 group-hover:text-gold-500 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {/* Detail Overlay / Modal */}
      {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fade-in">
              <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-white/10">
                  <div className="relative h-32 md:h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                        <button 
                            onClick={() => setSelectedLog(null)}
                            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-all border border-white/5 z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="relative z-10 text-center">
                            <h3 className="font-serif text-2xl text-white tracking-widest uppercase">Informe de Combate</h3>
                            <div className="text-xs text-gold-500 font-mono tracking-widest mt-1">ID: {selectedLog.id}</div>
                        </div>
                  </div>

                  <div className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
                                    selectedLog.result === 'VICTORIA' ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-red-500/10 border-red-500 text-red-500'
                                }`}>
                                    {selectedLog.result === 'VICTORIA' ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-2xl font-serif text-white">{selectedLog.enemyName}</h4>
                                        <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded">NVL {selectedLog.enemyLevel}</span>
                                    </div>
                                    <p className={`text-sm font-bold uppercase tracking-widest ${selectedLog.result === 'VICTORIA' ? 'text-gold-500' : 'text-red-500'}`}>
                                        {selectedLog.result}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                                <div className="bg-black/40 px-4 py-2 rounded-xl border border-gold-500/20 text-center">
                                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Oro</span>
                                    <span className="text-gold-400 font-mono font-bold">+{selectedLog.goldChange}</span>
                                </div>
                                <div className="bg-black/40 px-4 py-2 rounded-xl border border-purple-500/20 text-center">
                                    <span className="block text-[10px] text-slate-500 font-bold uppercase">XP</span>
                                    <span className="text-purple-400 font-mono font-bold">+{selectedLog.xpChange}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Narrativa del Encuentro
                            </h5>
                            <p className="text-slate-300 italic font-serif leading-relaxed text-lg">
                                "{selectedLog.details}"
                            </p>
                        </div>

                        <button 
                            onClick={() => setSelectedLog(null)}
                            className="mt-8 w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-serif font-bold rounded-xl transition-all border border-white/5"
                        >
                            Cerrar Archivo
                        </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
