/**
 * Formats a date string for display on note cards.
 * Returns 'today', 'yesterday', or 'Month Day'.
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    if (isSameDay(date, today)) {
        return 'today';
    } else if (isSameDay(date, yesterday)) {
        return 'yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
};

/**
 * Formats the "Last Edited" timestamp for note views.
 */
export const formatLastEdited = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `Last Edited: ${formattedDate} at ${time}`;
};
