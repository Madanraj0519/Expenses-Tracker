const incomeModel = require('../Model/income.model');
const userModel = require('../Model/user.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { BadRequestError, NotFoundError } = require('../utils/ApiError');

const addIncome = asyncHandler(async (req, res) => {
    const { amount, category, date, description } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new BadRequestError('Amount must be a positive number.');
    }

    if (!category || !category.trim()) {
        throw new BadRequestError('Category is required.');
    }

    const incomeDate = date ? new Date(date) : new Date();
    if (isNaN(incomeDate.getTime())) {
        throw new BadRequestError('Invalid date format provided.');
    }

    const newIncome = new incomeModel({
        amount: parsedAmount,
        category: category.trim(),
        date: incomeDate,
        description: description ? description.trim() : '',
        userId: req.user.id,
    });

    await newIncome.save();

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        {
            $inc: {
                totalIncome: parsedAmount,
            }
        },
        {
            new: true,
        }
    ).select('-password');

    return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Income saved successfully',
        user,
        newIncome,
    });
});

const deleteIncome = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError('Income ID is required.');
    }

    // Secure query: ensure the income belongs to the logged-in user
    const income = await incomeModel.findOne({ _id: id, userId: req.user.id });

    if (!income) {
        throw new NotFoundError('Income not found or you are not authorized to delete it.');
    }

    const amount = income.amount;

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        {
            $inc: {
                totalIncome: -amount,
            }
        },
        {
            new: true,
        }
    ).select('-password');

    await incomeModel.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Income deleted successfully',
        user,
    });
});

const getIncome = asyncHandler(async (req, res) => {
    const incomes = await incomeModel
        .find({ userId: req.user.id })
        .sort({ date: -1 });

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Income fetched successfully',
        incomes,
    });
});

module.exports = {
    addIncome,
    getIncome,
    deleteIncome,
};