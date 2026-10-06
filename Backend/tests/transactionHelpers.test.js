const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTransactionInput, parseTransactionQuery } = require('../utils/transactionHelpers');
const { BadRequestError } = require('../utils/ApiError');

test('transaction input accepts and normalizes valid values', () => {
    const input = parseTransactionInput({
        amount: '25.50',
        category: '  Groceries ',
        description: '  weekly shop ',
        date: '2026-06-01T10:00:00.000Z',
    });

    assert.equal(input.amount, 25.5);
    assert.equal(input.category, 'Groceries');
    assert.equal(input.description, 'weekly shop');
    assert.equal(input.date.toISOString(), '2026-06-01T10:00:00.000Z');
});

test('transaction input rejects invalid amount, date, and oversized descriptions', () => {
    assert.throws(() => parseTransactionInput({ amount: 'NaN', category: 'Food' }), BadRequestError);
    assert.throws(() => parseTransactionInput({ amount: 1, category: 'Food', date: 'not-a-date' }), BadRequestError);
    assert.throws(() => parseTransactionInput({ amount: 1, category: 'Food', description: 'x'.repeat(501) }), BadRequestError);
    assert.throws(() => parseTransactionInput(null), BadRequestError);
});

test('partial transaction input supports only provided fields', () => {
    assert.deepEqual(parseTransactionInput({ description: ' updated ' }, { partial: true }), {
        description: 'updated',
    });
    assert.throws(() => parseTransactionInput({ category: ' ' }, { partial: true }), BadRequestError);
});

test('transaction query constrains sorting, page sizes, date ranges, and escaped search', () => {
    const parsed = parseTransactionQuery({
        page: '2',
        limit: '25',
        sortBy: 'amount',
        order: 'asc',
        search: 'rent.*',
    }, 'user-id');

    assert.equal(parsed.page, 2);
    assert.equal(parsed.limit, 25);
    assert.deepEqual(parsed.sort, { amount: 1 });
    assert.equal(parsed.filter.userId, 'user-id');
    assert.equal(parsed.filter.$or[0].category.$regex, 'rent\\.\\*');
    const dateRange = parseTransactionQuery({ endDate: '2026-06-30' }, 'user-id');
    assert.equal(dateRange.filter.date.$lte.toISOString(), '2026-06-30T23:59:59.999Z');
    assert.throws(() => parseTransactionQuery({ sortBy: 'userId' }, 'user-id'), BadRequestError);
    assert.throws(() => parseTransactionQuery({ page: '-1' }, 'user-id'), BadRequestError);
    assert.throws(() => parseTransactionQuery({ startDate: '2026-06-02', endDate: '2026-06-01' }, 'user-id'), BadRequestError);
});
