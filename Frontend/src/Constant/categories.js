export const CATEGORY_PALETTE = {
    Salary: {
        color: '#10b981', // Emerald
        bgLight: '#ecfdf5',
        bgDark: 'rgba(16, 185, 129, 0.15)',
        text: '#059669',
        border: 'rgba(16, 185, 129, 0.3)',
    },
    Food: {
        color: '#f59e0b', // Amber
        bgLight: '#fffbeb',
        bgDark: 'rgba(245, 158, 11, 0.15)',
        text: '#d97706',
        border: 'rgba(245, 158, 11, 0.3)',
    },
    Movies: {
        color: '#8b5cf6', // Violet
        bgLight: '#f5f3ff',
        bgDark: 'rgba(139, 92, 246, 0.15)',
        text: '#7c3aed',
        border: 'rgba(139, 92, 246, 0.3)',
    },
    Shopping: {
        color: '#ec4899', // Pink
        bgLight: '#fdf2f8',
        bgDark: 'rgba(236, 72, 153, 0.15)',
        text: '#db2777',
        border: 'rgba(236, 72, 153, 0.3)',
    },
    Purchase: {
        color: '#ec4899',
        bgLight: '#fdf2f8',
        bgDark: 'rgba(236, 72, 153, 0.15)',
        text: '#db2777',
        border: 'rgba(236, 72, 153, 0.3)',
    },
    Dress: {
        color: '#f43f5e', // Rose
        bgLight: '#fff1f2',
        bgDark: 'rgba(244, 63, 94, 0.15)',
        text: '#e11d48',
        border: 'rgba(244, 63, 94, 0.3)',
    },
    Games: {
        color: '#a855f7', // Purple
        bgLight: '#faf5ff',
        bgDark: 'rgba(168, 85, 247, 0.15)',
        text: '#9333ea',
        border: 'rgba(168, 85, 247, 0.3)',
    },
    Parking: {
        color: '#0ea5e9', // Sky
        bgLight: '#f0f9ff',
        bgDark: 'rgba(14, 165, 233, 0.15)',
        text: '#0284c7',
        border: 'rgba(14, 165, 233, 0.3)',
    },
    Travel: {
        color: '#06b6d4', // Cyan
        bgLight: '#ecfeff',
        bgDark: 'rgba(6, 182, 212, 0.15)',
        text: '#0891b2',
        border: 'rgba(6, 182, 212, 0.3)',
    },
    Service: {
        color: '#6366f1', // Indigo
        bgLight: '#eef2ff',
        bgDark: 'rgba(99, 102, 241, 0.15)',
        text: '#4f46e5',
        border: 'rgba(99, 102, 241, 0.3)',
    },
    Investments: {
        color: '#14b8a6', // Teal
        bgLight: '#f0fdfa',
        bgDark: 'rgba(20, 184, 166, 0.15)',
        text: '#0d9488',
        border: 'rgba(20, 184, 166, 0.3)',
    },
    Others: {
        color: '#64748b', // Slate
        bgLight: '#f8fafc',
        bgDark: 'rgba(100, 116, 139, 0.15)',
        text: '#475569',
        border: 'rgba(100, 116, 139, 0.3)',
    }
};

const DEFAULT_THEME = {
    color: '#6366f1',
    bgLight: '#eef2ff',
    bgDark: 'rgba(99, 102, 241, 0.15)',
    text: '#4f46e5',
    border: 'rgba(99, 102, 241, 0.3)',
};

export const getCategoryTheme = (categoryName) => {
    if (!categoryName) return DEFAULT_THEME;
    const normalized = categoryName.trim().charAt(0).toUpperCase() + categoryName.trim().slice(1).toLowerCase();
    
    // Check direct match
    if (CATEGORY_PALETTE[normalized]) {
        return CATEGORY_PALETTE[normalized];
    }

    // Match partial keywords
    const lower = categoryName.toLowerCase();
    if (lower.includes('food') || lower.includes('dine') || lower.includes('cafe')) return CATEGORY_PALETTE.Food;
    if (lower.includes('salary') || lower.includes('wage') || lower.includes('income')) return CATEGORY_PALETTE.Salary;
    if (lower.includes('movie') || lower.includes('cinema') || lower.includes('show')) return CATEGORY_PALETTE.Movies;
    if (lower.includes('shop') || lower.includes('buy') || lower.includes('store')) return CATEGORY_PALETTE.Shopping;
    if (lower.includes('cloth') || lower.includes('dress') || lower.includes('wear')) return CATEGORY_PALETTE.Dress;
    if (lower.includes('game') || lower.includes('play')) return CATEGORY_PALETTE.Games;
    if (lower.includes('park') || lower.includes('car') || lower.includes('transit')) return CATEGORY_PALETTE.Parking;
    if (lower.includes('travel') || lower.includes('flight') || lower.includes('hotel')) return CATEGORY_PALETTE.Travel;
    if (lower.includes('bill') || lower.includes('service') || lower.includes('sub')) return CATEGORY_PALETTE.Service;
    if (lower.includes('invest') || lower.includes('stock') || lower.includes('crypto')) return CATEGORY_PALETTE.Investments;

    // Deterministic color assignment for custom categories
    const colors = [
        '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', 
        '#06b6d4', '#14b8a6', '#f43f5e', '#3b82f6', '#84cc16'
    ];
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
        hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];

    return {
        color,
        bgLight: `${color}18`,
        bgDark: `${color}25`,
        text: color,
        border: `${color}40`,
    };
};
