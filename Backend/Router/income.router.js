const express = require('express');
const { addIncome, getIncome, deleteIncome } = require('../Controller/income.controller');
const { verifyToken } = require('../Feature/verifyUser');
const incomeRouter = express.Router();



incomeRouter.post('/addIncome', verifyToken , addIncome);
incomeRouter.get('/getIncome', verifyToken , getIncome);
incomeRouter.delete('/deleteIncome/:id', verifyToken , deleteIncome);


module.exports = {
    incomeRouter
}