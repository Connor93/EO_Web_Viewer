import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameData } from '../hooks/useGameData';
import { NpcCard } from './NpcCard';
import { NpcDetail } from './NpcDetail';
import { Pagination } from './Pagination';
import { NpcType } from '../types/game';
import type { GameNpc } from '../types/game';
import './ListPage.css';

type SortOption = 'name' | 'id' | 'hp' | 'exp';

export function MonsterListPage() {
    const { database, loading, error } = useGameData();
    const location = useLocation();

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('exp');
    const [bossOnly, setBossOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedNpc, setSelectedNpc] = useState<GameNpc | null>(null);

    // Filter to only aggressive/passive combat NPCs
    const allMonsters = useMemo(() => {
        if (!database) return [];
        return Array.from(database.npcs.values()).filter(
            (npc) => npc.type === NpcType.Aggressive || npc.type === NpcType.Passive
        );
    }, [database]);

    const filteredMonsters = useMemo(() => {
        let result = allMonsters;

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((npc) =>
                npc.name.toLowerCase().includes(q) || npc.id.toString().includes(q)
            );
        }

        // Boss filter
        if (bossOnly) {
            result = result.filter((npc) => npc.boss);
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
                case 'exp':
                    return (b.exp ?? 0) - (a.exp ?? 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [allMonsters, search, bossOnly, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredMonsters.length / itemsPerPage);
    const paginatedMonsters = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredMonsters.slice(start, start + itemsPerPage);
    }, [filteredMonsters, currentPage, itemsPerPage]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleItemClick = (itemId: number) => {
        console.log('Item clicked:', itemId);
    };

    if (loading) {
        return (
            <div className="list-page">
                <div className="list-page-empty">
                    <div className="spinner"></div>
                    <p>Loading monsters...</p>
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

    return (
        <div className="list-page">
            <header className="list-page-header">
                <div className="list-page-header-content">
                    <h1 className="list-page-title">
                        <span className="icon">⚔️</span>
                        Monsters
                    </h1>
                    <p className="list-page-subtitle">
                        Browse {allMonsters.length} combat NPCs
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
                            placeholder="Search monsters by name or ID..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="list-page-sort">
                        <label>Sort by:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                            <option value="exp">Experience (High-Low)</option>
                            <option value="name">Name (A-Z)</option>
                            <option value="id">ID</option>
                            <option value="hp">HP</option>
                            <option value="exp">Experience</option>
                        </select>
                    </div>

                    <div className="list-page-filters">
                        <button
                            className={`list-page-filter-btn ${bossOnly ? 'active' : ''}`}
                            onClick={() => {
                                setBossOnly(!bossOnly);
                                setCurrentPage(1);
                            }}
                        >
                            👑 Bosses Only
                        </button>
                    </div>
                </div>

                {paginatedMonsters.length === 0 ? (
                    <div className="list-page-empty">
                        <div className="list-page-empty-icon">🔍</div>
                        <p>No monsters found matching your criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="list-page-grid">
                            {paginatedMonsters.map((npc) => (
                                <NpcCard key={npc.id} npc={npc} onClick={setSelectedNpc} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredMonsters.length}
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
                />
            )}
        </div>
    );
}
