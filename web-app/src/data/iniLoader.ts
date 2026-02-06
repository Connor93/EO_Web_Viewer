/**
 * INI file loaders for server configuration data
 * Parses drops.ini, shops.ini, pets.ini, specialdrops.ini, specialmobs.ini, npcspellcast.ini
 */
import type {
    ItemDrop,
    CraftIngredient,
    SpecialDropInfo,
    SpecialSpawnInfo,
    SpellcastInfo,
    PetInfo,
} from '../types/game';

const DATA_PATH = '/data';

async function loadTextFile(path: string): Promise<string> {
    const response = await fetch(`${DATA_PATH}/${path}`);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return response.text();
}

function parseIniLine(line: string): { key: string; value: string } | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
        return null;
    }

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) {
        return null;
    }

    return {
        key: trimmed.substring(0, equalIndex).trim(),
        value: trimmed.substring(equalIndex + 1).trim(),
    };
}

/**
 * Parse drops.ini - NPC drop tables
 * Format: npc_id = itemId,min,max,rate, itemId,min,max,rate, ...
 */
export interface DropData {
    npcId: number;
    drops: ItemDrop[];
}

export async function loadDrops(): Promise<Map<number, ItemDrop[]>> {
    let content: string;
    try {
        content = await loadTextFile('drops.ini');
    } catch {
        console.warn('drops.ini not found or failed to load');
        return new Map();
    }
    const lines = content.split('\n');
    console.log(`[loadDrops] Loaded ${lines.length} lines from drops.ini`);

    const drops = new Map<number, ItemDrop[]>();
    let parsedLines = 0;

    for (const line of lines) {
        const parsed = parseIniLine(line);
        if (!parsed) continue;

        // Skip section headers like [DROPS]
        if (parsed.key.startsWith('[')) continue;

        const npcId = parseInt(parsed.key, 10);
        if (isNaN(npcId)) continue;

        parsedLines++;

        // Parse value: itemId,min,max,rate, itemId,min,max,rate, ...
        // Plain CSV, groups of 4
        const parts = parsed.value.split(',').map(s => s.trim()).filter(s => s !== '');
        const npcDrops: ItemDrop[] = [];

        // Changed condition: i + 4 <= parts.length to include the last group
        for (let i = 0; i + 4 <= parts.length; i += 4) {
            const itemId = parseInt(parts[i], 10);
            const min = parseInt(parts[i + 1], 10);
            const max = parseInt(parts[i + 2], 10);
            const rate = parseFloat(parts[i + 3]);

            if (!isNaN(itemId) && !isNaN(min) && !isNaN(max) && !isNaN(rate)) {
                npcDrops.push({
                    itemId,
                    itemName: '', // Will be populated by indexer
                    minAmount: min,
                    maxAmount: max,
                    dropRate: rate,
                });
            }
        }

        if (npcDrops.length > 0) {
            drops.set(npcId, npcDrops);
        }
    }

    console.log(`[loadDrops] Parsed ${parsedLines} lines, found ${drops.size} NPC drop tables`);
    return drops;
}


/**
 * Parse shops.ini - Shop buy/sell and crafting data
 * Format: 
 *   shopId.name = Shop Name
 *   shopId.trade = itemId,buyPrice,sellPrice, itemId,buyPrice,sellPrice, ...
 *   shopId.craft = resultItemId,ingr1,amt1,ingr2,amt2,ingr3,amt3,ingr4,amt4
 */
export interface ShopData {
    id: number;
    name: string;
    trades: { itemId: number; buyPrice?: number; sellPrice?: number }[];
    crafts: { resultItemId: number; ingredients: CraftIngredient[] }[];
}

export async function loadShops(): Promise<Map<number, ShopData>> {
    let content: string;
    try {
        content = await loadTextFile('shops.ini');
    } catch {
        console.warn('shops.ini not found or failed to load');
        return new Map();
    }
    const lines = content.split('\n');
    console.log(`[loadShops] Loaded ${lines.length} lines from shops.ini`);

    const shops = new Map<number, ShopData>();

    for (const line of lines) {
        const parsed = parseIniLine(line);
        if (!parsed) continue;

        // Handle shopId.property format
        const dotIndex = parsed.key.indexOf('.');
        if (dotIndex === -1) continue;

        const shopId = parseInt(parsed.key.substring(0, dotIndex), 10);
        const property = parsed.key.substring(dotIndex + 1);

        if (isNaN(shopId)) continue;

        // Get or create shop entry
        if (!shops.has(shopId)) {
            shops.set(shopId, { id: shopId, name: '', trades: [], crafts: [] });
        }
        const shop = shops.get(shopId)!;

        switch (property) {
            case 'name':
                shop.name = parsed.value;
                break;

            case 'trade':
                // Parse trade entries: itemId,buyPrice,sellPrice, itemId,buyPrice,sellPrice, ...
                // Plain CSV, groups of 3
                {
                    const parts = parsed.value.split(',').map(s => s.trim()).filter(s => s !== '');
                    // Fixed: use <= to include the last complete group
                    for (let i = 0; i + 3 <= parts.length; i += 3) {
                        const itemId = parseInt(parts[i], 10);
                        const buyPrice = parseInt(parts[i + 1], 10);
                        const sellPrice = parseInt(parts[i + 2], 10);
                        if (!isNaN(itemId) && !isNaN(buyPrice) && !isNaN(sellPrice)) {
                            shop.trades.push({ itemId, buyPrice, sellPrice });
                        }
                    }
                }
                break;

            case 'craft':
                // Parse craft entries: outputId,ingr1,amt1,ingr2,amt2,ingr3,amt3,ingr4,amt4, ...
                // Plain CSV, groups of 9
                {
                    const parts = parsed.value.split(',').map(s => s.trim()).filter(s => s !== '');
                    // Fixed: use <= to include the last complete group
                    for (let i = 0; i + 9 <= parts.length; i += 9) {
                        const resultItemId = parseInt(parts[i], 10);
                        if (isNaN(resultItemId)) continue;

                        const ingredients: CraftIngredient[] = [];

                        // 4 ingredient slots (pairs of itemId, amount)
                        for (let j = 0; j < 4; j++) {
                            const ingrId = parseInt(parts[i + 1 + j * 2], 10);
                            const ingrAmt = parseInt(parts[i + 2 + j * 2], 10);

                            if (!isNaN(ingrId) && ingrId > 0 && !isNaN(ingrAmt) && ingrAmt > 0) {
                                ingredients.push({
                                    itemId: ingrId,
                                    itemName: '', // Will be populated by indexer
                                    amount: ingrAmt,
                                });
                            }
                        }

                        if (ingredients.length > 0) {
                            shop.crafts.push({ resultItemId, ingredients });
                        }
                    }
                }
                break;
        }
    }

    console.log(`[loadShops] Found ${shops.size} shops`);
    return shops;
}


/**
 * Parse pets.ini - Pet NPC mappings
 * Format: itemId = {npcId, str, int, wis, agi, con, cha, armor, evade, accuracy, minDam, maxDam}
 */
export async function loadPets(): Promise<Map<number, PetInfo>> {
    const content = await loadTextFile('pets.ini');
    const lines = content.split('\n');

    const pets = new Map<number, PetInfo>();

    for (const line of lines) {
        const parsed = parseIniLine(line);
        if (!parsed) continue;

        const itemId = parseInt(parsed.key, 10);
        if (isNaN(itemId)) continue;

        // Parse value: {npcId, str, int, wis, agi, con, cha, armor, evade, accuracy, minDam, maxDam}
        const match = parsed.value.match(/\{(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\}/);
        if (!match) continue;

        pets.set(parseInt(match[1], 10), { // Map by NPC ID
            itemId,
            itemName: '', // Will be populated by indexer
            stats: {
                str: parseInt(match[2], 10),
                int: parseInt(match[3], 10),
                wis: parseInt(match[4], 10),
                agi: parseInt(match[5], 10),
                con: parseInt(match[6], 10),
                cha: parseInt(match[7], 10),
                armor: parseInt(match[8], 10),
                evade: parseInt(match[9], 10),
                accuracy: parseInt(match[10], 10),
                minDamage: parseInt(match[11], 10),
                maxDamage: parseInt(match[12], 10),
            },
        });
    }

    return pets;
}

/**
 * Parse specialdrops.ini - Special drop effects
 * Format: itemId = {effect, serverMessage (0/1)}
 */
export async function loadSpecialDrops(): Promise<Map<number, SpecialDropInfo>> {
    const content = await loadTextFile('specialdrops.ini');
    const lines = content.split('\n');

    const specialDrops = new Map<number, SpecialDropInfo>();

    for (const line of lines) {
        const parsed = parseIniLine(line);
        if (!parsed) continue;

        const itemId = parseInt(parsed.key, 10);
        if (isNaN(itemId)) continue;

        const match = parsed.value.match(/\{(\d+),(\d+)\}/);
        if (!match) continue;

        specialDrops.set(itemId, {
            effect: parseInt(match[1], 10),
            serverMessage: parseInt(match[2], 10) === 1,
        });
    }

    return specialDrops;
}

/**
 * Parse specialmobs.ini - Special mob spawns
 * Format: id = {monsterId, spawnId, chance, amount[, "message"]}
 */
export async function loadSpecialMobs(): Promise<SpecialSpawnInfo[]> {
    const content = await loadTextFile('specialmobs.ini');
    const lines = content.split('\n');

    const specialMobs: SpecialSpawnInfo[] = [];

    for (const line of lines) {
        const parsed = parseIniLine(line);
        if (!parsed) continue;

        // Match pattern with optional quoted message
        const match = parsed.value.match(/\{(\d+),(\d+),([\d.]+),(\d+)(?:,"([^"]*)")?\}/);
        if (!match) continue;

        specialMobs.push({
            spawnFromNpcId: parseInt(match[1], 10),
            spawnFromNpcName: '', // Will be populated by indexer
            chance: parseFloat(match[3]),
            amount: parseInt(match[4], 10),
            message: match[5] || undefined,
        });
    }

    return specialMobs;
}

/**
 * Parse npcspellcast.ini - NPC spellcasting data
 * Format: npcId = {spellId, castType (0=target, 1=aoe), damage, chance}
 */
export async function loadNpcSpellcasts(): Promise<Map<number, SpellcastInfo[]>> {
    const content = await loadTextFile('npcspellcast.ini');
    const lines = content.split('\n');

    const spellcasts = new Map<number, SpellcastInfo[]>();

    for (const line of lines) {
        const parsed = parseIniLine(line);
        if (!parsed) continue;

        const npcId = parseInt(parsed.key, 10);
        if (isNaN(npcId)) continue;

        const castMatches = parsed.value.matchAll(/\{(\d+),(\d+),(\d+),([\d.]+)\}/g);
        const npcCasts: SpellcastInfo[] = [];

        for (const match of castMatches) {
            npcCasts.push({
                spellId: parseInt(match[1], 10),
                spellName: '', // Will be populated by indexer
                castType: parseInt(match[2], 10) === 0 ? 'target' : 'aoe',
                damage: parseInt(match[3], 10),
                chance: parseFloat(match[4]),
            });
        }

        if (npcCasts.length > 0) {
            spellcasts.set(npcId, npcCasts);
        }
    }

    return spellcasts;
}
