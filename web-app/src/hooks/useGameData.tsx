/**
 * React hooks for accessing game data
 */
import { useState, useEffect, useMemo, createContext, useContext, type ReactNode } from 'react';
import type { GameDatabase, GameItem, GameNpc, GameSpell, GameClass, GameQuest } from '../types/game';
import { loadGameDatabase } from '../data/indexer';

// Context for game data
interface GameDataContextValue {
    database: GameDatabase | null;
    loading: boolean;
    error: string | null;
}

const GameDataContext = createContext<GameDataContextValue>({
    database: null,
    loading: true,
    error: null,
});

/**
 * Provider component for game data
 */
export function GameDataProvider({ children }: { children: ReactNode }) {
    const [database, setDatabase] = useState<GameDatabase | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadGameDatabase()
            .then(setDatabase)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <GameDataContext.Provider value={{ database, loading, error }
        }>
            {children}
        </GameDataContext.Provider>
    );
}

/**
 * Hook to access the full game database
 */
export function useGameData(): GameDataContextValue {
    return useContext(GameDataContext);
}

/**
 * Hook to search items by name
 */
export function useItemSearch(query: string): GameItem[] {
    const { database } = useGameData();

    return useMemo(() => {
        if (!database || !query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        const results: GameItem[] = [];

        for (const item of database.items.values()) {
            if (item.name.toLowerCase().includes(lowerQuery)) {
                results.push(item);
            }
        }

        // Sort by relevance (exact match first, then by name)
        return results.sort((a, b) => {
            const aExact = a.name.toLowerCase() === lowerQuery;
            const bExact = b.name.toLowerCase() === lowerQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.name.localeCompare(b.name);
        }).slice(0, 50); // Limit results
    }, [database, query]);
}

/**
 * Hook to search NPCs by name
 */
export function useNpcSearch(query: string): GameNpc[] {
    const { database } = useGameData();

    return useMemo(() => {
        if (!database || !query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        const results: GameNpc[] = [];

        for (const npc of database.npcs.values()) {
            if (npc.name.toLowerCase().includes(lowerQuery)) {
                results.push(npc);
            }
        }

        return results.sort((a, b) => {
            const aExact = a.name.toLowerCase() === lowerQuery;
            const bExact = b.name.toLowerCase() === lowerQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.name.localeCompare(b.name);
        }).slice(0, 50);
    }, [database, query]);
}

/**
 * Hook to get an item by ID
 */
export function useItem(id: number): GameItem | undefined {
    const { database } = useGameData();
    return database?.items.get(id);
}

/**
 * Hook to get an NPC by ID
 */
export function useNpc(id: number): GameNpc | undefined {
    const { database } = useGameData();
    return database?.npcs.get(id);
}

/**
 * Hook to get a spell by ID
 */
export function useSpell(id: number): GameSpell | undefined {
    const { database } = useGameData();
    return database?.spells.get(id);
}

/**
 * Hook to get a class by ID
 */
export function useClass(id: number): GameClass | undefined {
    const { database } = useGameData();
    return database?.classes.get(id);
}

/**
 * Hook to search spells by name
 */
export function useSpellSearch(query: string): GameSpell[] {
    const { database } = useGameData();

    return useMemo(() => {
        if (!database || !query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        const results: GameSpell[] = [];

        for (const spell of database.spells.values()) {
            if (spell.name.toLowerCase().includes(lowerQuery)) {
                results.push(spell);
            }
        }

        return results.sort((a, b) => {
            const aExact = a.name.toLowerCase() === lowerQuery;
            const bExact = b.name.toLowerCase() === lowerQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.name.localeCompare(b.name);
        }).slice(0, 50);
    }, [database, query]);
}

/**
 * Hook for combined search (items + NPCs + spells)
 */
export function useGlobalSearch(query: string): { items: GameItem[]; npcs: GameNpc[]; spells: GameSpell[] } {
    const items = useItemSearch(query);
    const npcs = useNpcSearch(query);
    const spells = useSpellSearch(query);

    return { items, npcs, spells };
}

import type { ItemType, NpcType } from '../types/game';

export interface SearchFilters {
    itemTypes: Set<ItemType>;
    npcTypes: Set<NpcType>;
    sortBy: 'name' | 'id' | 'level';
}

/**
 * Hook for filtered search with type filtering and sorting
 */
export function useFilteredGlobalSearch(
    query: string,
    filters: SearchFilters
): { items: GameItem[]; npcs: GameNpc[]; spells: GameSpell[]; quests: GameQuest[] } {
    const { database } = useGameData();

    return useMemo(() => {
        if (!database) return { items: [], npcs: [], spells: [], quests: [] };

        const lowerQuery = query.toLowerCase().trim();
        const hasQuery = lowerQuery.length > 0;
        const hasItemFilters = filters.itemTypes.size > 0;
        const hasNpcFilters = filters.npcTypes.size > 0;

        // Filter items
        let items: GameItem[] = [];
        if (!hasNpcFilters || hasItemFilters) {
            for (const item of database.items.values()) {
                // Skip if query doesn't match
                if (hasQuery && !item.name.toLowerCase().includes(lowerQuery)) continue;
                // Skip if type filter is active and doesn't match
                if (hasItemFilters && !filters.itemTypes.has(item.type)) continue;
                items.push(item);
            }
        }

        // Filter NPCs
        let npcs: GameNpc[] = [];
        if (!hasItemFilters || hasNpcFilters) {
            for (const npc of database.npcs.values()) {
                if (hasQuery && !npc.name.toLowerCase().includes(lowerQuery)) continue;
                if (hasNpcFilters && !filters.npcTypes.has(npc.type)) continue;
                npcs.push(npc);
            }
        }

        // Filter spells (no type filter for spells, just query)
        let spells: GameSpell[] = [];
        if (!hasItemFilters && !hasNpcFilters) {
            for (const spell of database.spells.values()) {
                if (hasQuery && !spell.name.toLowerCase().includes(lowerQuery)) continue;
                spells.push(spell);
            }
        }

        // Filter quests (no type filter for quests, just query)
        let quests: GameQuest[] = [];
        if (!hasItemFilters && !hasNpcFilters) {
            for (const quest of database.quests.values()) {
                if (hasQuery && !quest.name.toLowerCase().includes(lowerQuery)) continue;
                quests.push(quest);
            }
        }

        // Sort based on sortBy option
        const sortFn = (a: { name: string; id: number; levelRequirement?: number }, b: { name: string; id: number; levelRequirement?: number }) => {
            switch (filters.sortBy) {
                case 'id':
                    return a.id - b.id;
                case 'level':
                    return (a.levelRequirement ?? 0) - (b.levelRequirement ?? 0);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        };

        items.sort(sortFn);
        npcs.sort((a, b) => filters.sortBy === 'id' ? a.id - b.id : a.name.localeCompare(b.name));
        spells.sort((a, b) => filters.sortBy === 'id' ? a.id - b.id : a.name.localeCompare(b.name));
        quests.sort((a, b) => filters.sortBy === 'id' ? a.id - b.id : a.name.localeCompare(b.name));

        // Limit results when showing all without query
        const maxResults = hasQuery ? 50 : 100;
        return {
            items: items.slice(0, maxResults),
            npcs: npcs.slice(0, maxResults),
            spells: spells.slice(0, maxResults),
            quests: quests.slice(0, maxResults),
        };
    }, [database, query, filters]);
}
