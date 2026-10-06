const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require("../Model/user.model");
const { asyncHandler } = require('../utils/asyncHandler');
const { BadRequestError, UnauthorizedError, ConflictError } = require('../utils/ApiError');

const createToken = (id) => {
    const jwtSecretKey = process.env.JWT_SECRET_TOKEN;
    if (!jwtSecretKey) {
        throw new Error('JWT_SECRET_TOKEN is not configured in environment variables.');
    }
    return jwt.sign({ id }, jwtSecretKey, { expiresIn: '7d' });
};

const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;

    if (typeof userName !== 'string' || !userName.trim()) {
        throw new BadRequestError('User name is required.');
    }
    if (typeof email !== 'string' || !email.trim()) {
        throw new BadRequestError('Email address is required.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        throw new BadRequestError('Please provide a valid email address.');
    }
    if (typeof password !== 'string' || password.length < 8) {
        throw new BadRequestError('Password must be at least 8 characters long.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findOne({ email: normalizedEmail });

    if (existingUser) {
        throw new ConflictError('A user with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
        userName: userName.trim(),
        email: normalizedEmail,
        password: hashPassword,
    });

    await newUser.save();

    const accessToken = createToken(newUser._id);
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'User registered successfully',
        user: userWithoutPassword,
        accessToken,
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim()) {
        throw new BadRequestError('Email address is required.');
    }
    if (typeof password !== 'string' || !password) {
        throw new BadRequestError('Password is required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const validUser = await userModel.findOne({ email: normalizedEmail });

    if (!validUser) {
        throw new UnauthorizedError('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, validUser.password);

    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password.');
    }

    const { password: _, ...userWithoutPassword } = validUser.toObject();
    const accessToken = createToken(validUser._id);

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Welcome, ${userWithoutPassword.userName}!`,
        user: userWithoutPassword,
        accessToken,
    });
});

module.exports = {
    registerUser,
    loginUser,
};