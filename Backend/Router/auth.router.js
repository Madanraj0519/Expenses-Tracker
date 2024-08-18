const express = require('express');
const { registerUser, loginUser } = require('../Controller/auth.controller');

const authRouter = express.Router();


authRouter.post('/registerUser', registerUser);
authRouter.post('/loginUser', loginUser);


module.exports = {
    authRouter
}