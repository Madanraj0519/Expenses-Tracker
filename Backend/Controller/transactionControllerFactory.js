const mongoose = require('mongoose');
const userModel = require('../Model/user.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { BadRequestError, NotFoundError } = require('../utils/ApiError');
const { parseTransactionInput, parseTransactionQuery } = require('../utils/transactionHelpers');

const createTransactionController = (model, totalField, entityName, responseKey) => {
    const add = asyncHandler(async (req, res) => {
        const input = parseTransactionInput(req.body);
        const session = await mongoose.startSession();
        let savedTransaction;
        let user;

        try {
            await session.withTransaction(async () => {
                const [transaction] = await model.create([{ ...input, userId: req.user.id }], { session });
                user = await userModel.findByIdAndUpdate(
                    req.user.id,
                    { $inc: { [totalField]: input.amount } },
                    { new: true, session }
                ).select('-password');
                if (!user) throw new NotFoundError('User account not found.');
                savedTransaction = transaction;
            });
        } finally {
            await session.endSession();
        }

        return res.status(201).json({
            success: true,
            statusCode: 201,
            message: `${entityName} saved successfully`,
            user,
            [responseKey]: savedTransaction,
        });
    });

    const update = asyncHandler(async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            throw new BadRequestError(`Invalid ${entityName.toLowerCase()} ID.`);
        }
        const input = parseTransactionInput(req.body, { partial: true });
        if (Object.keys(input).length === 0) {
            throw new BadRequestError('At least one transaction field must be provided.');
        }

        const session = await mongoose.startSession();
        let updatedTransaction;
        let user;

        try {
            await session.withTransaction(async () => {
                const existing = await model.findOne({ _id: req.params.id, userId: req.user.id }).session(session);
                if (!existing) throw new NotFoundError(`${entityName} not found.`);

                const oldAmount = existing.amount;
                Object.assign(existing, input);
                updatedTransaction = await existing.save({ session });

                const amountDelta = updatedTransaction.amount - oldAmount;
                user = await userModel.findByIdAndUpdate(
                    req.user.id,
                    { $inc: { [totalField]: amountDelta } },
                    { new: true, session }
                ).select('-password');
                if (!user) throw new NotFoundError('User account not found.');
            });
        } finally {
            await session.endSession();
        }

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: `${entityName} updated successfully`,
            user,
            [responseKey]: updatedTransaction,
        });
    });

    const remove = asyncHandler(async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            throw new BadRequestError(`Invalid ${entityName.toLowerCase()} ID.`);
        }

        const session = await mongoose.startSession();
        let user;

        try {
            await session.withTransaction(async () => {
                const deleted = await model.findOneAndDelete(
                    { _id: req.params.id, userId: req.user.id },
                    { session }
                );
                if (!deleted) throw new NotFoundError(`${entityName} not found.`);

                user = await userModel.findByIdAndUpdate(
                    req.user.id,
                    { $inc: { [totalField]: -deleted.amount } },
                    { new: true, session }
                ).select('-password');
                if (!user) throw new NotFoundError('User account not found.');
            });
        } finally {
            await session.endSession();
        }

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: `${entityName} deleted successfully`,
            user,
        });
    });

    const list = asyncHandler(async (req, res) => {
        const { filter, page, limit, sort } = parseTransactionQuery(req.query, req.user.id);
        const [items, totalItems, categories] = await Promise.all([
            model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
            model.countDocuments(filter),
            model.distinct('category', { userId: req.user.id }),
        ]);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: `${entityName === 'Expense' ? 'Expenses' : 'Incomes'} fetched successfully`,
            [responseKey === 'newExpense' ? 'expenses' : 'incomes']: items,
            categories,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
            },
        });
    });

    const chart = asyncHandler(async (req, res) => {
        const transactions = await model.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
                        category: '$category',
                    },
                    amount: { $sum: '$amount' },
                },
            },
            { $sort: { '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    amount: 1,
                    category: '$_id.category',
                    date: { $dateFromString: { dateString: { $concat: ['$_id.month', '-01T00:00:00.000Z'] } } },
                },
            },
        ]);
        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: `${entityName} chart data fetched successfully`,
            [responseKey === 'newExpense' ? 'expenses' : 'incomes']: transactions,
        });
    });

    return { add, update, remove, list, chart };
};

module.exports = { createTransactionController };
