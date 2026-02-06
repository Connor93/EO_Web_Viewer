/**
 * QuestDetail component - full quest information with requirements and rewards
 */
import type { GameQuest } from '../types/game';
import { getNpcImageUrl, handleImageError } from '../utils/images';
import './ItemDetail.css'; // Reuse detail styles

interface QuestDetailProps {
    quest: GameQuest;
    onClose: () => void;
    onNpcClick?: (npcId: number) => void;
    onItemClick?: (itemId: number) => void;
}

export function QuestDetail({ quest, onClose, onNpcClick, onItemClick }: QuestDetailProps) {
    const questGiver = quest.involvedNpcs[0];

    return (
        <div className="detail-overlay" onClick={onClose}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="detail-header">
                    <div className="detail-icon-wrapper">
                        {questGiver && questGiver.enfId ? (
                            <img
                                src={getNpcImageUrl(questGiver.enfId, questGiver.npcName || '')}
                                alt={questGiver.npcName || 'Quest NPC'}
                                className="detail-icon"
                                onError={handleImageError}
                            />
                        ) : (
                            <div style={{ fontSize: '48px' }}>📜</div>
                        )}
                    </div>
                    <div className="detail-title">
                        <h2>{quest.name}</h2>
                        <div className="detail-meta">
                            <span className="type-badge">Quest</span>
                            <span className="id">ID: {quest.id}</span>
                        </div>
                    </div>
                </div>

                {/* NPCs to Talk To */}
                {quest.involvedNpcs.length > 0 && (
                    <div className="detail-section">
                        <h3>💬 Talk To</h3>
                        <div className="relationship-list">
                            {quest.involvedNpcs.map((npc, idx) => (
                                <div
                                    key={idx}
                                    className="relationship-item clickable"
                                    onClick={() => npc.enfId && onNpcClick?.(npc.enfId)}
                                >
                                    <span className="rel-name">
                                        {npc.npcName || `NPC #${npc.npcId}`}
                                    </span>
                                    <span className="rel-info">NPC #{npc.enfId || npc.npcId}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Kill Requirements */}
                {quest.killRequirements.length > 0 && (
                    <div className="detail-section">
                        <h3>⚔️ Kill Requirements</h3>
                        <div className="relationship-list">
                            {quest.killRequirements.map((killReq, idx) => (
                                <div
                                    key={idx}
                                    className="relationship-item clickable"
                                    onClick={() => killReq.enfId && onNpcClick?.(killReq.enfId)}
                                >
                                    <span className="rel-name">
                                        {killReq.npcName || `NPC #${killReq.npcId}`}
                                    </span>
                                    <span className="rel-info">× {killReq.count} (NPC #{killReq.enfId || killReq.npcId})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Item Requirements */}
                {quest.itemRequirements.length > 0 && (
                    <div className="detail-section">
                        <h3>📦 Required Items</h3>
                        <div className="relationship-list">
                            {quest.itemRequirements.map((itemReq, idx) => (
                                <div
                                    key={idx}
                                    className="relationship-item clickable"
                                    onClick={() => onItemClick?.(itemReq.itemId)}
                                >
                                    <span className="rel-name">
                                        {itemReq.itemName || `Item #${itemReq.itemId}`}
                                    </span>
                                    <span className="rel-info">× {itemReq.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rewards Section */}
                {(quest.rewardItems.length > 0 || quest.rewardExp > 0) && (
                    <div className="detail-section">
                        <h3>🎁 Rewards</h3>
                        {quest.rewardExp > 0 && (
                            <div className="stats-grid" style={{ marginBottom: '12px' }}>
                                <StatRow label="Experience" value={`${quest.rewardExp} XP`} />
                            </div>
                        )}
                        {quest.rewardItems.length > 0 && (
                            <div className="relationship-list">
                                {quest.rewardItems.map((reward, idx) => (
                                    <div
                                        key={idx}
                                        className="relationship-item clickable"
                                        onClick={() => onItemClick?.(reward.itemId)}
                                    >
                                        <span className="rel-name">
                                            {reward.itemName || `Item #${reward.itemId}`}
                                        </span>
                                        <span className="rel-info">× {reward.amount}</span>
                                    </div>
                                ))}
                            </div>
                        )}
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
