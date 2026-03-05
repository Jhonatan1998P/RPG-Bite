
import React, { useState, useRef } from 'react';
import { generateRandomPlayerName } from '../../utils/gameEngine';
import { Shield, Play, Upload, Download, Save, RefreshCw } from 'lucide-react';

interface WelcomeViewProps {
  onNewGame: (playerName: string) => void;
  onLoadGame: () => void;
  onImportGame: (file: File) => void;
  hasSavedGame: boolean;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onNewGame, onLoadGame, onImportGame, hasSavedGame }) => {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartNew = () => {
    if (name.trim()) {
        onNewGame(name.trim());
    } else {
        const random = generateRandomPlayerName();
        onNewGame(random);
    }
  };

  const handleRandomize = () => {
    setName(generateRandomPlayerName());
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          onImportGame(file);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2544&auto=format&fit=crop')] bg-cover bg-center opacity-30 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-[#020617]/50 z-0"></div>
        
        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
            <div className="text-center mb-10">
                <Shield className="w-16 h-16 text-gold-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 tracking-wider mb-2 drop-shadow-sm">
                    SHADOWBOUND
                </h1>
                <p className="text-slate-400 font-serif tracking-widest text-sm uppercase">La Noche Eterna</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                {!isCreating ? (
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-500 hover:to-gold-600 text-black font-serif font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                        >
                            <Play className="w-5 h-5" /> Nueva Aventura
                        </button>

                        <button 
                            onClick={onLoadGame}
                            disabled={!hasSavedGame}
                            className={`w-full py-4 border font-serif font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3
                                ${hasSavedGame 
                                    ? 'bg-slate-800/50 border-gold-500/30 text-gold-400 hover:bg-slate-800 hover:border-gold-500/50' 
                                    : 'bg-slate-900/30 border-white/5 text-slate-600 cursor-not-allowed'}
                            `}
                        >
                            <Save className="w-5 h-5" /> Cargar Partida
                        </button>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".json" 
                                onChange={handleFileChange}
                             />
                             <button 
                                onClick={triggerImport}
                                className="py-3 bg-slate-900/50 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                             >
                                <Upload className="w-4 h-4" /> Importar
                             </button>
                             {/* Placeholder for symmetry or credits */}
                             <div className="py-3 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                                v1.3.1 Build
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div className="text-center">
                            <h3 className="font-serif text-xl text-white mb-1">¿Quién eres, viajero?</h3>
                            <p className="text-xs text-slate-500">Elige tu nombre para pasar a la historia.</p>
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nombre del Héroe"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-gold-400 font-serif text-lg focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-slate-700"
                                autoFocus
                            />
                            <button 
                                onClick={handleRandomize}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
                                title="Generar nombre aleatorio"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-xs rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleStartNew}
                                className="flex-[2] py-3 bg-gold-600 hover:bg-gold-500 text-black font-bold uppercase text-xs rounded-xl shadow-lg transition-all"
                            >
                                Comenzar
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <p className="text-center text-[10px] text-slate-600 mt-8 font-mono">
                El progreso se guarda automáticamente en tu navegador.
                <br/>Usa Importar/Exportar para mover tu partida.
            </p>
        </div>
    </div>
  );
};
