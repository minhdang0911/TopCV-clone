// Maps font display names to CSS variable + fallback stack
const FONT_MAP = {
    'Muli': "var(--font-mulish), 'Mulish', sans-serif",
    'Mulish': "var(--font-mulish), 'Mulish', sans-serif",
    'Roboto': "var(--font-roboto), 'Roboto', sans-serif",
    'Open Sans': "var(--font-open-sans), 'Open Sans', sans-serif",
    'Source Code Pro': "var(--font-source-code-pro), 'Source Code Pro', monospace",
    'Be Vietnam Pro': "var(--font-be-vietnam), 'Be Vietnam Pro', sans-serif",
};

export function resolveFontFamily(font, fallback = 'sans-serif') {
    return FONT_MAP[font] || `'${font}', ${fallback}`;
}
