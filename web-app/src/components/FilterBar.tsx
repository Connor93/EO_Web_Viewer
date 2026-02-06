/**
 * FilterBar - Controls for filtering items/NPCs by type and sorting results
 */
import { useState, useRef, useEffect } from 'react';
import { ItemType, NpcType } from '../types/game';
import './FilterBar.css';

// Category groupings for easier filtering
export const ITEM_CATEGORIES = {
    Equipment: [
        ItemType.Weapon, ItemType.Shield, ItemType.Armor, ItemType.Hat,
        ItemType.Boots, ItemType.Gloves, ItemType.Belt, ItemType.Necklace,
        ItemType.Ring, ItemType.Armlet, ItemType.Bracer
    ],
    Consumables: [
        ItemType.Heal, ItemType.Teleport, ItemType.Spell, ItemType.EXPReward,
        ItemType.Alcohol, ItemType.EffectPotion, ItemType.HairDye, ItemType.CureCurse
    ],
    Accessories: [ItemType.Accessory, ItemType.Key],
} as const;

export const NPC_CATEGORIES = {
    Combat: [NpcType.Passive, NpcType.Aggressive],
    Services: [NpcType.Shop, NpcType.Inn, NpcType.Bank, NpcType.Barber, NpcType.Skills],
    Utility: [NpcType.Quest, NpcType.Guild, NpcType.Priest, NpcType.Law],
} as const;

// Human-readable names for types
const ITEM_TYPE_NAMES: Record<ItemType, string> = {
    [ItemType.Static]: 'Static',
    [ItemType.Money]: 'Money',
    [ItemType.Heal]: 'Healing',
    [ItemType.Teleport]: 'Teleport',
    [ItemType.Spell]: 'Spell Scroll',
    [ItemType.EXPReward]: 'EXP Reward',
    [ItemType.StatReward]: 'Stat Reward',
    [ItemType.SkillReward]: 'Skill Reward',
    [ItemType.Key]: 'Key',
    [ItemType.Weapon]: 'Weapon',
    [ItemType.Shield]: 'Shield',
    [ItemType.Armor]: 'Armor',
    [ItemType.Hat]: 'Hat',
    [ItemType.Boots]: 'Boots',
    [ItemType.Gloves]: 'Gloves',
    [ItemType.Accessory]: 'Accessory',
    [ItemType.Belt]: 'Belt',
    [ItemType.Necklace]: 'Necklace',
    [ItemType.Ring]: 'Ring',
    [ItemType.Armlet]: 'Armlet',
    [ItemType.Bracer]: 'Bracer',
    [ItemType.Alcohol]: 'Drink',
    [ItemType.EffectPotion]: 'Buff Potion',
    [ItemType.HairDye]: 'Hair Dye',
    [ItemType.CureCurse]: 'Cure Curse',
};

const NPC_TYPE_NAMES: Record<NpcType, string> = {
    [NpcType.NPC]: 'NPC',
    [NpcType.Passive]: 'Passive',
    [NpcType.Aggressive]: 'Aggressive',
    [NpcType.Unknown1]: 'Unknown',
    [NpcType.Unknown2]: 'Unknown',
    [NpcType.Unknown3]: 'Unknown',
    [NpcType.Shop]: 'Shop',
    [NpcType.Inn]: 'Inn',
    [NpcType.Unknown4]: 'Unknown',
    [NpcType.Bank]: 'Bank',
    [NpcType.Barber]: 'Barber',
    [NpcType.Guild]: 'Guild',
    [NpcType.Priest]: 'Priest',
    [NpcType.Law]: 'Law',
    [NpcType.Skills]: 'Skills',
    [NpcType.Quest]: 'Quest',
};

export type SortOption = 'name' | 'id' | 'level';
export type FilterMode = 'all' | 'items' | 'npcs' | 'spells';

export interface FilterState {
    mode: FilterMode;
    itemTypes: Set<ItemType>;
    npcTypes: Set<NpcType>;
    sortBy: SortOption;
}

export const DEFAULT_FILTER_STATE: FilterState = {
    mode: 'all',
    itemTypes: new Set(),
    npcTypes: new Set(),
    sortBy: 'name',
};

interface FilterBarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
    const [showItemDropdown, setShowItemDropdown] = useState(false);
    const [showNpcDropdown, setShowNpcDropdown] = useState(false);
    const itemDropdownRef = useRef<HTMLDivElement>(null);
    const npcDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target as Node)) {
                setShowItemDropdown(false);
            }
            if (npcDropdownRef.current && !npcDropdownRef.current.contains(event.target as Node)) {
                setShowNpcDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleItemType = (type: ItemType) => {
        const newSet = new Set(filters.itemTypes);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        onFilterChange({ ...filters, itemTypes: newSet });
    };

    const toggleNpcType = (type: NpcType) => {
        const newSet = new Set(filters.npcTypes);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        onFilterChange({ ...filters, npcTypes: newSet });
    };

    const selectItemCategory = (category: keyof typeof ITEM_CATEGORIES) => {
        const types = ITEM_CATEGORIES[category];
        const newSet = new Set(filters.itemTypes);
        const allSelected = types.every(t => newSet.has(t));

        if (allSelected) {
            types.forEach(t => newSet.delete(t));
        } else {
            types.forEach(t => newSet.add(t));
        }
        onFilterChange({ ...filters, itemTypes: newSet });
    };

    const selectNpcCategory = (category: keyof typeof NPC_CATEGORIES) => {
        const types = NPC_CATEGORIES[category];
        const newSet = new Set(filters.npcTypes);
        const allSelected = types.every(t => newSet.has(t));

        if (allSelected) {
            types.forEach(t => newSet.delete(t));
        } else {
            types.forEach(t => newSet.add(t));
        }
        onFilterChange({ ...filters, npcTypes: newSet });
    };

    const clearFilters = () => {
        onFilterChange(DEFAULT_FILTER_STATE);
    };

    const hasActiveFilters = filters.itemTypes.size > 0 || filters.npcTypes.size > 0;

    return (
        <div className="filter-bar">
            {/* Item Type Filter */}
            <div className="filter-dropdown" ref={itemDropdownRef}>
                <button
                    className={`filter-trigger ${filters.itemTypes.size > 0 ? 'active' : ''}`}
                    onClick={() => setShowItemDropdown(!showItemDropdown)}
                >
                    <span className="filter-icon">🎒</span>
                    Items {filters.itemTypes.size > 0 && `(${filters.itemTypes.size})`}
                    <span className="dropdown-arrow">{showItemDropdown ? '▲' : '▼'}</span>
                </button>

                {showItemDropdown && (
                    <div className="filter-menu">
                        <div className="filter-section">
                            <h4>Quick Select</h4>
                            <div className="quick-buttons">
                                {(Object.keys(ITEM_CATEGORIES) as Array<keyof typeof ITEM_CATEGORIES>).map(cat => (
                                    <button
                                        key={cat}
                                        className={`quick-btn ${ITEM_CATEGORIES[cat].every(t => filters.itemTypes.has(t)) ? 'selected' : ''}`}
                                        onClick={() => selectItemCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="filter-section">
                            <h4>All Types</h4>
                            <div className="type-grid">
                                {Object.values(ItemType)
                                    .filter(v => typeof v === 'number')
                                    .map(type => (
                                        <label key={type} className="type-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={filters.itemTypes.has(type as ItemType)}
                                                onChange={() => toggleItemType(type as ItemType)}
                                            />
                                            <span>{ITEM_TYPE_NAMES[type as ItemType]}</span>
                                        </label>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* NPC Type Filter */}
            <div className="filter-dropdown" ref={npcDropdownRef}>
                <button
                    className={`filter-trigger ${filters.npcTypes.size > 0 ? 'active' : ''}`}
                    onClick={() => setShowNpcDropdown(!showNpcDropdown)}
                >
                    <span className="filter-icon">👹</span>
                    NPCs {filters.npcTypes.size > 0 && `(${filters.npcTypes.size})`}
                    <span className="dropdown-arrow">{showNpcDropdown ? '▲' : '▼'}</span>
                </button>

                {showNpcDropdown && (
                    <div className="filter-menu">
                        <div className="filter-section">
                            <h4>Quick Select</h4>
                            <div className="quick-buttons">
                                {(Object.keys(NPC_CATEGORIES) as Array<keyof typeof NPC_CATEGORIES>).map(cat => (
                                    <button
                                        key={cat}
                                        className={`quick-btn ${NPC_CATEGORIES[cat].every(t => filters.npcTypes.has(t)) ? 'selected' : ''}`}
                                        onClick={() => selectNpcCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="filter-section">
                            <h4>All Types</h4>
                            <div className="type-grid">
                                {Object.values(NpcType)
                                    .filter(v => typeof v === 'number')
                                    .filter(type => !NPC_TYPE_NAMES[type as NpcType].startsWith('Unknown'))
                                    .map(type => (
                                        <label key={type} className="type-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={filters.npcTypes.has(type as NpcType)}
                                                onChange={() => toggleNpcType(type as NpcType)}
                                            />
                                            <span>{NPC_TYPE_NAMES[type as NpcType]}</span>
                                        </label>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sort */}
            <div className="filter-sort">
                <label>
                    <span className="filter-icon">↕️</span>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as SortOption })}
                    >
                        <option value="name">Name (A-Z)</option>
                        <option value="id">ID (Low-High)</option>
                        <option value="level">Level Req.</option>
                    </select>
                </label>
            </div>

            {/* Clear button */}
            {hasActiveFilters && (
                <button className="clear-filters" onClick={clearFilters}>
                    ✕ Clear Filters
                </button>
            )}
        </div>
    );
}
