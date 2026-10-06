const test = require('node:test');
const assert = require('node:assert/strict');
const { parseMonth, parseBudgetInput } = require('../utils/budgetHelpers');
const { BadRequestError } = require('../utils/ApiError');

test('month parsing returns UTC month boundaries, including December rollover', () => {
    const range = parseMonth('2026-12');
    assert.equal(range.start.toISOString(), '2026-12-01T00:00:00.000Z');
    assert.equal(range.nextMonth.toISOString(), '2027-01-01T00:00:00.000Z');
});

test('budget input validates amounts and normalizes optional categories', () => {
    const input = parseBudgetInput({ month: '2026-06', category: ' Food ', amount: '250' });
    assert.equal(input.month, '2026-06');
    assert.equal(input.category, 'Food');
    assert.equal(input.amount, 250);
    assert.equal(parseBudgetInput({ month: '2026-06', amount: 500 }).category, null);
    assert.throws(() => parseBudgetInput({ month: '2026-13', amount: 100 }), BadRequestError);
    assert.throws(() => parseBudgetInput({ month: '2026-06', amount: 0 }), BadRequestError);
    assert.throws(() => parseBudgetInput({ month: '2026-06', category: ' ', amount: 100 }), BadRequestError);
});
