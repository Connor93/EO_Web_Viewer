import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { GameDataProvider, useGameData, useFilteredGlobalSearch } from './hooks/useGameData';
import { SearchBar } from './components/SearchBar';
import { FilterBar, DEFAULT_FILTER_STATE, type FilterState } from './components/FilterBar';
import { ItemCard } from './components/ItemCard';
import { NpcCard } from './components/NpcCard';
import { SpellCard } from './components/SpellCard';
import { QuestCard } from './components/QuestCard';
import { ItemDetail } from './components/ItemDetail';
import { NpcDetail } from './components/NpcDetail';
import { SpellDetail } from './components/SpellDetail';
import { QuestDetail } from './components/QuestDetail';
import { NpcListPage } from './components/NpcListPage';
import { MonsterListPage } from './components/MonsterListPage';
import { QuestListPage } from './components/QuestListPage';
import type { GameItem, GameNpc, GameSpell, GameQuest } from './types/game';
import './App.css';

function HomePage() {
  const { database, loading, error } = useGameData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<GameNpc | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<GameSpell | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<GameQuest | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  const { items, npcs, spells, quests } = useFilteredGlobalSearch(searchQuery, filters);

  const handleItemClick = useCallback((item: GameItem) => {
    setSelectedItem(item);
    setSelectedNpc(null);
    setSelectedSpell(null);
    setSelectedQuest(null);
  }, []);

  const handleNpcClick = useCallback((npc: GameNpc) => {
    setSelectedNpc(npc);
    setSelectedItem(null);
    setSelectedSpell(null);
    setSelectedQuest(null);
  }, []);

  const handleSpellClick = useCallback((spell: GameSpell) => {
    setSelectedSpell(spell);
    setSelectedItem(null);
    setSelectedNpc(null);
    setSelectedQuest(null);
  }, []);

  const handleQuestClick = useCallback((quest: GameQuest) => {
    setSelectedQuest(quest);
    setSelectedItem(null);
    setSelectedNpc(null);
    setSelectedSpell(null);
  }, []);

  const handleNpcIdClick = useCallback((npcId: number) => {
    const npc = database?.npcs.get(npcId);
    if (npc) {
      handleNpcClick(npc);
    }
  }, [database, handleNpcClick]);

  const handleItemIdClick = useCallback((itemId: number) => {
    const item = database?.items.get(itemId);
    if (item) {
      handleItemClick(item);
    }
  }, [database, handleItemClick]);

  const handleQuestIdClick = useCallback((questId: number) => {
    const quest = database?.quests.get(questId);
    if (quest) {
      handleQuestClick(quest);
    }
  }, [database, handleQuestClick]);

  if (loading) {
    return (
      <div className="app loading-state">
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error-state">
        <div className="error-box">
          <h2>⚠️ Error Loading Data</h2>
          <p>{error}</p>
          <p className="hint">Make sure the data files are placed in <code>/public/data/</code></p>
        </div>
      </div>
    );
  }

  const hasResults = items.length > 0 || npcs.length > 0 || spells.length > 0 || quests.length > 0;
  const hasActiveFilters = filters.itemTypes.size > 0 || filters.npcTypes.size > 0;
  const showWelcome = !searchQuery.trim() && !hasActiveFilters;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-icon">⚔️</span>
            EO Web Viewer
            <span className="subtitle">Game Database</span>
          </h1>
          <div className="stats">
            <span>{database?.items.size || 0} Items</span>
            <span className="separator">•</span>
            <span>{database?.npcs.size || 0} NPCs</span>
            <span className="separator">•</span>
            <span>{database?.spells.size || 0} Spells</span>
            <span className="separator">•</span>
            <span>{database?.quests.size || 0} Quests</span>
          </div>
          <nav className="header-nav">
            <Link to="/npcs" className="nav-link">👾 NPCs</Link>
            <Link to="/monsters" className="nav-link">⚔️ Monsters</Link>
            <Link to="/quests" className="nav-link">📜 Quests</Link>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="search-section">
          <SearchBar onSearch={setSearchQuery} />
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </div>

        {showWelcome ? (
          <div className="welcome-section">
            <div className="welcome-grid">
              <Link to="/npcs" className="welcome-card clickable">
                <span className="welcome-icon">👾</span>
                <h3>NPCs</h3>
                <p>Browse all NPCs, shops, and NPCs</p>
              </Link>
              <Link to="/monsters" className="welcome-card clickable">
                <span className="welcome-icon">⚔️</span>
                <h3>Monsters</h3>
                <p>Find monsters, their drops, and spawn locations</p>
              </Link>
              <Link to="/quests" className="welcome-card clickable">
                <span className="welcome-icon">📜</span>
                <h3>Quests</h3>
                <p>Explore quests, requirements, and rewards</p>
              </Link>
              <div className="welcome-card">
                <span className="welcome-icon">🔗</span>
                <h3>Relationships</h3>
                <p>See where items drop from and crafting recipes</p>
              </div>
            </div>
            <p className="welcome-hint">Start typing to search the database...</p>
          </div>
        ) : (
          <div className="results-section">
            {!hasResults && (
              <div className="no-results">
                <p>No results found for "{searchQuery}"</p>
              </div>
            )}

            {items.length > 0 && (
              <div className="results-group">
                <h2 className="results-title">🗡️ Items ({items.length})</h2>
                <div className="results-grid">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} onClick={handleItemClick} />
                  ))}
                </div>
              </div>
            )}

            {npcs.length > 0 && (
              <div className="results-group">
                <h2 className="results-title">👾 NPCs ({npcs.length})</h2>
                <div className="results-grid">
                  {npcs.map((npc) => (
                    <NpcCard key={npc.id} npc={npc} onClick={handleNpcClick} />
                  ))}
                </div>
              </div>
            )}

            {spells.length > 0 && (
              <div className="results-group">
                <h2 className="results-title">✨ Spells ({spells.length})</h2>
                <div className="results-grid">
                  {spells.map((spell) => (
                    <SpellCard key={spell.id} spell={spell} onClick={handleSpellClick} />
                  ))}
                </div>
              </div>
            )}

            {quests.length > 0 && (
              <div className="results-group">
                <h2 className="results-title">📜 Quests ({quests.length})</h2>
                <div className="results-grid">
                  {quests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} onClick={handleQuestClick} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Endless Online Database Viewer</p>
      </footer>

      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onNpcClick={handleNpcIdClick}
          onQuestClick={handleQuestIdClick}
        />
      )}

      {selectedNpc && (
        <NpcDetail
          npc={selectedNpc}
          onClose={() => setSelectedNpc(null)}
          onItemClick={handleItemIdClick}
        />
      )}

      {selectedSpell && (
        <SpellDetail
          spell={selectedSpell}
          onClose={() => setSelectedSpell(null)}
        />
      )}

      {selectedQuest && (
        <QuestDetail
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
          onNpcClick={handleNpcIdClick}
          onItemClick={handleItemIdClick}
        />
      )}
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/npcs" element={<NpcListPage />} />
      <Route path="/monsters" element={<MonsterListPage />} />
      <Route path="/quests" element={<QuestListPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GameDataProvider>
        <AppContent />
      </GameDataProvider>
    </BrowserRouter>
  );
}

export default App;
