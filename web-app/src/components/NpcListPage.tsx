import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGameData } from '../hooks/useGameData';
import { NpcCard } from './NpcCard';
import { NpcDetail } from './NpcDetail';
import { Pagination } from './Pagination';
import { NpcType, getNpcTypeName } from '../types/game';
import type { GameNpc } from '../types/game';
import './ListPage.css';

type SortOption = 'name' | 'id' | 'hp';

export function NpcListPage() {
    const { database, loading, error } = useGameData();
    const location = useLocation();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [selectedTypes, setSelectedTypes] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedNpc, setSelectedNpc] = useState<GameNpc | null>(null);

    const allNpcs = useMemo(() => {
        if (!database) return [];
        return Array.from(database.npcs.values());
    }, [database]);

    const filteredNpcs = useMemo(() => {
        let result = allNpcs;

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((npc) =>
                npc.name.toLowerCase().includes(q) || npc.id.toString().includes(q)
            );
        }

        // Type filter
        if (selectedTypes.size > 0) {
            result = result.filter((npc) => selectedTypes.has(npc.type));
        }

        // Sort
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'id':
                    return a.id - b.id;

                case 'hp':
                    return (b.hp ?? 0) - (a.hp ?? 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [allNpcs, search, selectedTypes, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredNpcs.length / itemsPerPage);
    const paginatedNpcs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredNpcs.slice(start, start + itemsPerPage);
    }, [filteredNpcs, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
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

    const handleItemClick = (itemId: number) => {
        // In a full implementation, this would navigate to item detail
        console.log('Item clicked:', itemId);
    };

    const handleQuestClick = (questId: number) => {
        const quest = database?.quests.get(questId);
        if (quest) {
            navigate(`/quests?search=${encodeURIComponent(quest.name)}`);
        }
    };

    if (loading) {
        return (
            <div className="list-page">
                <div className="list-page-empty">
                    <div className="spinner"></div>
                    <p>Loading NPCs...</p>
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

    const npcTypes = [
        { value: NpcType.NPC, label: getNpcTypeName(NpcType.NPC) },
        { value: NpcType.Passive, label: getNpcTypeName(NpcType.Passive) },
        { value: NpcType.Aggressive, label: getNpcTypeName(NpcType.Aggressive) },
        { value: NpcType.Shop, label: getNpcTypeName(NpcType.Shop) },
        { value: NpcType.Bank, label: getNpcTypeName(NpcType.Bank) },
        { value: NpcType.Barber, label: getNpcTypeName(NpcType.Barber) },
    ];

    return (
        <div className="list-page">
            <header className="list-page-header">
                <div className="list-page-header-content">
                    <h1 className="list-page-title">
                        <span className="icon">👾</span>
                        All NPCs
                    </h1>
                    <p className="list-page-subtitle">
                        Browse all {allNpcs.length} NPCs in the game
                    </p>
                    <nav className="list-page-nav">
                        <Link to="/" className="list-page-nav-link">🏠 Home</Link>
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
                            placeholder="Search NPCs by name or ID..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="list-page-sort">
                        <label>Sort by:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                            <option value="name">Name (A-Z)</option>
                            <option value="id">ID</option>

                            <option value="hp">HP</option>
                        </select>
                    </div>

                    <div className="list-page-filters">
                        {npcTypes.map((type) => (
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

                {paginatedNpcs.length === 0 ? (
                    <div className="list-page-empty">
                        <div className="list-page-empty-icon">🔍</div>
                        <p>No NPCs found matching your criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="list-page-grid">
                            {paginatedNpcs.map((npc) => (
                                <NpcCard key={npc.id} npc={npc} onClick={setSelectedNpc} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredNpcs.length}
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

            {selectedNpc && (
                <NpcDetail
                    npc={selectedNpc}
                    onClose={() => setSelectedNpc(null)}
                    onItemClick={handleItemClick}
                    onQuestClick={handleQuestClick}
                />
            )}
        </div>
    );
}
