const mongoose = require('mongoose');

const incomeModel = mongoose.Schema({
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
});

module.exports = mongoose.model('Income', incomeModel);