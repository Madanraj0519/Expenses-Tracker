const expenseModel = require('../Model/expense.model');
const { createTransactionController } = require('./transactionControllerFactory');

const controller = createTransactionController(expenseModel, 'totalExpense', 'Expense', 'newExpense');

module.exports = {
    addExpense: controller.add,
    updateExpense: controller.update,
    deleteExpense: controller.remove,
    getExpense: controller.list,
    getExpenseChart: controller.chart,
};
