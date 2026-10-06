const mongoose = require('mongoose');

const incomeModel = new mongoose.Schema({
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

incomeModel.index({ userId: 1, date: -1 });
incomeModel.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model('Income', incomeModel);