/**
 * QuestCard component - displays quest summary with quest-giver NPC image
 */
import type { GameQuest } from '../types/game';
import { getNpcImageUrl, handleImageError } from '../utils/images';
import './QuestCard.css';

interface QuestCardProps {
    quest: GameQuest;
    onClick?: (quest: GameQuest) => void;
}

export function QuestCard({ quest, onClick }: QuestCardProps) {
    // Get the first involved NPC (quest giver) for the image
    const questGiver = quest.involvedNpcs[0];
    const hasKillReqs = quest.killRequirements.length > 0;
    const hasItemReqs = quest.itemRequirements.length > 0;

    return (
        <div className="quest-card" onClick={() => onClick?.(quest)}>
            <div className="quest-icon-wrapper">
                {questGiver && questGiver.enfId ? (
                    <img
                        src={getNpcImageUrl(questGiver.enfId, questGiver.npcName || '')}
                        alt={questGiver.npcName || 'Quest NPC'}
                        className="quest-npc-sprite"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="quest-icon-placeholder">📜</div>
                )}
            </div>
            <div className="quest-info">
                <h3 className="quest-name">{quest.name}</h3>
                <div className="quest-meta">
                    <span className="quest-id">#{quest.id}</span>
                    {questGiver && (
                        <span className="quest-giver">
                            Talk to: {questGiver.npcName || `NPC #${questGiver.npcId}`}
                        </span>
                    )}
                </div>
                <div className="quest-requirements">
                    {hasKillReqs && (
                        <span className="req-badge kill">
                            ⚔️ {quest.killRequirements.length} kill{quest.killRequirements.length > 1 ? 's' : ''}
                        </span>
                    )}
                    {hasItemReqs && (
                        <span className="req-badge item">
                            📦 {quest.itemRequirements.length} item{quest.itemRequirements.length > 1 ? 's' : ''}
                        </span>
                    )}
                    {quest.rewardExp > 0 && (
                        <span className="req-badge exp">⭐ {quest.rewardExp} XP</span>
                    )}
                </div>
            </div>
        </div>
    );
}
