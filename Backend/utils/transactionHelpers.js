const { BadRequestError } = require('./ApiError');

const SORT_FIELDS = new Set(['date', 'amount', 'category', 'createdAt']);
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const parseTransactionInput = (body, { partial = false } = {}) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new BadRequestError('Request body must be a JSON object.');
    }
    const input = {};
    const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

    if (!partial || has('amount')) {
        const amount = Number(body.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new BadRequestError('Amount must be a positive number.');
        }
        input.amount = amount;
    }

    if (!partial || has('category')) {
        if (typeof body.category !== 'string' || !body.category.trim()) {
            throw new BadRequestError('Category is required.');
        }
        if (body.category.trim().length > 80) {
            throw new BadRequestError('Category must be 80 characters or fewer.');
        }
        input.category = body.category.trim();
    }

    if (!partial || has('date')) {
        const date = body.date === undefined && !partial ? new Date() : new Date(body.date);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestError('Invalid date format provided.');
        }
        input.date = date;
    }

    if (has('description')) {
        if (typeof body.description !== 'string') {
            throw new BadRequestError('Description must be text.');
        }
        if (body.description.length > 500) {
            throw new BadRequestError('Description must be 500 characters or fewer.');
        }
        input.description = body.description.trim();
    } else if (!partial) {
        input.description = '';
    }

    return input;
};

const parseTransactionQuery = (query, userId) => {
    const filter = { userId };
    const { sortBy, order = 'desc', category, startDate, endDate, minAmount, maxAmount, search } = query;

    if (sortBy && !SORT_FIELDS.has(sortBy)) {
        throw new BadRequestError('Unsupported sort field.');
    }
    if (order !== 'asc' && order !== 'desc') {
        throw new BadRequestError('Sort order must be asc or desc.');
    }
    if (category) {
        if (typeof category !== 'string' || category.length > 80) {
            throw new BadRequestError('Invalid category filter.');
        }
        filter.category = category.trim();
    }

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
            const start = new Date(startDate);
            if (Number.isNaN(start.getTime())) throw new BadRequestError('Invalid start date.');
            filter.date.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (Number.isNaN(end.getTime())) throw new BadRequestError('Invalid end date.');
            if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) end.setUTCHours(23, 59, 59, 999);
            filter.date.$lte = end;
        }
        if (filter.date.$gte && filter.date.$lte && filter.date.$gte > filter.date.$lte) {
            throw new BadRequestError('Start date must be before end date.');
        }
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
        filter.amount = {};
        if (minAmount !== undefined) {
            const min = Number(minAmount);
            if (!Number.isFinite(min) || min < 0) throw new BadRequestError('Minimum amount must be zero or greater.');
            filter.amount.$gte = min;
        }
        if (maxAmount !== undefined) {
            const max = Number(maxAmount);
            if (!Number.isFinite(max) || max < 0) throw new BadRequestError('Maximum amount must be zero or greater.');
            filter.amount.$lte = max;
        }
        if (filter.amount.$gte !== undefined && filter.amount.$lte !== undefined && filter.amount.$gte > filter.amount.$lte) {
            throw new BadRequestError('Minimum amount cannot exceed maximum amount.');
        }
    }

    if (search) {
        if (typeof search !== 'string' || search.length > 100) {
            throw new BadRequestError('Search must be 100 characters or fewer.');
        }
        const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (escaped) {
            filter.$or = [
                { category: { $regex: escaped, $options: 'i' } },
                { description: { $regex: escaped, $options: 'i' } },
            ];
        }
    }

    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? DEFAULT_PAGE_SIZE : Number(query.limit);
    if (!Number.isInteger(page) || page < 1) throw new BadRequestError('Page must be a positive integer.');
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
        throw new BadRequestError(`Page size must be between 1 and ${MAX_PAGE_SIZE}.`);
    }

    return {
        filter,
        page,
        limit,
        sort: { [sortBy || 'date']: order === 'asc' ? 1 : -1 },
    };
};

module.exports = { parseTransactionInput, parseTransactionQuery };
