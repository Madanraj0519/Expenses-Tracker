const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSpendingInsights } = require('../utils/insightHelpers');

test('budget pace insight projects spending only for the current month', () => {
    const result = buildSpendingInsights({
        month: '2026-06',
        now: new Date('2026-06-16T12:00:00.000Z'),
        monthlyCategoryTotals: [{ _id: { month: '2026-06', category: 'Food' }, total: 400 }],
        budgets: [{ category: 'Food', amount: 500 }],
    });

    assert.equal(result.insights.length, 1);
    assert.equal(result.insights[0].type, 'budget_pace');
    assert.equal(result.insights[0].evidence.projected, 750);
    assert.match(result.insights[0].message, /may reach \$750\.00/);
});

test('month-over-month insights compare the same number of days and suppress small changes', () => {
    const result = buildSpendingInsights({
        month: '2026-06',
        now: new Date('2026-06-16T12:00:00.000Z'),
        monthlyCategoryTotals: [
            { _id: { month: '2026-05', category: 'Food' }, total: 300 },
            { _id: { month: '2026-06', category: 'Food' }, total: 240 },
        ],
        budgets: [],
    });

    const trend = result.insights.find((insight) => insight.type === 'month_over_month');
    assert.ok(trend);
    assert.equal(trend.evidence.previousComparable, (300 / 31) * 16);
    assert.ok(trend.evidence.changePercent > 50 && trend.evidence.changePercent < 56);
});

test('month-over-month comparison trims a 31-day month to match a 30-day prior month', () => {
    const currentDays = Array.from({ length: 30 }, (_, index) => ({
        _id: { month: '2026-05', day: index + 1, category: 'Food' },
        total: 13,
    }));
    const previousDays = Array.from({ length: 30 }, (_, index) => ({
        _id: { month: '2026-04', day: index + 1, category: 'Food' },
        total: 10,
    }));
    const result = buildSpendingInsights({
        month: '2026-05',
        now: new Date('2026-06-10T12:00:00.000Z'),
        monthlyCategoryTotals: [
            { _id: { month: '2026-04', category: 'Food' }, total: 300 },
            { _id: { month: '2026-05', category: 'Food' }, total: 390 },
        ],
        dailyCategoryTotals: [...currentDays, ...previousDays],
        budgets: [],
    });
    const trend = result.insights.find((insight) => insight.type === 'month_over_month');

    assert.ok(trend);
    assert.equal(trend.evidence.currentAmount, 390);
    assert.equal(trend.evidence.previousComparable, 300);
    assert.equal(trend.evidence.comparableDays, 30);
});

test('unusual-spending insights need at least two historical months and seven elapsed days', () => {
    const history = [
        { _id: { month: '2026-03', category: 'Travel' }, total: 100 },
        { _id: { month: '2026-04', category: 'Travel' }, total: 100 },
        { _id: { month: '2026-05', category: 'Travel' }, total: 100 },
        { _id: { month: '2026-06', category: 'Travel' }, total: 300 },
    ];
    const enoughHistory = buildSpendingInsights({
        month: '2026-06',
        now: new Date('2026-06-20T12:00:00.000Z'),
        monthlyCategoryTotals: history,
        budgets: [],
    });
    assert.ok(enoughHistory.insights.some((insight) => insight.type === 'unusual_spending'));

    const insufficientHistory = buildSpendingInsights({
        month: '2026-06',
        now: new Date('2026-06-05T12:00:00.000Z'),
        monthlyCategoryTotals: history,
        budgets: [],
    });
    assert.ok(!insufficientHistory.insights.some((insight) => insight.type === 'unusual_spending'));
});
