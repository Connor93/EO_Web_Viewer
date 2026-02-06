/**
 * Core game data types derived from pub files and server configurations
 */

// === Item Types (from EIF) ===
export interface GameItem {
    id: number;
    name: string;
    graphicId: number;
    type: ItemType;
    subType: ItemSubType;
    weight: number;

    // Stats
    hp: number;
    tp: number;
    minDamage: number;
    maxDamage: number;
    accuracy: number;
    evade: number;
    armor: number;

    // Attributes
    str: number;
    int: number;
    wis: number;
    agi: number;
    con: number;
    cha: number;

    // Requirements
    levelRequirement: number;
    classRequirement: number;
    strRequirement: number;
    intRequirement: number;
    wisRequirement: number;
    agiRequirement: number;
    conRequirement: number;
    chaRequirement: number;

    // Special properties
    spec1: number;
    spec2: number;
    spec3: number;

    // Relationships (populated by indexer)
    dropsFrom?: NpcDrop[];
    soldAt?: ShopInfo[];
    craftedAt?: CraftInfo[];
    isSpecialDrop?: SpecialDropInfo;
    questInvolvement?: QuestInvolvement[];
    questRewards?: QuestReward[];
    questRequirements?: QuestRequirement[];
}

export const ItemType = {
    Static: 0,
    Money: 1,
    Heal: 2,
    Teleport: 3,
    Spell: 4,
    EXPReward: 5,
    StatReward: 6,
    SkillReward: 7,
    Key: 8,
    Weapon: 9,
    Shield: 10,
    Armor: 11,
    Hat: 12,
    Boots: 13,
    Gloves: 14,
    Accessory: 15,
    Belt: 16,
    Necklace: 17,
    Ring: 18,
    Armlet: 19,
    Bracer: 20,
    Alcohol: 21,
    EffectPotion: 22,
    HairDye: 23,
    CureCurse: 24,
} as const;
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

// Helper function for reverse lookup
export function getItemTypeName(type: ItemType): string {
    const entries = Object.entries(ItemType);
    for (const [key, value] of entries) {
        if (value === type) return key;
    }
    return 'Item';
}

export const ItemSubType = {
    None: 0,
    Ranged: 1,
    Arrows: 2,
    Wings: 3,
    Reserved: 4,
} as const;
export type ItemSubType = (typeof ItemSubType)[keyof typeof ItemSubType];

// === NPC Types (from ENF) ===
export interface GameNpc {
    id: number;
    name: string;
    graphicId: number;
    behaviorId: number; // Vendor ID - used by quests to reference NPCs
    boss: boolean;
    child: boolean;
    type: NpcType;

    // Stats
    hp: number;
    minDamage: number;
    maxDamage: number;
    accuracy: number;
    evade: number;
    armor: number;

    // Experience
    exp: number;

    // Relationships (populated by indexer)
    drops?: ItemDrop[];
    spawnsOnMaps?: MapSpawnInfo[];
    petVersion?: PetInfo;
    isSpecialSpawn?: SpecialSpawnInfo;
    spellcasting?: SpellcastInfo;
    questInvolvement?: QuestInvolvement[];
    shopItems?: ShopItem[];     // Items this NPC sells/buys (for Shop type)
    craftItems?: NpcCraftItem[]; // Items this NPC crafts (for Shop type)
}

export const NpcType = {
    NPC: 0,
    Passive: 1,
    Aggressive: 2,
    Unknown1: 3,
    Unknown2: 4,
    Unknown3: 5,
    Shop: 6,
    Inn: 7,
    Unknown4: 8,
    Bank: 9,
    Barber: 10,
    Guild: 11,
    Priest: 12,
    Law: 13,
    Skills: 14,
    Quest: 15,
} as const;
export type NpcType = (typeof NpcType)[keyof typeof NpcType];

// Helper function for reverse lookup
export function getNpcTypeName(type: NpcType): string {
    const entries = Object.entries(NpcType);
    for (const [key, value] of entries) {
        if (value === type) return key;
    }
    return 'NPC';
}

// === Relationship Types ===
export interface NpcDrop {
    npcId: number;
    npcName: string;
    minAmount: number;
    maxAmount: number;
    dropRate: number; // Percentage
}

export interface ItemDrop {
    itemId: number;
    itemName: string;
    minAmount: number;
    maxAmount: number;
    dropRate: number; // Percentage
}

export interface ShopInfo {
    shopId: number;
    shopName: string;
    npcId?: number;
    npcName?: string;
    buyPrice?: number;
    sellPrice?: number;
}

export interface CraftInfo {
    shopId: number;
    shopName: string;
    npcId?: number;
    npcName?: string;
    ingredients: CraftIngredient[];
}

export interface CraftIngredient {
    itemId: number;
    itemName: string;
    amount: number;
}

// Shop inventory items (for NPC detail view)
export interface ShopItem {
    itemId: number;
    itemName: string;
    buyPrice?: number;  // Price player pays to buy
    sellPrice?: number; // Price player gets when selling
}

// Craft recipe for NPC shops
export interface NpcCraftItem {
    resultItemId: number;
    resultItemName: string;
    ingredients: CraftIngredient[];
}

export interface SpecialDropInfo {
    effect: number;
    serverMessage: boolean;
}

export interface SpecialSpawnInfo {
    spawnFromNpcId: number;
    spawnFromNpcName: string;
    chance: number;
    amount: number;
    message?: string;
}

export interface SpellcastInfo {
    spellId: number;
    spellName: string;
    castType: 'target' | 'aoe';
    damage: number;
    chance: number;
}

export interface PetInfo {
    itemId: number;
    itemName: string;
    stats: {
        str: number;
        int: number;
        wis: number;
        agi: number;
        con: number;
        cha: number;
        armor: number;
        evade: number;
        accuracy: number;
        minDamage: number;
        maxDamage: number;
    };
}

export interface MapSpawnInfo {
    mapId: number;
    mapName: string;
    x: number;
    y: number;
    spawnType: number;
    spawnTime: number;
    amount: number;
}

export interface QuestInvolvement {
    questId: number;
    questName: string;
    role: 'dialogue' | 'reward' | 'kill';
}

export interface QuestReward {
    questId: number;
    questName: string;
    amount: number;
}

export interface QuestRequirement {
    questId: number;
    questName: string;
    count: number;
}

// === Map Types (from EMF) ===
export interface GameMap {
    id: number;
    name: string;
}

// === Quest Types (from EQF) ===
export interface GameQuest {
    id: number;
    name: string;
    involvedNpcs: { npcId: number; npcName?: string; enfId?: number; graphicId?: number }[];
    rewardItems: { itemId: number; itemName?: string; amount: number }[];
    rewardExp: number;
    killRequirements: { npcId: number; npcName?: string; count: number; enfId?: number; graphicId?: number }[];
    itemRequirements: { itemId: number; itemName?: string; count: number }[];
}

// === Spell Types (from ESF) ===
export interface GameSpell {
    id: number;
    name: string;
    shout: string;
    graphicId: number;
    type: SpellType;
    targetRestrict: SpellTargetRestrict;
    target: SpellTarget;

    // Costs
    tpCost: number;
    spCost: number;
    castTime: number;

    // Effects
    minDamage: number;
    maxDamage: number;
    accuracy: number;
    hp: number;

    // Requirements
    levelRequirement: number;
    classRequirement: number;
    strRequirement: number;
    intRequirement: number;
    wisRequirement: number;
    agiRequirement: number;
    conRequirement: number;
    chaRequirement: number;
}

export const SpellType = {
    Heal: 0,
    Damage: 1,
    Bard: 2,
} as const;
export type SpellType = (typeof SpellType)[keyof typeof SpellType];

// Helper function for reverse lookup
export function getSpellTypeName(type: SpellType): string {
    const entries = Object.entries(SpellType);
    for (const [key, value] of entries) {
        if (value === type) return key;
    }
    return 'Spell';
}

export const SpellTargetRestrict = {
    NPCOnly: 0,
    Friendly: 1,
    Opponent: 2,
} as const;
export type SpellTargetRestrict = (typeof SpellTargetRestrict)[keyof typeof SpellTargetRestrict];

export const SpellTarget = {
    Normal: 0,
    Self: 1,
    Unknown: 2,
    Group: 3,
} as const;
export type SpellTarget = (typeof SpellTarget)[keyof typeof SpellTarget];

// === Class Types (from ECF) ===
export interface GameClass {
    id: number;
    name: string;
    parentType: number;
    statGroup: number;

    // Base stats
    str: number;
    int: number;
    wis: number;
    agi: number;
    con: number;
    cha: number;
}

// === Indexed Database ===
export interface GameDatabase {
    items: Map<number, GameItem>;
    npcs: Map<number, GameNpc>;
    spells: Map<number, GameSpell>;
    classes: Map<number, GameClass>;
    maps: Map<number, GameMap>;
    quests: Map<number, GameQuest>;

    // Lookup indices
    itemsByName: Map<string, GameItem>;
    npcsByName: Map<string, GameNpc>;
    spellsByName: Map<string, GameSpell>;
}
