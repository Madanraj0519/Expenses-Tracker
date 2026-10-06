const express = require('express');
const { getSpendingInsights, getCategorySuggestion } = require('../Controller/insights.controller');
const { verifyToken } = require('../Feature/verifyUser');

const insightsRouter = express.Router();

insightsRouter.get('/spending', verifyToken, getSpendingInsights);
insightsRouter.post('/category-suggestion', verifyToken, getCategorySuggestion);

module.exports = { insightsRouter };
