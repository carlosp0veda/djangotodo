/**
 * Gets the background color for a note card based on the category color.
 * Falling back to default card background if no color is provided.
 */
export const getBackgroundColor = (color?: string | null): string => {
    if (!color) return 'var(--card-bg)';
    return color;
};

/**
 * Gets the border color for a note card based on the category color.
 * Darkens the base color if it's a hex value to create a subtle border.
 */
export const getBorderColor = (color?: string | null): string => {
    if (!color) return 'var(--card-border)';
    
    if (color.startsWith('#') && color.length === 7) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        
        // Darken by 10%
        r = Math.floor(r * 0.9);
        g = Math.floor(g * 0.9);
        b = Math.floor(b * 0.9);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    return color;
};
