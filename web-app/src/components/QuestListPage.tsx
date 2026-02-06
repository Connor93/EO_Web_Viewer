import { useState, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameData } from '../hooks/useGameData';
import { QuestCard } from './QuestCard';
import { QuestDetail } from './QuestDetail';
import { ItemDetail } from './ItemDetail';
import { NpcDetail } from './NpcDetail';
import { Pagination } from './Pagination';
import type { GameQuest, GameItem, GameNpc } from '../types/game';
import './ListPage.css';

type SortOption = 'name' | 'id';

export function QuestListPage() {
    const { database, loading, error } = useGameData();
    const location = useLocation();

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedQuest, setSelectedQuest] = useState<GameQuest | null>(null);
    const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
    const [selectedNpc, setSelectedNpc] = useState<GameNpc | null>(null);

    const allQuests = useMemo(() => {
        if (!database) return [];
        return Array.from(database.quests.values());
    }, [database]);

    const filteredQuests = useMemo(() => {
        let result = allQuests;

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((quest) =>
                quest.name.toLowerCase().includes(q) || quest.id.toString().includes(q)
            );
        }

        // Sort
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'id':
                    return a.id - b.id;
                default:
                    return 0;
            }
        });

        return result;
    }, [allQuests, search, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredQuests.length / itemsPerPage);
    const paginatedQuests = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredQuests.slice(start, start + itemsPerPage);
    }, [filteredQuests, currentPage, itemsPerPage]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleNpcClick = useCallback((npcId: number) => {
        const npc = database?.npcs.get(npcId);
        if (npc) {
            setSelectedNpc(npc);
            setSelectedQuest(null);
            setSelectedItem(null);
        }
    }, [database]);

    const handleItemClick = useCallback((itemId: number) => {
        const item = database?.items.get(itemId);
        if (item) {
            setSelectedItem(item);
            setSelectedQuest(null);
            setSelectedNpc(null);
        }
    }, [database]);

    if (loading) {
        return (
            <div className="list-page">
                <div className="list-page-empty">
                    <div className="spinner"></div>
                    <p>Loading quests...</p>
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
                        <span className="icon">📜</span>
                        Quests
                    </h1>
                    <p className="list-page-subtitle">
                        Browse all {allQuests.length} quests in the game
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
                            placeholder="Search quests by name or ID..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="list-page-sort">
                        <label>Sort by:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                            <option value="name">Name (A-Z)</option>
                            <option value="id">ID</option>
                        </select>
                    </div>
                </div>

                {paginatedQuests.length === 0 ? (
                    <div className="list-page-empty">
                        <div className="list-page-empty-icon">🔍</div>
                        <p>No quests found matching your criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="list-page-grid">
                            {paginatedQuests.map((quest) => (
                                <QuestCard key={quest.id} quest={quest} onClick={setSelectedQuest} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredQuests.length}
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

            {selectedQuest && (
                <QuestDetail
                    quest={selectedQuest}
                    onClose={() => setSelectedQuest(null)}
                    onNpcClick={handleNpcClick}
                    onItemClick={handleItemClick}
                />
            )}

            {selectedItem && (
                <ItemDetail
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onNpcClick={handleNpcClick}
                    onQuestClick={(questId: number) => {
                        const quest = database?.quests.get(questId);
                        if (quest) {
                            setSelectedQuest(quest);
                            setSelectedItem(null);
                            setSelectedNpc(null);
                        }
                    }}
                />
            )}

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
