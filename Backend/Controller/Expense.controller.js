const expenseModel = require('../Model/expense.model');
const userModel = require('../Model/user.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { BadRequestError, NotFoundError } = require('../utils/ApiError');

const addExpense = asyncHandler(async (req, res) => {
    const { amount, category, date, description } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new BadRequestError('Amount must be a positive number.');
    }

    if (!category || !category.trim()) {
        throw new BadRequestError('Category is required.');
    }

    const expenseDate = date ? new Date(date) : new Date();
    if (isNaN(expenseDate.getTime())) {
        throw new BadRequestError('Invalid date format provided.');
    }

    const newExpense = new expenseModel({
        amount: parsedAmount,
        category: category.trim(),
        date: expenseDate,
        description: description ? description.trim() : '',
        userId: req.user.id,
    });

    await newExpense.save();

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        {
            $inc: {
                totalExpense: parsedAmount,
            }
        },
        {
            new: true,
        }
    ).select('-password');

    return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Expense saved successfully',
        user,
        newExpense,
    });
});

const deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError('Expense ID is required.');
    }

    // Secure query: ensure the expense belongs to the logged-in user
    const expense = await expenseModel.findOne({ _id: id, userId: req.user.id });

    if (!expense) {
        throw new NotFoundError('Expense not found or you are not authorized to delete it.');
    }

    const amount = expense.amount;

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        {
            $inc: {
                totalExpense: -amount,
            }
        },
        {
            new: true,
        }
    ).select('-password');

    await expenseModel.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Expense deleted successfully',
        user,
    });
});

const getExpense = asyncHandler(async (req, res) => {
    const { sortBy, order = 'asc', category, startDate, endDate, minAmount, maxAmount } = req.query;

    const filter = { userId: req.user.id };

    if (category && category.trim()) {
        filter.category = category.trim();
    }

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
            const start = new Date(startDate);
            if (!isNaN(start.getTime())) filter.date.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (!isNaN(end.getTime())) filter.date.$lte = end;
        }
    }

    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) {
            const min = Number(minAmount);
            if (!isNaN(min)) filter.amount.$gte = min;
        }
        if (maxAmount) {
            const max = Number(maxAmount);
            if (!isNaN(max)) filter.amount.$lte = max;
        }
    }

    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    const expenses = await expenseModel
        .find(filter)
        .sort(sortBy ? sortOptions : { date: -1 });

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Expenses fetched successfully',
        expenses,
    });
});

const getExpenseChart = asyncHandler(async (req, res) => {
    const expenses = await expenseModel
        .find({ userId: req.user.id })
        .sort({ date: -1 });

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Expense chart data fetched successfully',
        expenses,
    });
});

module.exports = {
    addExpense,
    getExpense,
    deleteExpense,
    getExpenseChart,
};