/**
 * Data Indexer - Builds relationships between game entities
 * Cross-references items, NPCs, shops, drops, crafting, maps, quests, etc.
 */
import type {
    GameItem,
    GameNpc,
    GameSpell,
    GameDatabase,
    GameMap,
    GameQuest,
    NpcDrop,
    ShopInfo,
    CraftInfo,
    MapSpawnInfo,
    QuestInvolvement,
    QuestReward,
    QuestRequirement,
    ItemDrop,
} from '../types/game';

import { loadItems, loadNpcs, loadSpells, loadClasses } from './pubLoader';
import {
    loadDrops,
    loadShops,
    loadPets,
    loadSpecialDrops,
    loadSpecialMobs,
    loadNpcSpellcasts,
    type ShopData,
} from './iniLoader';
import { loadMaps, type MapNpcSpawn } from './mapLoader';
import { loadQuests } from './questLoader';

/**
 * Load all game data and build cross-references
 */
export async function loadGameDatabase(): Promise<GameDatabase> {
    console.log('Loading game data...');

    // Load all base data in parallel
    const [items, npcs, spells, classes] = await Promise.all([
        loadItems(),
        loadNpcs(),
        loadSpells(),
        loadClasses(),
    ]);

    console.log(`Loaded ${items.size} items, ${npcs.size} NPCs, ${spells.size} spells, ${classes.size} classes`);

    // Load relationship data in parallel
    const [drops, shops, pets, specialDrops, specialMobs, npcSpellcasts, mapData, quests] = await Promise.all([
        loadDrops(),
        loadShops(),
        loadPets(),
        loadSpecialDrops(),
        loadSpecialMobs(),
        loadNpcSpellcasts(),
        loadMaps(),
        loadQuests(),
    ]);

    const { maps, npcSpawns } = mapData;
    console.log(`Loaded ${drops.size} NPC drop tables, ${shops.size} shops, ${maps.size} maps, ${quests.size} quests`);

    // Build relationships
    indexDrops(items, npcs, drops);
    indexShops(items, npcs, shops);
    indexPets(items, npcs, pets);
    indexSpecialDrops(items, specialDrops);
    indexSpecialMobs(npcs, specialMobs);
    indexNpcSpellcasts(npcs, spells, npcSpellcasts);
    indexNpcSpawns(npcs, maps, npcSpawns);

    // Build vendor ID (behaviorId) -> NPC lookup for quest indexing
    // Quest files reference NPCs by vendor ID, not by ENF ID
    const npcsByVendorId = new Map<number, GameNpc>();
    for (const npc of npcs.values()) {
        if (npc.behaviorId && npc.behaviorId > 0) {
            npcsByVendorId.set(npc.behaviorId, npc);
        }
    }
    console.log(`Built vendor ID lookup: ${npcsByVendorId.size} NPCs with vendor IDs`);

    indexQuests(npcs, items, quests, npcsByVendorId);

    // Build name lookup indices
    const itemsByName = new Map<string, GameItem>();
    for (const item of items.values()) {
        if (item.name) {
            itemsByName.set(item.name.toLowerCase(), item);
        }
    }

    const npcsByName = new Map<string, GameNpc>();
    for (const npc of npcs.values()) {
        if (npc.name) {
            npcsByName.set(npc.name.toLowerCase(), npc);
        }
    }

    const spellsByName = new Map<string, GameSpell>();
    for (const spell of spells.values()) {
        if (spell.name) {
            spellsByName.set(spell.name.toLowerCase(), spell);
        }
    }

    console.log('Game database loaded and indexed');

    return {
        items,
        npcs,
        spells,
        classes,
        maps,
        quests,
        itemsByName,
        npcsByName,
        spellsByName,
    };
}

/**
 * Index drop relationships between NPCs and items
 */
function indexDrops(
    items: Map<number, GameItem>,
    npcs: Map<number, GameNpc>,
    drops: Map<number, ItemDrop[]>
): void {
    for (const [npcId, npcDrops] of drops) {
        const npc = npcs.get(npcId);
        if (!npc) continue;

        npc.drops = [];

        for (const drop of npcDrops) {
            const item = items.get(drop.itemId);
            if (!item) continue;

            // Populate item name in drop
            drop.itemName = item.name;
            npc.drops.push(drop);

            // Create reverse reference on item
            if (!item.dropsFrom) {
                item.dropsFrom = [];
            }

            const npcDrop: NpcDrop = {
                npcId,
                npcName: npc.name,
                minAmount: drop.minAmount,
                maxAmount: drop.maxAmount,
                dropRate: drop.dropRate,
            };

            item.dropsFrom.push(npcDrop);
        }
    }
}

/**
 * Index shop buy/sell and crafting relationships
 */
function indexShops(
    items: Map<number, GameItem>,
    npcs: Map<number, GameNpc>,
    shops: Map<number, ShopData>
): void {
    for (const [shopId, shop] of shops) {
        // Find NPC for this shop (shop IDs usually match NPC IDs)
        const npc = npcs.get(shopId);

        // Index trades
        for (const trade of shop.trades) {
            const item = items.get(trade.itemId);
            if (!item) continue;

            if (!item.soldAt) {
                item.soldAt = [];
            }

            const shopInfo: ShopInfo = {
                shopId,
                shopName: shop.name,
                npcId: npc?.id,
                npcName: npc?.name,
                buyPrice: trade.buyPrice,
                sellPrice: trade.sellPrice,
            };

            item.soldAt.push(shopInfo);

            // Also add to NPC's shopItems list for NPC detail view
            if (npc) {
                if (!npc.shopItems) {
                    npc.shopItems = [];
                }
                npc.shopItems.push({
                    itemId: trade.itemId,
                    itemName: item.name,
                    buyPrice: trade.buyPrice,
                    sellPrice: trade.sellPrice,
                });
            }
        }

        // Index crafts
        for (const craft of shop.crafts) {
            const resultItem = items.get(craft.resultItemId);
            if (!resultItem) continue;

            if (!resultItem.craftedAt) {
                resultItem.craftedAt = [];
            }

            // Populate ingredient names
            for (const ingredient of craft.ingredients) {
                const ingredientItem = items.get(ingredient.itemId);
                if (ingredientItem) {
                    ingredient.itemName = ingredientItem.name;
                }
            }

            const craftInfo: CraftInfo = {
                shopId,
                shopName: shop.name,
                npcId: npc?.id,
                npcName: npc?.name,
                ingredients: craft.ingredients,
            };

            resultItem.craftedAt.push(craftInfo);

            // Also add to NPC's craftItems list for NPC detail view
            if (npc) {
                if (!npc.craftItems) {
                    npc.craftItems = [];
                }
                npc.craftItems.push({
                    resultItemId: craft.resultItemId,
                    resultItemName: resultItem.name,
                    ingredients: craft.ingredients,
                });
            }
        }
    }
}

/**
 * Index pet relationships between items and NPCs
 */
function indexPets(
    items: Map<number, GameItem>,
    npcs: Map<number, GameNpc>,
    pets: Map<number, import('../types/game').PetInfo>
): void {
    for (const [npcId, petInfo] of pets) {
        const npc = npcs.get(npcId);
        const item = items.get(petInfo.itemId);

        if (npc && item) {
            petInfo.itemName = item.name;
            npc.petVersion = petInfo;
        }
    }
}

/**
 * Index special drop effects on items
 */
function indexSpecialDrops(
    items: Map<number, GameItem>,
    specialDrops: Map<number, import('../types/game').SpecialDropInfo>
): void {
    for (const [itemId, info] of specialDrops) {
        const item = items.get(itemId);
        if (item) {
            item.isSpecialDrop = info;
        }
    }
}

/**
 * Index special mob spawns
 */
function indexSpecialMobs(
    npcs: Map<number, GameNpc>,
    specialMobs: import('../types/game').SpecialSpawnInfo[]
): void {
    for (const spawn of specialMobs) {
        const sourceNpc = npcs.get(spawn.spawnFromNpcId);
        if (sourceNpc) {
            spawn.spawnFromNpcName = sourceNpc.name;
            // Note: The special spawn info indicates this NPC can spawn special variants
            sourceNpc.isSpecialSpawn = spawn;
        }
    }
}

/**
 * Index NPC spellcasting abilities
 */
function indexNpcSpellcasts(
    npcs: Map<number, GameNpc>,
    spells: Map<number, GameSpell>,
    spellcasts: Map<number, import('../types/game').SpellcastInfo[]>
): void {
    for (const [npcId, casts] of spellcasts) {
        const npc = npcs.get(npcId);
        if (!npc) continue;

        // Populate spell names and set on NPC
        for (const cast of casts) {
            const spell = spells.get(cast.spellId);
            if (spell) {
                cast.spellName = spell.name;
            }
        }

        // For simplicity, just use the first spellcast entry
        if (casts.length > 0) {
            npc.spellcasting = casts[0];
        }
    }
}

/**
 * Index NPC spawn locations from map data
 */
function indexNpcSpawns(
    npcs: Map<number, GameNpc>,
    _maps: Map<number, GameMap>,
    npcSpawns: MapNpcSpawn[]
): void {
    for (const spawn of npcSpawns) {
        const npc = npcs.get(spawn.npcId);
        if (!npc) continue;

        if (!npc.spawnsOnMaps) {
            npc.spawnsOnMaps = [];
        }

        const spawnInfo: MapSpawnInfo = {
            mapId: spawn.mapId,
            mapName: spawn.mapName,
            x: spawn.x,
            y: spawn.y,
            spawnType: spawn.spawnType,
            spawnTime: spawn.spawnTime,
            amount: spawn.amount,
        };

        npc.spawnsOnMaps.push(spawnInfo);
    }

    // Log stats
    let npcsWithSpawns = 0;
    for (const npc of npcs.values()) {
        if (npc.spawnsOnMaps && npc.spawnsOnMaps.length > 0) {
            npcsWithSpawns++;
        }
    }
    console.log(`Indexed spawn locations for ${npcsWithSpawns} NPCs`);
}

/**
 * Index quest relationships with NPCs and items
 */
function indexQuests(
    npcs: Map<number, GameNpc>,
    items: Map<number, GameItem>,
    quests: Map<number, GameQuest>,
    npcsByVendorId: Map<number, GameNpc>
): void {
    for (const quest of quests.values()) {
        // Index NPC involvement (NPCs you talk to)
        // Quest files reference NPCs by vendor ID (behaviorId), not ENF ID
        for (const npcData of quest.involvedNpcs) {
            // Lookup NPC by vendor ID (behaviorId)
            const npc = npcsByVendorId.get(npcData.npcId);
            if (!npc) continue;

            // Populate NPC name and actual ENF ID + graphicId in quest data for image lookup
            npcData.npcName = npc.name;
            npcData.enfId = npc.id;
            npcData.graphicId = npc.graphicId;

            if (!npc.questInvolvement) {
                npc.questInvolvement = [];
            }

            const involvement: QuestInvolvement = {
                questId: quest.id,
                questName: quest.name,
                role: 'dialogue',
            };

            npc.questInvolvement.push(involvement);
        }

        // Index item rewards
        for (const reward of quest.rewardItems) {
            const item = items.get(reward.itemId);
            if (!item) continue;

            // Populate item name in quest data
            reward.itemName = item.name;

            if (!item.questRewards) {
                item.questRewards = [];
            }

            const questReward: QuestReward = {
                questId: quest.id,
                questName: quest.name,
                amount: reward.amount,
            };

            item.questRewards.push(questReward);
        }

        // Index kill requirements - quest files reference NPCs by ENF ID directly (not vendor ID)
        for (const killReq of quest.killRequirements) {
            // Kill requirements use ENF ID directly, not vendor ID
            const npc = npcs.get(killReq.npcId);
            if (npc) {
                killReq.npcName = npc.name;
                killReq.enfId = npc.id;  // Same as killReq.npcId since it's already ENF ID
                killReq.graphicId = npc.graphicId;

                // Create reverse reference on the NPC
                if (!npc.questInvolvement) {
                    npc.questInvolvement = [];
                }

                const involvement: QuestInvolvement = {
                    questId: quest.id,
                    questName: quest.name,
                    role: 'kill',
                };

                npc.questInvolvement.push(involvement);
            }
        }

        // Index item requirements and create reverse references on items
        for (const itemReq of quest.itemRequirements) {
            const item = items.get(itemReq.itemId);
            if (!item) continue;

            // Populate item name in quest data
            itemReq.itemName = item.name;

            // Create reverse reference on the item
            if (!item.questRequirements) {
                item.questRequirements = [];
            }

            const questReq: QuestRequirement = {
                questId: quest.id,
                questName: quest.name,
                count: itemReq.count,
            };

            item.questRequirements.push(questReq);
        }
    }

    // Log stats
    let npcsWithQuests = 0;
    let itemsWithQuestRewards = 0;
    let itemsWithQuestRequirements = 0;
    let questsWithKillReqs = 0;
    let questsWithItemReqs = 0;

    for (const npc of npcs.values()) {
        if (npc.questInvolvement && npc.questInvolvement.length > 0) {
            npcsWithQuests++;
        }
    }
    for (const item of items.values()) {
        if (item.questRewards && item.questRewards.length > 0) {
            itemsWithQuestRewards++;
        }
        if (item.questRequirements && item.questRequirements.length > 0) {
            itemsWithQuestRequirements++;
        }
    }
    for (const quest of quests.values()) {
        if (quest.killRequirements.length > 0) {
            questsWithKillReqs++;
        }
        if (quest.itemRequirements.length > 0) {
            questsWithItemReqs++;
        }
    }
    console.log(`Indexed quest involvement for ${npcsWithQuests} NPCs and ${itemsWithQuestRewards} items (rewards)`);
    console.log(`Indexed ${questsWithKillReqs} quests with kill requirements, ${questsWithItemReqs} with item requirements`);
    console.log(`${itemsWithQuestRequirements} items are required for quests`);
}
