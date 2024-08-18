const express = require('express');
const { addExpense, getExpense, deleteExpense, getExpenseChart } = require('../Controller/Expense.controller');
const { verifyToken } = require('../Feature/verifyUser');
const ExpenseRouter = express.Router();



ExpenseRouter.post('/addExpense', verifyToken , addExpense);
ExpenseRouter.get('/getExpense', verifyToken , getExpense);
ExpenseRouter.get('/getExpenseChart', verifyToken , getExpenseChart);
ExpenseRouter.delete('/deleteExpense/:id', verifyToken , deleteExpense);


module.exports = {
    ExpenseRouter
}