/**
 * Pub file loader using eolib-ts
 * Loads EIF, ENF, ESF, ECF files and converts to our game types
 */
import { EoReader, Eif, Enf, Esf, Ecf } from 'eolib';
import type {
    GameItem,
    GameNpc,
    GameSpell,
    GameClass,
    ItemType,
    ItemSubType,
    NpcType,
    SpellType,
    SpellTargetRestrict,
    SpellTarget,
} from '../types/game';

const DATA_PATH = '/data';

async function loadFile(path: string): Promise<Uint8Array> {
    const response = await fetch(`${DATA_PATH}/${path}`);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
}

/**
 * Load and parse the EIF (Item) file
 */
export async function loadItems(): Promise<Map<number, GameItem>> {
    const bytes = await loadFile('dat001.eif');
    const reader = new EoReader(bytes);
    const eif = Eif.deserialize(reader);

    const items = new Map<number, GameItem>();

    // eolib-ts records don't have ID - derive from array index (1-based)
    eif.items.forEach((record, index) => {
        const id = index + 1;
        const item: GameItem = {
            id,
            name: record.name,
            graphicId: record.graphicId,
            type: record.type as unknown as ItemType,
            subType: record.subtype as unknown as ItemSubType,
            weight: record.weight,

            hp: record.hp,
            tp: record.tp,
            minDamage: record.minDamage,
            maxDamage: record.maxDamage,
            accuracy: record.accuracy,
            evade: record.evade,
            armor: record.armor,

            str: record.str,
            int: record.intl,
            wis: record.wis,
            agi: record.agi,
            con: record.con,
            cha: record.cha,

            levelRequirement: record.levelRequirement,
            classRequirement: record.classRequirement,
            strRequirement: record.strRequirement,
            intRequirement: record.intRequirement,
            wisRequirement: record.wisRequirement,
            agiRequirement: record.agiRequirement,
            conRequirement: record.conRequirement,
            chaRequirement: record.chaRequirement,

            spec1: record.spec1 ?? 0,
            spec2: record.spec2 ?? 0,
            spec3: record.spec3 ?? 0,
        };

        // Only add items with names (filter out empty slots)
        if (item.name && item.name.trim()) {
            items.set(item.id, item);
        }
    });

    return items;
}

/**
 * Load and parse the ENF (NPC) file
 */
export async function loadNpcs(): Promise<Map<number, GameNpc>> {
    const bytes = await loadFile('dtn001.enf');
    const reader = new EoReader(bytes);
    const enf = Enf.deserialize(reader);

    const npcs = new Map<number, GameNpc>();

    // eolib-ts records don't have ID - derive from array index (1-based)
    enf.npcs.forEach((record, index) => {
        const id = index + 1;
        const npc: GameNpc = {
            id,
            name: record.name,
            graphicId: record.graphicId,
            behaviorId: record.behaviorId, // Vendor ID used by quests
            boss: record.boss || false,
            child: record.child || false,
            type: record.type as unknown as NpcType,

            hp: record.hp,
            minDamage: record.minDamage,
            maxDamage: record.maxDamage,
            accuracy: record.accuracy,
            evade: record.evade,
            armor: record.armor,

            exp: record.experience,
        };

        // Only add NPCs with names (filter out empty slots)
        if (npc.name && npc.name.trim()) {
            npcs.set(npc.id, npc);
        }
    });

    return npcs;
}

/**
 * Load and parse the ESF (Spell) file
 */
export async function loadSpells(): Promise<Map<number, GameSpell>> {
    const bytes = await loadFile('dsl001.esf');
    const reader = new EoReader(bytes);
    const esf = Esf.deserialize(reader);

    const spells = new Map<number, GameSpell>();

    // eolib-ts uses 'skills' array, not 'spells'
    // Records don't have ID - derive from array index (1-based)
    esf.skills.forEach((record, index) => {
        const id = index + 1;
        const spell: GameSpell = {
            id,
            name: record.name,
            shout: record.chant, // eolib-ts uses 'chant' not 'shout'
            graphicId: record.graphicId,
            type: record.type as unknown as SpellType,
            targetRestrict: record.targetRestrict as unknown as SpellTargetRestrict,
            target: record.targetType as unknown as SpellTarget,

            tpCost: record.tpCost,
            spCost: record.spCost,
            castTime: record.castTime,

            minDamage: record.minDamage,
            maxDamage: record.maxDamage,
            accuracy: record.accuracy,
            hp: record.hpHeal, // eolib-ts uses 'hpHeal' not 'hp'

            // ESF records don't have requirement fields in eolib-ts
            // Use maxSkillLevel as a proxy or default to 0
            levelRequirement: 0,
            classRequirement: 0,
            strRequirement: 0,
            intRequirement: 0,
            wisRequirement: 0,
            agiRequirement: 0,
            conRequirement: 0,
            chaRequirement: 0,
        };

        // Only add spells with names (filter out empty slots)
        if (spell.name && spell.name.trim()) {
            spells.set(spell.id, spell);
        }
    });

    return spells;
}

/**
 * Load and parse the ECF (Class) file
 */
export async function loadClasses(): Promise<Map<number, GameClass>> {
    const bytes = await loadFile('dat001.ecf');
    const reader = new EoReader(bytes);
    const ecf = Ecf.deserialize(reader);

    const classes = new Map<number, GameClass>();

    // eolib-ts records don't have ID - derive from array index (1-based)
    ecf.classes.forEach((record, index) => {
        const id = index + 1;
        const gameClass: GameClass = {
            id,
            name: record.name,
            parentType: record.parentType || 0,
            statGroup: record.statGroup || 0,

            str: record.str,
            int: record.intl,
            wis: record.wis,
            agi: record.agi,
            con: record.con,
            cha: record.cha,
        };

        // Only add classes with names (filter out empty slots)
        if (gameClass.name && gameClass.name.trim()) {
            classes.set(gameClass.id, gameClass);
        }
    });

    return classes;
}
