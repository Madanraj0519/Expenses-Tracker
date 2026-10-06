const mongoose = require('mongoose');

const expenseModel = new mongoose.Schema({
    amount: { 
        type: Number, 
        required: true 
    },
    category: {
         type: String, 
         required: true 
        },
    date: { 
        type: Date, 
        default: Date.now 
    },
    description: { 
        type: String },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
}, { timestamps: true });

expenseModel.index({ userId: 1, date: -1 });
expenseModel.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseModel);