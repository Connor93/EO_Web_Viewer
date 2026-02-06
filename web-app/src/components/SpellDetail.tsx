/**
 * SpellDetail component - full spell information with all properties
 */
import type { GameSpell } from '../types/game';
import { getSpellIconUrl, handleImageError } from '../utils/images';
import { SpellType, SpellTargetRestrict, SpellTarget, getSpellTypeName } from '../types/game';
import './ItemDetail.css'; // Reuse detail styles

interface SpellDetailProps {
    spell: GameSpell;
    onClose: () => void;
}

function getTypeLabel(type: SpellType): string {
    return getSpellTypeName(type);
}

function getTargetRestrictLabel(restrict: SpellTargetRestrict): string {
    switch (restrict) {
        case SpellTargetRestrict.NPCOnly: return 'NPCs Only';
        case SpellTargetRestrict.Friendly: return 'Friendly';
        case SpellTargetRestrict.Opponent: return 'Opponents';
        default: return 'Any';
    }
}

function getTargetLabel(target: SpellTarget): string {
    switch (target) {
        case SpellTarget.Normal: return 'Single Target';
        case SpellTarget.Self: return 'Self';
        case SpellTarget.Group: return 'Group';
        default: return 'Unknown';
    }
}

export function SpellDetail({ spell, onClose }: SpellDetailProps) {
    const isHealing = spell.type === SpellType.Heal;
    const isDamage = spell.type === SpellType.Damage;

    return (
        <div className="detail-overlay" onClick={onClose}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="detail-header">
                    <div className="detail-icon-wrapper">
                        <img
                            src={getSpellIconUrl(spell.id, spell.name)}
                            alt={spell.name}
                            className="detail-icon"
                            onError={handleImageError}
                        />
                    </div>
                    <div className="detail-title">
                        <h2>{spell.name}</h2>
                        <div className="detail-meta">
                            <span className="type-badge">{getTypeLabel(spell.type)}</span>
                            <span className="id">ID: {spell.id}</span>
                        </div>
                        {spell.shout && (
                            <div className="spell-shout">
                                <em>"{spell.shout}"</em>
                            </div>
                        )}
                    </div>
                </div>

                {/* Targeting Section */}
                <div className="detail-section">
                    <h3>🎯 Targeting</h3>
                    <div className="stats-grid">
                        <StatRow label="Target" value={getTargetLabel(spell.target)} />
                        <StatRow label="Restriction" value={getTargetRestrictLabel(spell.targetRestrict)} />
                    </div>
                </div>

                {/* Effects Section */}
                {(isDamage || isHealing || spell.accuracy > 0) && (
                    <div className="detail-section">
                        <h3>{isHealing ? '💚 Healing' : '⚔️ Effects'}</h3>
                        <div className="stats-grid">
                            {isHealing && spell.hp > 0 && <StatRow label="HP Restored" value={spell.hp} />}
                            {isDamage && (spell.minDamage > 0 || spell.maxDamage > 0) && (
                                <StatRow label="Damage" value={`${spell.minDamage}-${spell.maxDamage}`} />
                            )}
                            {spell.accuracy > 0 && <StatRow label="Accuracy" value={spell.accuracy} />}
                        </div>
                    </div>
                )}

                {/* Costs Section */}
                <div className="detail-section">
                    <h3>💧 Costs</h3>
                    <div className="stats-grid">
                        {spell.tpCost > 0 && <StatRow label="TP Cost" value={spell.tpCost} />}
                        {spell.spCost > 0 && <StatRow label="SP Cost" value={spell.spCost} />}
                        {spell.castTime > 0 && <StatRow label="Cast Time" value={`${(spell.castTime / 1000).toFixed(1)}s`} />}
                    </div>
                </div>

                {/* Requirements Section */}
                {hasRequirements(spell) && (
                    <div className="detail-section">
                        <h3>📋 Requirements</h3>
                        <div className="stats-grid">
                            {spell.levelRequirement > 0 && <StatRow label="Level" value={spell.levelRequirement} />}
                            {spell.classRequirement > 0 && <StatRow label="Class" value={`Class #${spell.classRequirement}`} />}
                            {spell.strRequirement > 0 && <StatRow label="STR" value={spell.strRequirement} />}
                            {spell.intRequirement > 0 && <StatRow label="INT" value={spell.intRequirement} />}
                            {spell.wisRequirement > 0 && <StatRow label="WIS" value={spell.wisRequirement} />}
                            {spell.agiRequirement > 0 && <StatRow label="AGI" value={spell.agiRequirement} />}
                            {spell.conRequirement > 0 && <StatRow label="CON" value={spell.conRequirement} />}
                            {spell.chaRequirement > 0 && <StatRow label="CHA" value={spell.chaRequirement} />}
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

function hasRequirements(spell: GameSpell): boolean {
    return spell.levelRequirement > 0 || spell.classRequirement > 0 ||
        spell.strRequirement > 0 || spell.intRequirement > 0 || spell.wisRequirement > 0 ||
        spell.agiRequirement > 0 || spell.conRequirement > 0 || spell.chaRequirement > 0;
}
