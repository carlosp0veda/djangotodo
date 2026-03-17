import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatLastEdited } from '../date';

describe('date utils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('formatDate', () => {
        it('returns "today" for the current date', () => {
            const date = new Date(2026, 2, 17); // March 17, 2026
            vi.setSystemTime(date);
            expect(formatDate(date.toISOString())).toBe('today');
        });

        it('returns "yesterday" for the previous date', () => {
            const today = new Date(2026, 2, 17);
            const yesterday = new Date(2026, 2, 16);
            vi.setSystemTime(today);
            expect(formatDate(yesterday.toISOString())).toBe('yesterday');
        });

        it('returns formatted date for other dates', () => {
            const today = new Date(2026, 2, 17);
            const otherDate = new Date(2026, 2, 15);
            vi.setSystemTime(today);
            expect(formatDate(otherDate.toISOString())).toBe('March 15');
        });

        it('returns empty string for empty input', () => {
            expect(formatDate('')).toBe('');
        });
    });

    describe('formatLastEdited', () => {
        it('formats the timestamp correctly', () => {
            const date = new Date(2026, 2, 17, 14, 30); // 2:30 PM
            const result = formatLastEdited(date.toISOString());
            expect(result).toMatch(/Last Edited: March 17, 2026 at 2:30/);
        });

        it('returns empty string for empty input', () => {
            expect(formatLastEdited('')).toBe('');
        });
    });
});
