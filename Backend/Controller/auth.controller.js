const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require("../Model/user.model");


const createToken = (id) => {
    const jwtSecretKey = process.env.JWT_SECRET_TOKEN;

    return jwt.sign({id}, jwtSecretKey, {expiresIn : "36000m"});
}


const registerUser = async(req, res, next) => {

    const { userName, email, password } = req.body;

    try {
        
        let user = await userModel.findOne({ email: email});

        if(user){
            res.status(400).json({
                success : false,
                message : "User with this email already exists",
            });
        }

        const hashPassword = bcrypt.hashSync(password);

        user = await userModel({
            userName,
            email,
            password : hashPassword,
        });

        await user.save();

        const accessToken = createToken(user._id);

        res.status(200).json({
            success : true,
            message : "User registered successfully",
            user,
            accessToken,
        });

        console.log(token);

    } catch (error) {
        next(error);
    }
};


const loginUser = async(req, res, next) => {

    const { email, password } = req.body;

    try {
        
        const validUser = await userModel.findOne({ email: email });

        if(!validUser){
            res.status(404).json({
                success : false,
                message : "User not found",
            });
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);

        if(!validPassword){
            res.status(404).json({
                success : false,
                message : "Invalid credentials",
            })
        }

        const { password : hashedPassword, ...user } = validUser._doc;

        const accessToken = createToken(user._id);

        res.status(200).json({
            success : true,
            message : `Welcome, ${user.userName}!!`,
            user,
            accessToken,
        });


    } catch (error) {
        next(error);
    }
};



module.exports = {
    registerUser,
    loginUser,
}