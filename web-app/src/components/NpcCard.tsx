/**
 * NpcCard component - displays NPC summary with sprite
 */
import type { GameNpc } from '../types/game';
import { getNpcImageUrl, handleImageError } from '../utils/images';
import { NpcType, getNpcTypeName } from '../types/game';
import './NpcCard.css';

interface NpcCardProps {
    npc: GameNpc;
    onClick?: (npc: GameNpc) => void;
}

const TYPE_COLORS: Record<number, string> = {
    [NpcType.Aggressive]: '#ff6b6b',
    [NpcType.Passive]: '#51cf66',
    [NpcType.Shop]: '#ffd43b',
    [NpcType.Quest]: '#9775fa',
    [NpcType.Bank]: '#4dabf7',
    [NpcType.Inn]: '#ffa94d',
    [NpcType.Skills]: '#69db7c',
};

function getTypeLabel(type: NpcType): string {
    return getNpcTypeName(type);
}

export function NpcCard({ npc, onClick }: NpcCardProps) {
    const typeColor = TYPE_COLORS[npc.type] || '#8b9dc3';
    const isHostile = npc.type === NpcType.Aggressive || npc.type === NpcType.Passive;

    return (
        <div
            className="npc-card"
            onClick={() => onClick?.(npc)}
            style={{ '--type-color': typeColor } as React.CSSProperties}
        >
            <div className="npc-sprite-wrapper">
                <img
                    src={getNpcImageUrl(npc.id, npc.name)}
                    alt={npc.name}
                    className="npc-sprite"
                    onError={handleImageError}
                />
            </div>
            <div className="npc-info">
                <h3 className="npc-name">
                    {npc.name}
                    {npc.boss && <span className="boss-badge">BOSS</span>}
                </h3>
                <div className="npc-meta">
                    <span className="npc-type" style={{ color: typeColor }}>
                        {getTypeLabel(npc.type)}
                    </span>
                    <span className="npc-id">#{npc.id}</span>
                </div>
                {isHostile && npc.hp > 0 && (
                    <div className="npc-stats">
                        <span className="stat hp">❤️ {npc.hp}</span>
                        <span className="stat exp">⭐ {npc.exp}</span>
                    </div>
                )}
                {(npc.drops && npc.drops.length > 0) && (
                    <div className="npc-drops">
                        Drops {npc.drops.length} item{npc.drops.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>
            {npc.spellcasting && (
                <div className="spell-badge" title="Can cast spells">🔮</div>
            )}
        </div>
    );
}
