const express = require('express');
const incomeModel = require('../Model/income.model');
const userModel = require('../Model/user.model');



const addIncome = async (req, res, next) => {
    const { amount, category, date, description } = req.body;

    try {
        const newIncome = new incomeModel({
            amount,
            category,
            date,
            description,
            userId : req.user.id,
        });

        await newIncome.save();

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                $inc : {
                    totalIncome : amount,
                }
            },
            {
                new : true,
            }
        )

        res.status(200).json({
            success : true,
            message : 'Income saved successfully',
            user,
            newIncome,
        });

    } catch (error) {
        next(error);
    }
};



const deleteIncome = async (req, res, next) => {
    const { id } = req.params;
    // console.log(id);

    try {

        const income = await incomeModel.findById({_id : id});

        console.log(income);

        const amount = income.amount;

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                $inc : {
                    totalIncome : -amount,
                }
            },
            {
                new : true,
            }
        );

        await incomeModel.findByIdAndDelete(id);

        res.status(200).json({
            success : true,
            message : 'Income saved successfully',
            user,
        });


    } catch (error) {
        next(error);
    }
};


const getIncome = async (req, res, next) => {
    try {
        const incomes= await incomeModel.find({
            userId : req.user.id
        }).sort({ date : -1 });

        res.status(200).json({
            success : true,
            message : "Income fetched successfully",
            incomes
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    addIncome,
    getIncome,
    deleteIncome,
}