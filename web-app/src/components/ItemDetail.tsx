/**
 * ItemDetail component - full item information with relationships
 */
import type { GameItem } from '../types/game';
import { getItemImageUrl, handleImageError } from '../utils/images';
import { ItemType, getItemTypeName } from '../types/game';
import { DropRateBar } from './DropRateBar';
import './ItemDetail.css';

interface ItemDetailProps {
    item: GameItem;
    onClose: () => void;
    onNpcClick?: (npcId: number) => void;
    onQuestClick?: (questId: number) => void;
}

function getTypeLabel(type: ItemType): string {
    return getItemTypeName(type);
}

export function ItemDetail({ item, onClose, onNpcClick, onQuestClick }: ItemDetailProps) {
    return (
        <div className="detail-overlay" onClick={onClose}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="detail-header">
                    <div className="detail-icon-wrapper">
                        <img
                            src={getItemImageUrl(item.id, item.name)}
                            alt={item.name}
                            className="detail-icon"
                            onError={handleImageError}
                        />
                    </div>
                    <div className="detail-title">
                        <h2>{item.name}</h2>
                        <div className="detail-meta">
                            <span className="type-badge">{getTypeLabel(item.type)}</span>
                            <span className="id">ID: {item.id}</span>
                            {item.isSpecialDrop && <span className="special-badge">✨ Special Drop</span>}
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                {hasStats(item) && (
                    <div className="detail-section">
                        <h3>📊 Stats</h3>
                        <div className="stats-grid">
                            {item.minDamage > 0 && <StatRow label="Damage" value={`${item.minDamage}-${item.maxDamage}`} />}
                            {item.accuracy > 0 && <StatRow label="Accuracy" value={item.accuracy} />}
                            {item.armor > 0 && <StatRow label="Armor" value={item.armor} />}
                            {item.evade > 0 && <StatRow label="Evade" value={item.evade} />}
                            {item.hp > 0 && <StatRow label="HP" value={`+${item.hp}`} />}
                            {item.tp > 0 && <StatRow label="TP" value={`+${item.tp}`} />}
                        </div>
                    </div>
                )}

                {/* Attributes Section */}
                {hasAttributes(item) && (
                    <div className="detail-section">
                        <h3>💪 Attributes</h3>
                        <div className="stats-grid">
                            {item.str > 0 && <StatRow label="STR" value={`+${item.str}`} />}
                            {item.int > 0 && <StatRow label="INT" value={`+${item.int}`} />}
                            {item.wis > 0 && <StatRow label="WIS" value={`+${item.wis}`} />}
                            {item.agi > 0 && <StatRow label="AGI" value={`+${item.agi}`} />}
                            {item.con > 0 && <StatRow label="CON" value={`+${item.con}`} />}
                            {item.cha > 0 && <StatRow label="CHA" value={`+${item.cha}`} />}
                        </div>
                    </div>
                )}

                {/* Requirements Section */}
                {hasRequirements(item) && (
                    <div className="detail-section">
                        <h3>📋 Requirements</h3>
                        <div className="stats-grid">
                            {item.levelRequirement > 0 && <StatRow label="Level" value={item.levelRequirement} />}
                            {item.strRequirement > 0 && <StatRow label="STR" value={item.strRequirement} />}
                            {item.intRequirement > 0 && <StatRow label="INT" value={item.intRequirement} />}
                            {item.wisRequirement > 0 && <StatRow label="WIS" value={item.wisRequirement} />}
                            {item.agiRequirement > 0 && <StatRow label="AGI" value={item.agiRequirement} />}
                            {item.conRequirement > 0 && <StatRow label="CON" value={item.conRequirement} />}
                            {item.chaRequirement > 0 && <StatRow label="CHA" value={item.chaRequirement} />}
                        </div>
                    </div>
                )}

                {/* Drops From Section */}
                {item.dropsFrom && item.dropsFrom.length > 0 && (
                    <div className="detail-section">
                        <h3>👾 Drops From</h3>
                        <div className="relationship-list">
                            {item.dropsFrom.map((drop, idx) => (
                                <div
                                    key={idx}
                                    className="relationship-item clickable drop-item"
                                    onClick={() => onNpcClick?.(drop.npcId)}
                                >
                                    <div className="drop-info-row">
                                        <span className="rel-name">{drop.npcName}</span>
                                        <span className="rel-amount">
                                            {drop.minAmount === drop.maxAmount ? drop.minAmount : `${drop.minAmount}-${drop.maxAmount}`}x
                                        </span>
                                    </div>
                                    <DropRateBar rate={drop.dropRate} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sold At Section */}
                {item.soldAt && item.soldAt.length > 0 && (
                    <div className="detail-section">
                        <h3>🏪 Sold At</h3>
                        <div className="relationship-list">
                            {item.soldAt.map((shop, idx) => (
                                <div key={idx} className="relationship-item">
                                    <span className="rel-name">{shop.shopName || `Shop #${shop.shopId}`}</span>
                                    {shop.buyPrice !== undefined && (
                                        <span className="rel-info">Buy: {shop.buyPrice}g</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Crafted At Section */}
                {item.craftedAt && item.craftedAt.length > 0 && (
                    <div className="detail-section">
                        <h3>🔨 Crafting Recipe</h3>
                        {item.craftedAt.map((craft, idx) => (
                            <div key={idx} className="craft-recipe">
                                <div className="craft-location">{craft.shopName || `Shop #${craft.shopId}`}</div>
                                <div className="craft-ingredients">
                                    {craft.ingredients.map((ing, i) => (
                                        <span key={i} className="ingredient">
                                            {ing.amount}x {ing.itemName || `Item #${ing.itemId}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Required For Quests Section */}
                {item.questRequirements && item.questRequirements.length > 0 && (
                    <div className="detail-section">
                        <h3>📜 Required For Quests</h3>
                        <div className="relationship-list">
                            {item.questRequirements.map((req, idx) => (
                                <div
                                    key={idx}
                                    className="relationship-item clickable"
                                    onClick={() => onQuestClick?.(req.questId)}
                                >
                                    <span className="rel-name">{req.questName}</span>
                                    <span className="rel-info">× {req.count}</span>
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

function hasStats(item: GameItem): boolean {
    return item.minDamage > 0 || item.maxDamage > 0 || item.accuracy > 0 ||
        item.armor > 0 || item.evade > 0 || item.hp > 0 || item.tp > 0;
}

function hasAttributes(item: GameItem): boolean {
    return item.str > 0 || item.int > 0 || item.wis > 0 ||
        item.agi > 0 || item.con > 0 || item.cha > 0;
}

function hasRequirements(item: GameItem): boolean {
    return item.levelRequirement > 0 || item.strRequirement > 0 || item.intRequirement > 0 ||
        item.wisRequirement > 0 || item.agiRequirement > 0 || item.conRequirement > 0 ||
        item.chaRequirement > 0;
}
