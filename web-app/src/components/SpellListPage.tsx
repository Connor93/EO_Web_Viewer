import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useGameData } from '../hooks/useGameData';
import { SpellCard } from './SpellCard';
import { SpellDetail } from './SpellDetail';
import { Pagination } from './Pagination';
import { SpellType, getSpellTypeName } from '../types/game';
import type { GameSpell } from '../types/game';
import './ListPage.css';

type SortOption = 'name' | 'id' | 'level';

export function SpellListPage() {
    const { database, loading, error } = useGameData();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(() => searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [selectedTypes, setSelectedTypes] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedSpell, setSelectedSpell] = useState<GameSpell | null>(null);

    const allSpells = useMemo(() => {
        if (!database) return [];
        return Array.from(database.spells.values()).filter(spell => spell.name && spell.name.trim() !== '');
    }, [database]);

    const filteredSpells = useMemo(() => {
        let result = allSpells;

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((spell) =>
                spell.name.toLowerCase().includes(q) || spell.id.toString().includes(q)
            );
        }

        // Type filter
        if (selectedTypes.size > 0) {
            result = result.filter((spell) => selectedTypes.has(spell.type));
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
    }, [allSpells, search, selectedTypes, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredSpells.length / itemsPerPage);
    const paginatedSpells = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSpells.slice(start, start + itemsPerPage);
    }, [filteredSpells, currentPage, itemsPerPage]);

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
                    <p>Loading spells...</p>
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

    const spellTypes = [
        { value: SpellType.Heal, label: getSpellTypeName(SpellType.Heal) },
        { value: SpellType.Damage, label: getSpellTypeName(SpellType.Damage) },
        { value: SpellType.Bard, label: getSpellTypeName(SpellType.Bard) },
    ];

    return (
        <div className="list-page">
            <header className="list-page-header">
                <div className="list-page-header-content">
                    <h1 className="list-page-title">
                        <span className="icon">✨</span>
                        Spells
                    </h1>
                    <p className="list-page-subtitle">
                        Browse all {allSpells.length} spells in the game
                    </p>
                    <nav className="list-page-nav">
                        <Link to="/" className="list-page-nav-link">🏠 Home</Link>
                        <Link to="/items" className={`list-page-nav-link ${location.pathname === '/items' ? 'active' : ''}`}>🎒 Items</Link>
                        <Link to="/spells" className={`list-page-nav-link ${location.pathname === '/spells' ? 'active' : ''}`}>✨ Spells</Link>
                        <Link to="/npcs" className={`list-page-nav-link ${location.pathname === '/npcs' ? 'active' : ''}`}>👾 NPCs</Link>
                        <Link to="/quests" className={`list-page-nav-link ${location.pathname === '/quests' ? 'active' : ''}`}>📜 Quests</Link>
                    </nav>
                </div>
            </header>

            <main className="list-page-main">
                <div className="list-page-controls">
                    <div className="list-page-search">
                        <input
                            type="text"
                            placeholder="Search spells by name or ID..."
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
                        {spellTypes.map((type) => (
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

                {paginatedSpells.length === 0 ? (
                    <div className="list-page-empty">
                        <div className="list-page-empty-icon">🔍</div>
                        <p>No spells found matching your criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="list-page-grid">
                            {paginatedSpells.map((spell) => (
                                <SpellCard key={spell.id} spell={spell} onClick={setSelectedSpell} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredSpells.length}
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

            {selectedSpell && (
                <SpellDetail
                    spell={selectedSpell}
                    onClose={() => setSelectedSpell(null)}
                />
            )}
        </div>
    );
}
