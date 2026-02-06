/**
 * Map file loader using eolib-ts
 * Loads EMF files and extracts map data including NPC spawns
 */
import { EoReader, Emf } from 'eolib';
import type { GameMap } from '../types/game';

const MAP_PATH = '/maps';

async function loadMapFile(mapId: number): Promise<Uint8Array | null> {
    const filename = String(mapId).padStart(5, '0') + '.emf';
    try {
        const response = await fetch(`${MAP_PATH}/${filename}`);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    } catch {
        return null;
    }
}

export interface MapNpcSpawn {
    mapId: number;
    mapName: string;
    npcId: number;
    x: number;
    y: number;
    spawnType: number;
    spawnTime: number;
    amount: number;
}

/**
 * Load all maps and return map data + NPC spawn locations
 */
export async function loadMaps(): Promise<{
    maps: Map<number, GameMap>;
    npcSpawns: MapNpcSpawn[];
}> {
    const maps = new Map<number, GameMap>();
    const npcSpawns: MapNpcSpawn[] = [];

    // Load maps 0-400 (covers the 363 maps we have)
    const mapPromises: Promise<{ id: number; data: Uint8Array | null }>[] = [];
    for (let i = 0; i <= 400; i++) {
        mapPromises.push(
            loadMapFile(i).then(data => ({ id: i, data }))
        );
    }

    const results = await Promise.all(mapPromises);

    for (const { id, data } of results) {
        if (!data || data.length < 10) continue;

        try {
            const reader = new EoReader(data);
            const emf = Emf.deserialize(reader);

            const gameMap: GameMap = {
                id,
                name: emf.name || `Map ${id}`,
            };
            maps.set(id, gameMap);

            // Extract NPC spawns
            for (const npc of emf.npcs) {
                npcSpawns.push({
                    mapId: id,
                    mapName: gameMap.name,
                    npcId: npc.id,
                    x: npc.coords.x,
                    y: npc.coords.y,
                    spawnType: npc.spawnType,
                    spawnTime: npc.spawnTime,
                    amount: npc.amount,
                });
            }
        } catch (e) {
            // Skip malformed maps
            console.warn(`Failed to parse map ${id}:`, e);
        }
    }

    console.log(`Loaded ${maps.size} maps with ${npcSpawns.length} NPC spawn points`);
    return { maps, npcSpawns };
}
