/**
 * Image utilities for loading game graphics
 * Images are pre-extracted into organized folders
 */

/**
 * Get the URL for an item's inventory icon
 * Folders are named by item ID: item_0001_Gold/inventory/inventory_icon.bmp
 */
export function getItemImageUrl(itemId: number, itemName: string): string {
    const paddedId = String(itemId).padStart(4, '0');
    const safeName = sanitizeName(itemName);
    return encodePath(`/gfx/Items/item_${paddedId}_${safeName}/inventory/inventory_icon.bmp`);
}


/**
 * Get the URL for an item's ground sprite
 */
export function getItemGroundUrl(itemId: number, itemName: string): string {
    const paddedId = String(itemId).padStart(4, '0');
    const safeName = sanitizeName(itemName);
    return encodePath(`/gfx/Items/item_${paddedId}_${safeName}/ground/ground.bmp`);
}


/**
 * Get the URL for an NPC's standing sprite
 * Folders are named by NPC ID: npc_0001_Crow/standing_down_right/frame_01.bmp
 */
export function getNpcImageUrl(npcId: number, npcName: string, direction: 'down_right' | 'up_left' = 'down_right'): string {
    const paddedId = String(npcId).padStart(4, '0');
    const safeName = sanitizeName(npcName);
    return encodePath(`/gfx/NPCs/npc_${paddedId}_${safeName}/standing_${direction}/frame_01.bmp`);
}


/**
 * Get all animation frame URLs for an NPC
 */
export function getNpcAnimationUrls(
    graphicId: number,
    npcName: string,
    animation: 'standing' | 'walking' | 'attacking',
    direction: 'down_right' | 'up_left' = 'down_right'
): string[] {
    const paddedId = String(graphicId).padStart(4, '0');
    const safeName = sanitizeName(npcName);
    const basePath = `/gfx/NPCs/npc_${paddedId}_${safeName}/${animation}_${direction}`;

    // Most animations have 2 frames
    return [
        encodePath(`${basePath}/frame_01.bmp`),
        encodePath(`${basePath}/frame_02.bmp`),
    ];
}

/**
 * Get the URL for a spell's icon
 * Folder uses SPELL ID, not graphicId
 */
export function getSpellIconUrl(spellId: number, spellName: string): string {
    const paddedId = String(spellId).padStart(4, '0');
    const safeName = sanitizeName(spellName);
    return encodePath(`/gfx/Spells/spell_${paddedId}_${safeName}/icons/spell_icon.bmp`);
}

/**
 * Sanitize a name for use in file paths
 * Removes dangerous characters but KEEPS SPACES (folder names have spaces)
 */
function sanitizeName(name: string): string {
    if (!name) return 'Unknown';
    return name
        .replace(/[\/\\:*?"<>|]/g, '') // Only remove path-unsafe chars
        .substring(0, 50);             // Limit length
}

/**
 * Encode a path for use in URLs (handles spaces)
 */
function encodePath(path: string): string {
    return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

/**
 * Handle image error by returning a placeholder
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>): void {
    const img = event.currentTarget;
    img.src = '/placeholder.svg';
    img.alt = 'Image not found';
}

/**
 * Preload an image and return a promise
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
