const CATEGORY_RULES = [
    { category: 'Food', keywords: ['grocery', 'groceries', 'restaurant', 'coffee', 'cafe', 'food', 'dining', 'doordash', 'uber eats', 'swiggy', 'zomato'] },
    { category: 'Travel', keywords: ['uber', 'lyft', 'taxi', 'metro', 'bus', 'train', 'flight', 'airline', 'fuel', 'gas station', 'parking'] },
    { category: 'Shopping', keywords: ['amazon', 'shopping', 'store', 'marketplace', 'retail'] },
    { category: 'Service', keywords: ['internet', 'electricity', 'water bill', 'phone bill', 'subscription', 'netflix', 'spotify', 'insurance'] },
    { category: 'Movies', keywords: ['cinema', 'movie', 'theater', 'theatre', 'concert'] },
    { category: 'Salary', keywords: ['payroll', 'salary', 'paycheck', 'wages'] },
    { category: 'Investments', keywords: ['dividend', 'brokerage', 'investment'] },
];

const normalizeDescription = (description) => description
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value) => new Set(value.split(' ').filter((token) => token.length > 1));

const suggestCategory = (description, history = []) => {
    if (typeof description !== 'string') {
        return { suggestion: null, confidence: 0, reason: 'Add a description to get a category suggestion.', source: 'no_match' };
    }
    const normalized = normalizeDescription(description);
    if (!normalized) return { suggestion: null, confidence: 0, reason: 'Add a description to get a category suggestion.' };

    const exactMatches = history.filter((item) => (
        item.description && normalizeDescription(item.description) === normalized && item.category
    ));
    if (exactMatches.length) {
        const categoryCounts = new Map();
        exactMatches.forEach(({ category }) => categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1));
        const [category, count] = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0];
        const consensus = count / exactMatches.length;
        if (consensus < 0.6) {
            return {
                suggestion: null,
                confidence: 0,
                reason: 'Your previous categories for this description differ. Choose a category manually.',
                source: 'conflicting_history',
            };
        }
        return {
            suggestion: category,
            confidence: Number((0.96 * consensus).toFixed(2)),
            reason: 'Based on how you categorized the same description before.',
            source: 'your_history',
        };
    }

    const inputTokens = tokenize(normalized);
    const similarMatches = new Map();
    history.forEach((item) => {
        if (!item.description || !item.category) return;
        const historyTokens = tokenize(normalizeDescription(item.description));
        const intersection = [...inputTokens].filter((token) => historyTokens.has(token)).length;
        const union = new Set([...inputTokens, ...historyTokens]).size;
        const score = union ? intersection / union : 0;
        if (score >= 0.6) {
            const match = similarMatches.get(item.category) || { score: 0 };
            match.score += score;
            similarMatches.set(item.category, match);
        }
    });

    if (similarMatches.size) {
        const ranked = [...similarMatches.entries()].sort((a, b) => b[1].score - a[1].score);
        const winner = ranked[0];
        const totalScore = ranked.reduce((sum, [, item]) => sum + item.score, 0);
        const consensus = winner[1].score / totalScore;
        if (consensus < 0.6) {
            return {
                suggestion: null,
                confidence: 0,
                reason: 'Similar descriptions in your history have different categories. Choose a category manually.',
                source: 'conflicting_history',
            };
        }
        return {
            suggestion: winner[0],
            confidence: Number(Math.min(0.9, 0.65 + consensus * 0.25).toFixed(2)),
            reason: 'Based on similar descriptions in your transaction history.',
            source: 'your_history',
        };
    }

    const rule = CATEGORY_RULES.find(({ keywords }) => (
        keywords.some((keyword) => (` ${normalized} `).includes(` ${keyword} `))
    ));
    if (rule) {
        return {
            suggestion: rule.category,
            confidence: 0.72,
            reason: 'Suggested from common description keywords. Please review before saving.',
            source: 'keyword_match',
        };
    }

    return {
        suggestion: null,
        confidence: 0,
        reason: 'No reliable match found. Choose a category manually.',
        source: 'no_match',
    };
};

module.exports = { suggestCategory, normalizeDescription };
