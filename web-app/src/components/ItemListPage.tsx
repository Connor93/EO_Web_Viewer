import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useGameData } from '../hooks/useGameData';
import { ItemCard } from './ItemCard';
import { ItemDetail } from './ItemDetail';
import { NpcDetail } from './NpcDetail';
import { QuestDetail } from './QuestDetail';
import { Pagination } from './Pagination';
import { ItemType } from '../types/game';
import type { GameItem, GameNpc, GameQuest } from '../types/game';
import './ListPage.css';

type SortOption = 'name' | 'id' | 'level';

export function ItemListPage() {
    const { database, loading, error } = useGameData();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(() => searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [selectedTypes, setSelectedTypes] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
    const [selectedNpc, setSelectedNpc] = useState<GameNpc | null>(null);
    const [selectedQuest, setSelectedQuest] = useState<GameQuest | null>(null);

    const allItems = useMemo(() => {
        if (!database) return [];
        return Array.from(database.items.values()).filter(item => item.name && item.name.trim() !== '');
    }, [database]);

    const filteredItems = useMemo(() => {
        let result = allItems;

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((item) =>
                item.name.toLowerCase().includes(q) || item.id.toString().includes(q)
            );
        }

        // Type filter
        if (selectedTypes.size > 0) {
            result = result.filter((item) => selectedTypes.has(item.type));
        }

        // Sort
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'id':
                    return a.id - b.id;
                case 'level':
                    return (b.levelRequirement ?? 0) - (a.levelRequirement ?? 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [allItems, search, selectedTypes, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const toggleType = (type: number) => {
        setSelectedTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
        setCurrentPage(1);
    };

    const handleNpcClick = (npcId: number) => {
        const npc = database?.npcs.get(npcId);
        if (npc) setSelectedNpc(npc);
    };

    const handleQuestClick = (questId: number) => {
        const quest = database?.quests.get(questId);
        if (quest) setSelectedQuest(quest);
    };

    // Sync search to URL
    useEffect(() => {
        if (search) {
            setSearchParams({ search }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    }, [search, setSearchParams]);

    if (loading) {
        return (
            <div className="list-page">
                <div className="list-page-empty">
                    <div className="spinner"></div>
                    <p>Loading items...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="list-page">
                <div className="list-page-empty">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    const itemTypes = [
        { value: ItemType.Weapon, label: 'Weapons' },
        { value: ItemType.Shield, label: 'Shields' },
        { value: ItemType.Armor, label: 'Armor' },
        { value: ItemType.Hat, label: 'Hats' },
        { value: ItemType.Boots, label: 'Boots' },
        { value: ItemType.Gloves, label: 'Gloves' },
        { value: ItemType.Accessory, label: 'Accessories' },
        { value: ItemType.Heal, label: 'Consumables' },
    ];

    return (
        <div className="list-page">
            <header className="list-page-header">
                <div className="list-page-header-content">
                    <h1 className="list-page-title">
                        <span className="icon">🎒</span>
                        Items
                    </h1>
                    <p className="list-page-subtitle">
                        Browse all {allItems.length} items in the game
                    </p>
                    <nav className="list-page-nav">
                        <Link to="/" className="list-page-nav-link">🏠 Home</Link>
                        <Link to="/items" className={`list-page-nav-link ${location.pathname === '/items' ? 'active' : ''}`}>🎒 Items</Link>
                        <Link to="/npcs" className={`list-page-nav-link ${location.pathname === '/npcs' ? 'active' : ''}`}>👾 NPCs</Link>
                        <Link to="/monsters" className={`list-page-nav-link ${location.pathname === '/monsters' ? 'active' : ''}`}>⚔️ Monsters</Link>
                        <Link to="/quests" className={`list-page-nav-link ${location.pathname === '/quests' ? 'active' : ''}`}>📜 Quests</Link>
                    </nav>
                </div>
            </header>

            <main className="list-page-main">
                <div className="list-page-controls">
                    <div className="list-page-search">
                        <input
                            type="text"
                            placeholder="Search items by name or ID..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="list-page-sort">
                        <label>Sort by:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                            <option value="name">Name (A-Z)</option>
                            <option value="id">ID</option>
                            <option value="level">Level Req</option>
                        </select>
                    </div>

                    <div className="list-page-filters">
                        {itemTypes.map((type) => (
                            <button
                                key={type.value}
                                className={`list-page-filter-btn ${selectedTypes.has(type.value) ? 'active' : ''}`}
                                onClick={() => toggleType(type.value)}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {paginatedItems.length === 0 ? (
                    <div className="list-page-empty">
                        <div className="list-page-empty-icon">🔍</div>
                        <p>No items found matching your criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="list-page-grid">
                            {paginatedItems.map((item) => (
                                <ItemCard key={item.id} item={item} onClick={setSelectedItem} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredItems.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(perPage) => {
                                    setItemsPerPage(perPage);
                                    setCurrentPage(1);
                                }}
                            />
                        )}
                    </>
                )}
            </main>

            {selectedItem && (
                <ItemDetail
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onNpcClick={handleNpcClick}
                    onQuestClick={handleQuestClick}
                />
            )}

            {selectedNpc && (
                <NpcDetail
                    npc={selectedNpc}
                    onClose={() => setSelectedNpc(null)}
                    onItemClick={(itemId) => {
                        const item = database?.items.get(itemId);
                        if (item) setSelectedItem(item);
                    }}
                    onQuestClick={handleQuestClick}
                />
            )}

            {selectedQuest && (
                <QuestDetail
                    quest={selectedQuest}
                    onClose={() => setSelectedQuest(null)}
                />
            )}
        </div>
    );
}
