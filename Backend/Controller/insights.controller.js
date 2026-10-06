const mongoose = require('mongoose');
const expenseModel = require('../Model/expense.model');
const budgetModel = require('../Model/budget.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/ApiError');
const { parseMonth } = require('../utils/budgetHelpers');
const { buildSpendingInsights } = require('../utils/insightHelpers');
const { suggestCategory } = require('../utils/categorySuggestionHelpers');

const getSpendingInsights = asyncHandler(async (req, res) => {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    parseMonth(month);
    if (month > new Date().toISOString().slice(0, 7)) {
        throw new BadRequestError('Spending insights are available for the current or a past month.');
    }
    const [year, monthNumber] = month.split('-').map(Number);
    const historyStart = new Date(Date.UTC(year, monthNumber - 4, 1));
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [spendingData, budgets] = await Promise.all([
        expenseModel.aggregate([
            { $match: { userId, date: { $gte: historyStart, $lt: new Date(Date.UTC(year, monthNumber, 1)) } } },
            {
                $facet: {
                    monthlyCategoryTotals: [
                        {
                            $group: {
                                _id: {
                                    month: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
                                    category: '$category',
                                },
                                total: { $sum: '$amount' },
                            },
                        },
                    ],
                    dailyCategoryTotals: [
                        {
                            $group: {
                                _id: {
                                    month: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
                                    day: { $dayOfMonth: { date: '$date', timezone: 'UTC' } },
                                    category: '$category',
                                },
                                total: { $sum: '$amount' },
                            },
                        },
                    ],
                },
            },
        ]),
        budgetModel.find({ userId, month }).select('category amount').lean(),
    ]);

    const [aggregates = { monthlyCategoryTotals: [], dailyCategoryTotals: [] }] = spendingData;
    return res.status(200).json({
        success: true,
        statusCode: 200,
        ...buildSpendingInsights({ month, ...aggregates, budgets }),
    });
});

const getCategorySuggestion = asyncHandler(async (req, res) => {
    const { description } = req.body || {};
    if (typeof description !== 'string' || description.trim().length < 2 || description.length > 200) {
        throw new BadRequestError('Description must contain between 2 and 200 characters.');
    }

    const history = await expenseModel.find(
        { userId: req.user.id, description: { $exists: true, $ne: '' } },
        { description: 1, category: 1, _id: 0 }
    ).sort({ date: -1 }).limit(500).lean();

    return res.status(200).json({
        success: true,
        statusCode: 200,
        ...suggestCategory(description.trim(), history),
    });
});

module.exports = { getSpendingInsights, getCategorySuggestion };
