
import { Player, StatType } from "../types";

// --- PLANTILLAS DE TEXTO PROCEDURAL ---

const QUEST_DESCRIPTIONS_BASE = [
    "Se ha avistado una amenaza en la zona. Se requiere discreción y fuerza.",
    "Un antiguo artefacto ha sido localizado. Recupéralo antes que los carroñeros.",
    "Los aldeanos reportan ruidos extraños y desapariciones nocturnas.",
    "Un noble local paga bien por la eliminación de este problema.",
    "Las sombras se alargan en este lugar. Solo los valientes regresan.",
    "Una bestia salvaje acecha los caminos comerciales. Acaba con ella.",
    "Se busca mercenario capaz para una tarea de alto riesgo.",
    "Explora las ruinas y trae cualquier objeto de valor.",
    "Limpia la zona de bandidos y malhechores.",
    "Investiga la fuente de la corrupción que emana de este lugar."
];

const BATTLE_VICTORY_TEMPLATES = [
    (p: string, e: string) => `Tras un intercambio brutal de golpes, ${p} logra atravesar la defensa de ${e}.`,
    (p: string, e: string) => `${e} subestimó tu poder y pagó el precio con su derrota.`,
    (p: string, e: string) => `Con una maniobra experta, ${p} finaliza el combate victorioso.`,
    (p: string, e: string) => `${e} cae al suelo, incapaz de soportar la ofensiva de ${p}.`,
    (p: string, e: string) => `La estrategia de ${p} fue superior. ${e} ha sido eliminado.`
];

const BATTLE_DEFEAT_TEMPLATES = [
    (p: string, e: string) => `${e} fue demasiado rápido. ${p} cae herido de gravedad.`,
    (p: string, e: string) => `A pesar del esfuerzo, ${p} no pudo superar la fuerza de ${e}.`,
    (p: string, e: string) => `${e} conecta un golpe devastador que deja a ${p} fuera de combate.`,
    (p: string, e: string) => `La defensa de ${p} se rompió ante la furia de ${e}.`,
    (p: string, e: string) => `${p} se retira, superado por la habilidad de ${e}.`
];

const QUEST_SUCCESS_TEMPLATES = [
    "Misión cumplida. El pago es justo.",
    "Regresas triunfante y con los bolsillos más pesados.",
    "El trabajo está hecho. Nadie hará más preguntas.",
    "Una ejecución impecable. Tu reputación crece.",
    "Objetivo neutralizado. Hora de cobrar."
];

const QUEST_FAILURE_TEMPLATES = [
    "La misión fue un desastre. Apenas lograste escapar.",
    "Fuiste emboscado y obligado a retirarte.",
    "El objetivo era más fuerte de lo esperado. Fracaso.",
    "Regresas con las manos vacías y el orgullo herido.",
    "Tuviste que huir para salvar tu vida."
];

// --- FUNCIONES DE SERVICIO (MOCK PROCEDURAL) ---

export const generateQuestNarrativesBatch = async (quests: { title: string, rarity: string }[], playerLevel: number): Promise<string[]> => {
    // Simula una operación asíncrona muy rápida
    return new Promise((resolve) => {
        const descriptions = quests.map((q) => {
            // Selección determinista basada en el título para que parezca coherente
            const index = (q.title.length + playerLevel) % QUEST_DESCRIPTIONS_BASE.length;
            return QUEST_DESCRIPTIONS_BASE[index];
        });
        resolve(descriptions);
    });
};

export const generateBattleNarrative = async (player: Player, enemyName: string, isVictory: boolean, rounds: number): Promise<string> => {
    return new Promise((resolve) => {
        const templates = isVictory ? BATTLE_VICTORY_TEMPLATES : BATTLE_DEFEAT_TEMPLATES;
        const index = Math.floor(Math.random() * templates.length); // Aquí el random está bien, es solo sabor local
        const text = templates[index](player.name, enemyName);
        resolve(`${text} (Duración: ${rounds} rondas)`);
    });
};

export const generateQuestResult = async (questTitle: string, isSuccess: boolean): Promise<string> => {
    return new Promise((resolve) => {
        const templates = isSuccess ? QUEST_SUCCESS_TEMPLATES : QUEST_FAILURE_TEMPLATES;
        const index = Math.floor(Math.random() * templates.length);
        resolve(templates[index]);
    });
};
