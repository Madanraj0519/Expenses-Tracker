require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { authRouter } = require('./Router/auth.router');
const { incomeRouter } = require('./Router/income.router');
const { ExpenseRouter } = require('./Router/expense.router');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 8000;

// Global process error handlers
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
    console.error('CRITICAL: Unhandled Promise Rejection:', reason);
});

// Middleware
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

const allowedOrigins = [
    // 'http://localhost:3000',
    'https://expenses-trackers-front-end.vercel.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback for dev ease or specify domain
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Database connection
if (!process.env.MONGO_BD) {
    console.error('WARNING: MONGO_BD connection string is missing from environment variables.');
} else {
    mongoose.connect(process.env.MONGO_BD)
        .then(() => {
            console.log('MongoDB connection initialized successfully');
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err.message);
        });
}

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Expenses Tracker API is live and healthy.'
    });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/income', incomeRouter);
app.use('/api/expense', ExpenseRouter);

// 404 Route Not Found Middleware (Must be placed after all route definitions)
app.use(notFoundHandler);

// Centralized Error Handling Middleware (Must be placed last)
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`);
});

module.exports = app;
