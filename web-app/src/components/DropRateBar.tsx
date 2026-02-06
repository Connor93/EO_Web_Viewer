/**
 * DropRateBar - Visual bar for drop chances
 * Colors: green = common, yellow = uncommon, red = rare
 */
import './DropRateBar.css';

interface DropRateBarProps {
    rate: number; // 0-100 percentage
    showLabel?: boolean;
}

export function DropRateBar({ rate, showLabel = true }: DropRateBarProps) {
    // Color based on rarity (lower = rarer)
    const getColor = (r: number): string => {
        if (r >= 20) return '#51cf66';  // Green - Common
        if (r >= 5) return '#ffd43b';   // Yellow - Uncommon
        if (r >= 1) return '#ff922b';   // Orange - Rare
        return '#ff6b6b';               // Red - Very Rare
    };

    const getRarityLabel = (r: number): string => {
        if (r >= 20) return 'Common';
        if (r >= 5) return 'Uncommon';
        if (r >= 1) return 'Rare';
        return 'Very Rare';
    };

    const color = getColor(rate);
    const barWidth = Math.min(100, Math.max(2, rate)); // Min 2% width for visibility

    return (
        <div className="drop-rate-bar" title={`${rate.toFixed(1)}% - ${getRarityLabel(rate)}`}>
            <div className="drop-rate-track">
                <div
                    className="drop-rate-fill"
                    style={{
                        width: `${barWidth}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
            {showLabel && (
                <span className="drop-rate-label" style={{ color }}>
                    {rate.toFixed(1)}%
                </span>
            )}
        </div>
    );
}
