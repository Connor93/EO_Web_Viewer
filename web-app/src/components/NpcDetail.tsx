/**
 * NpcDetail component - full NPC information with relationships
 */
import type { GameNpc } from '../types/game';
import { getNpcImageUrl, handleImageError } from '../utils/images';
import { NpcType, getNpcTypeName } from '../types/game';
import './ItemDetail.css'; // Reuse detail styles

interface NpcDetailProps {
    npc: GameNpc;
    onClose: () => void;
    onItemClick?: (itemId: number) => void;
}

function getTypeLabel(type: NpcType): string {
    return getNpcTypeName(type);
}

export function NpcDetail({ npc, onClose, onItemClick }: NpcDetailProps) {
    const isHostile = npc.type === NpcType.Aggressive || npc.type === NpcType.Passive;

    return (
        <div className="detail-overlay" onClick={onClose}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="detail-header">
                    <div className="detail-icon-wrapper">
                        <img
                            src={getNpcImageUrl(npc.id, npc.name)}
                            alt={npc.name}
                            className="detail-icon"
                            onError={handleImageError}
                        />
                    </div>
                    <div className="detail-title">
                        <h2>
                            {npc.name}
                            {npc.boss && <span className="boss-badge" style={{ marginLeft: '10px' }}>BOSS</span>}
                        </h2>
                        <div className="detail-meta">
                            <span className="type-badge">{getTypeLabel(npc.type)}</span>
                            <span className="id">ID: {npc.id}</span>
                        </div>
                    </div>
                </div>

                {/* Combat Stats Section */}
                {isHostile && (
                    <div className="detail-section">
                        <h3>⚔️ Combat Stats</h3>
                        <div className="stats-grid">
                            {npc.hp > 0 && <StatRow label="HP" value={npc.hp} />}
                            {(npc.minDamage > 0 || npc.maxDamage > 0) && (
                                <StatRow label="Damage" value={`${npc.minDamage}-${npc.maxDamage}`} />
                            )}
                            {npc.accuracy > 0 && <StatRow label="Accuracy" value={npc.accuracy} />}
                            {npc.armor > 0 && <StatRow label="Armor" value={npc.armor} />}
                            {npc.evade > 0 && <StatRow label="Evade" value={npc.evade} />}
                            {npc.exp > 0 && <StatRow label="Experience" value={npc.exp} />}
                        </div>
                    </div>
                )}

                {/* Spellcasting Section */}
                {npc.spellcasting && (
                    <div className="detail-section">
                        <h3>🔮 Spellcasting</h3>
                        <div className="relationship-list">
                            <div className="relationship-item">
                                <span className="rel-name">{npc.spellcasting.spellName || `Spell #${npc.spellcasting.spellId}`}</span>
                                <span className="rel-info">
                                    {npc.spellcasting.castType.toUpperCase()} | {npc.spellcasting.damage} dmg | {npc.spellcasting.chance}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Drops Section */}
                {npc.drops && npc.drops.length > 0 && (
                    <div className="detail-section">
                        <h3>💎 Drops</h3>
                        <div className="relationship-list">
                            {npc.drops.map((drop, idx) => (
                                <div
                                    key={idx}
                                    className="relationship-item clickable"
                                    onClick={() => onItemClick?.(drop.itemId)}
                                >
                                    <span className="rel-name">{drop.itemName || `Item #${drop.itemId}`}</span>
                                    <span className="rel-info">
                                        {drop.minAmount === drop.maxAmount ? drop.minAmount : `${drop.minAmount}-${drop.maxAmount}`}
                                        {' | '}{drop.dropRate.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pet Version Section */}
                {npc.petVersion && (
                    <div className="detail-section">
                        <h3>🐾 Pet Version</h3>
                        <div className="relationship-list">
                            <div
                                className="relationship-item clickable"
                                onClick={() => onItemClick?.(npc.petVersion!.itemId)}
                            >
                                <span className="rel-name">{npc.petVersion.itemName || `Item #${npc.petVersion.itemId}`}</span>
                                <span className="rel-info">Summon item</span>
                            </div>
                        </div>
                        <div className="stats-grid" style={{ marginTop: '12px' }}>
                            <StatRow label="STR" value={npc.petVersion.stats.str} />
                            <StatRow label="INT" value={npc.petVersion.stats.int} />
                            <StatRow label="WIS" value={npc.petVersion.stats.wis} />
                            <StatRow label="AGI" value={npc.petVersion.stats.agi} />
                            <StatRow label="CON" value={npc.petVersion.stats.con} />
                            <StatRow label="CHA" value={npc.petVersion.stats.cha} />
                        </div>
                    </div>
                )}

                {/* Special Spawn Section */}
                {npc.isSpecialSpawn && (
                    <div className="detail-section">
                        <h3>✨ Special Spawn</h3>
                        <div className="craft-recipe">
                            <div className="craft-location">
                                {npc.isSpecialSpawn.chance}% chance to spawn {npc.isSpecialSpawn.amount}
                            </div>
                            {npc.isSpecialSpawn.message && (
                                <div className="craft-ingredients" style={{ fontStyle: 'italic' }}>
                                    "{npc.isSpecialSpawn.message}"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Shop Items Section */}
                {npc.shopItems && npc.shopItems.length > 0 && (
                    <div className="detail-section">
                        <h3>🏪 Shop Inventory</h3>
                        <div className="relationship-list">
                            {npc.shopItems.map((shopItem, idx) => (
                                <div
                                    key={idx}
                                    className="relationship-item clickable"
                                    onClick={() => onItemClick?.(shopItem.itemId)}
                                >
                                    <span className="rel-name">{shopItem.itemName || `Item #${shopItem.itemId}`}</span>
                                    <span className="rel-info">
                                        {shopItem.buyPrice !== undefined && `Buy: ${shopItem.buyPrice.toLocaleString()}g`}
                                        {shopItem.buyPrice !== undefined && shopItem.sellPrice !== undefined && ' | '}
                                        {shopItem.sellPrice !== undefined && `Sell: ${shopItem.sellPrice.toLocaleString()}g`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Crafted Items Section */}
                {npc.craftItems && npc.craftItems.length > 0 && (
                    <div className="detail-section">
                        <h3>🔨 Crafting Services</h3>
                        <div className="relationship-list">
                            {npc.craftItems.map((craftItem, idx) => (
                                <div key={idx} className="craft-recipe">
                                    <div
                                        className="relationship-item clickable"
                                        onClick={() => onItemClick?.(craftItem.resultItemId)}
                                        style={{ marginBottom: '4px' }}
                                    >
                                        <span className="rel-name">{craftItem.resultItemName || `Item #${craftItem.resultItemId}`}</span>
                                    </div>
                                    <div className="craft-ingredients">
                                        Requires: {craftItem.ingredients.map((ing, i) => (
                                            <span key={i}>
                                                {i > 0 && ', '}
                                                <span
                                                    className="clickable"
                                                    onClick={() => onItemClick?.(ing.itemId)}
                                                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                                >
                                                    {ing.amount}x {ing.itemName || `Item #${ing.itemId}`}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Map Spawns Section - placeholder for future */}
                {npc.spawnsOnMaps && npc.spawnsOnMaps.length > 0 && (
                    <div className="detail-section">
                        <h3>🗺️ Found On Maps</h3>
                        <div className="relationship-list">
                            {npc.spawnsOnMaps.map((spawn, idx) => (
                                <div key={idx} className="relationship-item">
                                    <span className="rel-name">{spawn.mapName || `Map #${spawn.mapId}`}</span>
                                    <span className="rel-info">({spawn.x}, {spawn.y})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="stat-row">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
        </div>
    );
}
