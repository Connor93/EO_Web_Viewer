/**
 * SpellCard component - displays spell summary with icon
 */
import type { GameSpell } from '../types/game';
import { getSpellIconUrl, handleImageError } from '../utils/images';
import { SpellType, SpellTarget, getSpellTypeName } from '../types/game';
import './SpellCard.css';

interface SpellCardProps {
    spell: GameSpell;
    onClick?: (spell: GameSpell) => void;
}

const TYPE_COLORS: Record<number, string> = {
    [SpellType.Heal]: '#51cf66',
    [SpellType.Damage]: '#ff6b6b',
    [SpellType.Bard]: '#9775fa',
};

function getTypeLabel(type: SpellType): string {
    return getSpellTypeName(type);
}


export function SpellCard({ spell, onClick }: SpellCardProps) {
    const typeColor = TYPE_COLORS[spell.type] || '#8b9dc3';
    const isHealing = spell.type === SpellType.Heal;

    return (
        <div
            className="spell-card"
            onClick={() => onClick?.(spell)}
            style={{ '--type-color': typeColor } as React.CSSProperties}
        >
            <div className="spell-icon-wrapper">
                <img
                    src={getSpellIconUrl(spell.id, spell.name)}
                    alt={spell.name}
                    className="spell-icon"
                    onError={handleImageError}
                />
            </div>
            <div className="spell-info">
                <h3 className="spell-name">{spell.name}</h3>
                <div className="spell-meta">
                    <span className="spell-type" style={{ color: typeColor }}>
                        {getTypeLabel(spell.type)}
                    </span>
                    <span className="spell-id">#{spell.id}</span>
                </div>
                {(spell.minDamage > 0 || spell.hp > 0) && (
                    <div className="spell-stats">
                        {isHealing ? (
                            <span className="stat heal">💚 {spell.hp}</span>
                        ) : (
                            <span className="stat damage">⚔️ {spell.minDamage}-{spell.maxDamage}</span>
                        )}
                        <span className="stat cost">💧 {spell.tpCost} TP</span>
                    </div>
                )}
            </div>
            {spell.target === SpellTarget.Group && (
                <div className="group-badge" title="Group spell">👥</div>
            )}
        </div>
    );
}
