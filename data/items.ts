
import { Item, ItemType, StatType } from "../types";

export const BASE_ITEMS: Omit<Item, 'id' | 'rarity' | 'cost'>[] = [
    // Weapons
    { name: "Espada Mellada", level: 1, type: ItemType.WEAPON, stats: { [StatType.STRENGTH]: 4 }, description: "Suficiente peso para penetrar cuero.", image: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?q=80&w=200&auto=format&fit=crop" },
    { name: "Daga Oxidada", level: 1, type: ItemType.WEAPON, stats: { [StatType.DEXTERITY]: 4 }, description: "Permite movimientos rápidos.", image: "https://images.unsplash.com/photo-1593175866164-323e06f97f8c?q=80&w=200&auto=format&fit=crop" },
    { name: "Vara de Fresno", level: 1, type: ItemType.WEAPON, stats: { [StatType.INTELLIGENCE]: 4 }, description: "Crepita con magia residual.", image: "https://images.unsplash.com/photo-1535581652167-3d6b9bc27633?q=80&w=200&auto=format&fit=crop" },
    { name: "Hacha de Leñador", level: 1, type: ItemType.WEAPON, stats: { [StatType.STRENGTH]: 6 }, description: "Brutal pero lenta.", image: "https://images.unsplash.com/photo-1589993356658-963d89856e72?q=80&w=200&auto=format&fit=crop" },
    
    // Armor
    { name: "Harapos", level: 1, type: ItemType.ARMOR, stats: { [StatType.CONSTITUTION]: 3 }, description: "Mejor que ir desnudo.", image: "https://images.unsplash.com/photo-1563820251-149c9519532e?q=80&w=200&auto=format&fit=crop" },
    { name: "Jubón de Cuero", level: 1, type: ItemType.ARMOR, stats: { [StatType.CONSTITUTION]: 4, [StatType.DEXTERITY]: 2 }, description: "Ligero, no estorba.", image: "https://images.unsplash.com/photo-1445633760012-6eb6d31849a6?q=80&w=200&auto=format&fit=crop" },
    { name: "Cota de Anillas", level: 1, type: ItemType.ARMOR, stats: { [StatType.CONSTITUTION]: 8, [StatType.STRENGTH]: 1 }, description: "Protección sólida.", image: "https://images.unsplash.com/photo-1549488347-194165d2df89?q=80&w=200&auto=format&fit=crop" },

    // Helmets
    { name: "Capucha Vieja", level: 1, type: ItemType.HELMET, stats: { [StatType.DEXTERITY]: 2, [StatType.INTELLIGENCE]: 1 }, description: "Favorece la concentración.", image: "https://images.unsplash.com/photo-1509623233860-2525492d501b?q=80&w=200&auto=format&fit=crop" },
    { name: "Casco de Hierro", level: 1, type: ItemType.HELMET, stats: { [StatType.CONSTITUTION]: 4 }, description: "Protege lo importante.", image: "https://images.unsplash.com/photo-1565551829623-e4c19790604e?q=80&w=200&auto=format&fit=crop" },

    // Boots
    { name: "Sandalias", level: 1, type: ItemType.BOOTS, stats: { [StatType.DEXTERITY]: 2 }, description: "Suela fina.", image: "https://images.unsplash.com/photo-1605218427306-0222070cca9a?q=80&w=200&auto=format&fit=crop" },
    { name: "Botas de Cuero", level: 1, type: ItemType.BOOTS, stats: { [StatType.STRENGTH]: 1, [StatType.CONSTITUTION]: 2 }, description: "Buen agarre.", image: "https://images.unsplash.com/photo-1559563458-52c69c8e3079?q=80&w=200&auto=format&fit=crop" },

    // Amulets
    { name: "Amuleto de Cobre", level: 1, type: ItemType.AMULET, stats: { [StatType.INTELLIGENCE]: 3 }, description: "Conductor mágico simple.", image: "https://images.unsplash.com/photo-1605218456209-642594582f6e?q=80&w=200&auto=format&fit=crop" },
    { name: "Colgante de Piedra", level: 1, type: ItemType.AMULET, stats: { [StatType.CONSTITUTION]: 4 }, description: "Pesado y duradero.", image: "https://images.unsplash.com/photo-1616773539828-56890333066a?q=80&w=200&auto=format&fit=crop" }
];
