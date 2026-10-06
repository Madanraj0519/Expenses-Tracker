const incomeModel = require('../Model/income.model');
const { createTransactionController } = require('./transactionControllerFactory');

const controller = createTransactionController(incomeModel, 'totalIncome', 'Income', 'newIncome');

module.exports = {
    addIncome: controller.add,
    updateIncome: controller.update,
    deleteIncome: controller.remove,
    getIncome: controller.list,
    getIncomeChart: controller.chart,
};
