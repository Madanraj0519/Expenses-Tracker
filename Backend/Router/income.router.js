const express = require('express');
const { addIncome, updateIncome, getIncome, getIncomeChart, deleteIncome } = require('../Controller/income.controller');
const { verifyToken } = require('../Feature/verifyUser');
const incomeRouter = express.Router();



incomeRouter.post('/addIncome', verifyToken , addIncome);
incomeRouter.put('/updateIncome/:id', verifyToken, updateIncome);
incomeRouter.get('/getIncome', verifyToken , getIncome);
incomeRouter.get('/getIncomeChart', verifyToken, getIncomeChart);
incomeRouter.delete('/deleteIncome/:id', verifyToken , deleteIncome);


module.exports = {
    incomeRouter
}