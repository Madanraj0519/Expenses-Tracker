const mongoose = require('mongoose');


const userModel = mongoose.Schema({
    userName : {
        type : 'string',
        required: true,
    },
    email : {
        type : 'string',
        required: true,
        unique : true,
    },
    password : {
        type : 'string',
        required: true,
    },
    total : {
        type : 'number',
        default : 0,
    },
    totalIncome : {
        type : 'number',
        default : 0,
    },
    totalExpense : {
        type : 'number',
        default : 0,
    }
});


module.exports = mongoose.model('User', userModel);