const express = require('express');
const expenseModel = require('../Model/expense.model');
const userModel = require('../Model/user.model');



const addExpense = async (req, res, next) => {
    const { amount, category, date, description } = req.body;

    try {
        const newExpense = new expenseModel({
            amount,
            category,
            date,
            description,
            userId : req.user.id,
        });

        await newExpense.save();

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                $inc : {
                    totalExpense : amount,
                }
            },
            {
                new : true,
            }
        )

        res.status(200).json({
            success : true,
            message : 'Expense saved successfully',
            user,
            newExpense,
        });

    } catch (error) {
        next(error);
    }
};



const deleteExpense = async (req, res, next) => {
    const { id } = req.params;
    console.log(id);

    try {

        const Expense = await expenseModel.findById({_id : id});

        console.log(Expense);

        const amount = Expense.amount;

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                $inc : {
                    totalExpense : -amount,
                }
            },
            {
                new : true,
            }
        );

        await expenseModel.findByIdAndDelete(id);

        res.status(200).json({
            success : true,
            message : 'Expense saved successfully',
            user,
        });


    } catch (error) {
        next(error);
    }
};


const getExpense = async (req, res, next) => {

    const { sortBy, order = 'asc', category, startDate, endDate, minAmount, maxAmount } = req.query;

    try {

        let filter = { userId : req.user.id };

        // Applying filters

        if(category) filter.category = category;
        if(startDate || endDate ) filter.date = {};
        if(startDate) filter.date.$gte = new Date(startDate);
        if(endDate) filter.date.$lte = new Date(endDate);
        if(minAmount || maxAmount ) filter.amount = {};
        if(minAmount) filter.amount.$gte = minAmount;
        if (maxAmount) filter.amount.$lte = maxAmount;

        // Applying sorting

        const sortOptions = {};
        if(sortBy){
            sortOptions[sortBy] = order === 'asc' ? 1 : -1;
        }

        const expenses= await expenseModel.find(filter).sort(sortBy ? sortOptions : { date : -1});

        res.status(200).json({
            success : true,
            message : "Expense fetched successfully",
            expenses
        });

    } catch (error) {
        next(error);
    }
};


const getExpenseChart = async (req, res, next) => {
    try {
        const  expenses = await expenseModel.find({
            userId : req.user.id
        }).sort({ date : -1 });

        res.status(200).json({
            success : true,
            message : "Income fetched successfully",
            expenses
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    addExpense,
    getExpense,
    deleteExpense,
    getExpenseChart,
}