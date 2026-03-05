
import { Player } from "../types";

const SAVE_KEY = 'shadowbound_save_v1';

export const StorageService = {
  save: (player: Player): void => {
    try {
      const json = JSON.stringify(player);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      localStorage.setItem(SAVE_KEY, encoded);
    } catch (e) {
      console.error("Save failed", e);
    }
  },

  load: (initialState: Player): Player | null => {
    try {
      const encoded = localStorage.getItem(SAVE_KEY);
      if (!encoded) return null;
      const json = decodeURIComponent(escape(atob(encoded)));
      const loadedPlayer = JSON.parse(json);
      // Merge with initial state to ensure new fields in updates don't break old saves
      return { ...initialState, ...loadedPlayer };
    } catch (e) {
      console.error("Load failed", e);
      return null;
    }
  },

  hasSave: (): boolean => {
    return !!localStorage.getItem(SAVE_KEY);
  },

  export: (player: Player) => {
    const json = JSON.stringify(player, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shadowbound_${player.name}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  import: (file: File): Promise<Player> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            const json = decodeURIComponent(escape(atob(text)));
            data = JSON.parse(json);
          }

          if (data && data.name && data.stats) {
            resolve(data);
          } else {
            reject(new Error("Formato de archivo inválido"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }
};
