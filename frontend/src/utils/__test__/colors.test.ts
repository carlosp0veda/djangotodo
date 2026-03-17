import { describe, it, expect } from 'vitest';
import { getBackgroundColor, getBorderColor } from '../colors';

describe('Color Utility Functions', () => {

    describe('getBackgroundColor', () => {
        it('should return the CSS variable when no color is provided', () => {
            expect(getBackgroundColor()).toBe('var(--card-bg)');
            expect(getBackgroundColor(null)).toBe('var(--card-bg)');
        });

        it('should return the color string if provided', () => {
            expect(getBackgroundColor('#ffffff')).toBe('#ffffff');
            expect(getBackgroundColor('red')).toBe('red');
        });
    });

    describe('getBorderColor', () => {
        it('should return the CSS variable when no color is provided', () => {
            expect(getBorderColor()).toBe('var(--card-border)');
            expect(getBorderColor(null)).toBe('var(--card-border)');
        });

        it('should correctly darken a 7-character hex color by 10%', () => {
            expect(getBorderColor('#FFFFFF')).toBe('rgb(229, 229, 229)');
            expect(getBorderColor('#FF0000')).toBe('rgb(229, 0, 0)');
        });

        it('should return the original string if it is not a 7-char hex', () => {
            expect(getBorderColor('blue')).toBe('blue');
            expect(getBorderColor('#000')).toBe('#000');
        });
    });

});