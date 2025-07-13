// src/lib/helpers.ts

/**
 * Generates initials from a full name.
 * @param name The full name string.
 * @returns A string of initials.
 */
export const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.trim().split(/\s+/);
    if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
    const firstInitial = names[0][0]?.toUpperCase() || '';
    const lastInitial = names[names.length - 1][0]?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
};
