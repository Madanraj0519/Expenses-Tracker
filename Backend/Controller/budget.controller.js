const mongoose = require('mongoose');
const budgetModel = require('../Model/budget.model');
const expenseModel = require('../Model/expense.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { BadRequestError, NotFoundError } = require('../utils/ApiError');
const { parseMonth, parseBudgetInput } = require('../utils/budgetHelpers');

const getBudgets = asyncHandler(async (req, res) => {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const { start, nextMonth } = parseMonth(month);
    const [budgets, spending] = await Promise.all([
        budgetModel.find({ userId: req.user.id, month }).sort({ category: 1 }),
        expenseModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id), date: { $gte: start, $lt: nextMonth } } },
            { $group: { _id: '$category', spent: { $sum: '$amount' } } },
        ]),
    ]);

    const spentByCategory = new Map(spending.map((item) => [item._id, item.spent]));
    const totalSpent = spending.reduce((total, item) => total + item.spent, 0);
    const result = budgets.map((budget) => {
        const spent = budget.category === null ? totalSpent : (spentByCategory.get(budget.category) || 0);
        const percentage = (spent / budget.amount) * 100;
        return {
            ...budget.toObject(),
            spent,
            remaining: Math.max(0, budget.amount - spent),
            percentage,
            alertLevel: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'normal',
        };
    });

    return res.status(200).json({
        success: true,
        statusCode: 200,
        month,
        totalSpent,
        budgets: result,
    });
});

const saveBudget = asyncHandler(async (req, res) => {
    const { month, monthStart, nextMonth, category, amount } = parseBudgetInput(req.body);
    const budget = await budgetModel.findOneAndUpdate(
        { userId: req.user.id, month, category },
        { $set: { amount }, $setOnInsert: { userId: req.user.id, month, category } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const match = { userId: new mongoose.Types.ObjectId(req.user.id), date: { $gte: monthStart, $lt: nextMonth } };
    if (category !== null) match.category = category;
    const [aggregate] = await expenseModel.aggregate([
        { $match: match },
        { $group: { _id: null, spent: { $sum: '$amount' } } },
    ]);
    const spent = aggregate?.spent || 0;
    const percentage = (spent / budget.amount) * 100;

    return res.status(200).json({
        success: true,
        statusCode: 200,
        budget: {
            ...budget.toObject(),
            spent,
            remaining: Math.max(0, budget.amount - spent),
            percentage,
            alertLevel: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'normal',
        },
    });
});

const deleteBudget = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new BadRequestError('Invalid budget ID.');
    const deleted = await budgetModel.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) throw new NotFoundError('Budget not found.');
    return res.status(200).json({ success: true, statusCode: 200, message: 'Budget deleted successfully.' });
});

module.exports = { getBudgets, saveBudget, deleteBudget };
