/**
 * ItemCard component - displays item summary with icon
 */
import type { GameItem } from '../types/game';
import { getItemImageUrl, handleImageError } from '../utils/images';
import { ItemType, getItemTypeName } from '../types/game';
import './ItemCard.css';

interface ItemCardProps {
    item: GameItem;
    onClick?: (item: GameItem) => void;
}

const TYPE_COLORS: Record<number, string> = {
    [ItemType.Weapon]: '#ff6b6b',
    [ItemType.Armor]: '#4dabf7',
    [ItemType.Shield]: '#51cf66',
    [ItemType.Hat]: '#9775fa',
    [ItemType.Boots]: '#ffa94d',
    [ItemType.Gloves]: '#69db7c',
    [ItemType.Ring]: '#f783ac',
    [ItemType.Necklace]: '#ffd43b',
    [ItemType.Belt]: '#a9e34b',
    [ItemType.Money]: '#ffd700',
    [ItemType.Heal]: '#ff8787',
};

function getTypeLabel(type: ItemType): string {
    return getItemTypeName(type);
}

export function ItemCard({ item, onClick }: ItemCardProps) {
    const typeColor = TYPE_COLORS[item.type] || '#8b9dc3';

    return (
        <div
            className="item-card"
            onClick={() => onClick?.(item)}
            style={{ '--type-color': typeColor } as React.CSSProperties}
        >
            <div className="item-icon-wrapper">
                <img
                    src={getItemImageUrl(item.id, item.name)}
                    alt={item.name}
                    className="item-icon"
                    onError={handleImageError}
                />
            </div>
            <div className="item-info">
                <h3 className="item-name">{item.name}</h3>
                <div className="item-meta">
                    <span className="item-type" style={{ color: typeColor }}>
                        {getTypeLabel(item.type)}
                    </span>
                    <span className="item-id">#{item.id}</span>
                </div>
                {(item.dropsFrom && item.dropsFrom.length > 0) && (
                    <div className="item-drops">
                        Drops from {item.dropsFrom.length} NPC{item.dropsFrom.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>
            {item.isSpecialDrop && (
                <div className="special-badge" title="Special Drop">✨</div>
            )}
        </div>
    );
}
