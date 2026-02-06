/**
 * Quest file loader
 * Parses .eqf files (Endless Online Quest DSL format)
 */
import type { GameQuest } from '../types/game';

const QUEST_PATH = '/quests';

async function loadQuestFile(questId: number): Promise<string | null> {
    const filename = String(questId).padStart(5, '0') + '.eqf';
    try {
        const response = await fetch(`${QUEST_PATH}/${filename}`);
        if (!response.ok) return null;
        return await response.text();
    } catch {
        return null;
    }
}

/**
 * Parse quest DSL to extract relevant data
 */
function parseQuestDSL(id: number, content: string): GameQuest | null {
    const lines = content.split('\n');

    let name = `Quest ${id}`;
    const involvedNpcs = new Map<number, { npcId: number }>(); // Use map to dedupe
    const rewardItems: { itemId: number; amount: number }[] = [];
    let rewardExp = 0;
    const killRequirements: { npcId: number; count: number }[] = [];
    const itemRequirements: { itemId: number; count: number }[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        // Extract quest name from Main block
        const nameMatch = trimmed.match(/questname\s+["']([^"']+)["']/i);
        if (nameMatch) {
            name = nameMatch[1];
        }

        // Extract NPC references from AddNpcText, AddNpcInput, AddNpcChat, TalkedToNpc
        const npcTextMatch = trimmed.match(/AddNpcText\s*\(\s*(\d+)/i);
        if (npcTextMatch) {
            const npcId = parseInt(npcTextMatch[1], 10);
            if (npcId > 0) involvedNpcs.set(npcId, { npcId });
        }

        const npcInputMatch = trimmed.match(/AddNpcInput\s*\(\s*(\d+)/i);
        if (npcInputMatch) {
            const npcId = parseInt(npcInputMatch[1], 10);
            if (npcId > 0) involvedNpcs.set(npcId, { npcId });
        }

        const npcChatMatch = trimmed.match(/AddNpcChat\s*\(\s*(\d+)/i);
        if (npcChatMatch) {
            const npcId = parseInt(npcChatMatch[1], 10);
            if (npcId > 0) involvedNpcs.set(npcId, { npcId });
        }

        const talkedMatch = trimmed.match(/TalkedToNpc\s*\(\s*(\d+)/i);
        if (talkedMatch) {
            const npcId = parseInt(talkedMatch[1], 10);
            if (npcId > 0) involvedNpcs.set(npcId, { npcId });
        }

        // Extract item rewards
        const itemMatch = trimmed.match(/GiveItem\s*\(\s*(\d+)\s*,\s*(\d+)/i);
        if (itemMatch) {
            rewardItems.push({
                itemId: parseInt(itemMatch[1], 10),
                amount: parseInt(itemMatch[2], 10),
            });
        }

        // Extract experience rewards
        const expMatch = trimmed.match(/GiveExp\s*\(\s*(\d+)/i);
        if (expMatch) {
            rewardExp += parseInt(expMatch[1], 10);
        }

        // Extract kill requirements: KilledNpcs(npcId, count)
        const killMatch = trimmed.match(/KilledNpcs\s*\(\s*(\d+)\s*,\s*(\d+)/i);
        if (killMatch) {
            killRequirements.push({
                npcId: parseInt(killMatch[1], 10),
                count: parseInt(killMatch[2], 10),
            });
        }

        // Extract item requirements: LostItems(itemId, count)
        const lostItemMatch = trimmed.match(/LostItems\s*\(\s*(\d+)\s*,\s*(\d+)/i);
        if (lostItemMatch) {
            itemRequirements.push({
                itemId: parseInt(lostItemMatch[1], 10),
                count: parseInt(lostItemMatch[2], 10),
            });
        }
    }

    // Only return if we found a valid quest name
    if (name === `Quest ${id}` && involvedNpcs.size === 0) {
        return null;
    }

    return {
        id,
        name,
        involvedNpcs: Array.from(involvedNpcs.values()),
        rewardItems,
        rewardExp,
        killRequirements,
        itemRequirements,
    };
}

/**
 * Load all quests from the quests folder
 */
export async function loadQuests(): Promise<Map<number, GameQuest>> {
    const quests = new Map<number, GameQuest>();

    // Load quests 1-150 (covers the 96 quests we have)
    const questPromises: Promise<{ id: number; content: string | null }>[] = [];
    for (let i = 1; i <= 150; i++) {
        questPromises.push(
            loadQuestFile(i).then(content => ({ id: i, content }))
        );
    }

    const results = await Promise.all(questPromises);

    for (const { id, content } of results) {
        if (!content) continue;

        const quest = parseQuestDSL(id, content);
        if (quest) {
            quests.set(id, quest);
        }
    }

    console.log(`Loaded ${quests.size} quests`);
    return quests;
}
