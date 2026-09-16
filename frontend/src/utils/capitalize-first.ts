/** Returns the text with its first character upper-cased (the rest untouched). */
export const capitalizeFirst = (text: string): string => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);
