const { BadRequestError } = require('./ApiError');

const parseMonth = (month) => {
    if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        throw new BadRequestError('Month must use YYYY-MM format.');
    }
    return {
        start: new Date(`${month}-01T00:00:00.000Z`),
        nextMonth: new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1)),
    };
};

const parseBudgetInput = (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new BadRequestError('Request body must be a JSON object.');
    }
    const { month, category = null } = body;
    const parsedMonth = parseMonth(month);
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestError('Budget amount must be a positive number.');
    }
    if (category !== null && (typeof category !== 'string' || !category.trim() || category.trim().length > 80)) {
        throw new BadRequestError('Category must be text between 1 and 80 characters.');
    }
    return {
        month,
        monthStart: parsedMonth.start,
        nextMonth: parsedMonth.nextMonth,
        category: category === null ? null : category.trim(),
        amount,
    };
};

module.exports = { parseMonth, parseBudgetInput };
