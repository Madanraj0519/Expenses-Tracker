const express = require('express');
const { getBudgets, saveBudget, deleteBudget } = require('../Controller/budget.controller');
const { verifyToken } = require('../Feature/verifyUser');

const budgetRouter = express.Router();

budgetRouter.get('/', verifyToken, getBudgets);
budgetRouter.put('/', verifyToken, saveBudget);
budgetRouter.delete('/:id', verifyToken, deleteBudget);

module.exports = { budgetRouter };
