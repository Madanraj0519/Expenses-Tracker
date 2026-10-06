const { parseMonth } = require('./budgetHelpers');

const formatMoney = (amount) => `$${Number(amount).toFixed(2)}`;

const buildSpendingInsights = ({ month, monthlyCategoryTotals, dailyCategoryTotals = [], budgets, now = new Date() }) => {
    parseMonth(month);
    const currentMonth = now.toISOString().slice(0, 7);
    const isCurrentMonth = month === currentMonth;
    const daysInMonth = new Date(Date.UTC(
        Number(month.slice(0, 4)),
        Number(month.slice(5, 7)),
        0
    )).getUTCDate();
    const elapsedDays = isCurrentMonth ? now.getUTCDate() : daysInMonth;
    const insights = [];
    const totals = new Map();
    const dailyTotals = new Map();

    monthlyCategoryTotals.forEach(({ _id, total }) => {
        if (!totals.has(_id.month)) totals.set(_id.month, new Map());
        totals.get(_id.month).set(_id.category, total);
    });
    dailyCategoryTotals.forEach(({ _id, total }) => {
        if (!dailyTotals.has(_id.month)) dailyTotals.set(_id.month, new Map());
        const days = dailyTotals.get(_id.month);
        if (!days.has(_id.day)) days.set(_id.day, new Map());
        days.get(_id.day).set(_id.category, total);
    });

    const sumThroughDay = (selectedMonth, category, finalDay) => {
        const days = dailyTotals.get(selectedMonth);
        if (!days) return null;
        let total = 0;
        days.forEach((categoryTotals, day) => {
            if (day <= finalDay) total += categoryTotals.get(category) || 0;
        });
        return total;
    };

    const selectedTotals = totals.get(month) || new Map();
    const selectedOverall = [...selectedTotals.values()].reduce((sum, amount) => sum + amount, 0);

    budgets.forEach((budget) => {
        const spent = budget.category === null
            ? selectedOverall
            : (selectedTotals.get(budget.category) || 0);
        const projected = elapsedDays > 0 ? (spent / elapsedDays) * daysInMonth : spent;
        if (spent >= budget.amount || (isCurrentMonth && projected >= budget.amount)) {
            const label = budget.category || 'Overall spending';
            insights.push({
                type: 'budget_pace',
                severity: spent >= budget.amount ? 'warning' : 'caution',
                category: budget.category,
                title: `${label} budget is at risk`,
                message: spent >= budget.amount
                    ? `${label} spending is ${formatMoney(spent)} against a ${formatMoney(budget.amount)} budget.`
                    : `At this pace, ${label.toLowerCase()} spending may reach ${formatMoney(projected)} against a ${formatMoney(budget.amount)} budget.`,
                evidence: { spent, budget: budget.amount, projected, elapsedDays, daysInMonth },
            });
        }
    });

    const [year, monthNumber] = month.split('-').map(Number);
    const previousMonth = new Date(Date.UTC(year, monthNumber - 2, 1)).toISOString().slice(0, 7);
    const previousTotals = totals.get(previousMonth) || new Map();
    const categories = new Set([...selectedTotals.keys(), ...previousTotals.keys()]);
    const previousMonthDays = new Date(Date.UTC(year, monthNumber - 1, 0)).getUTCDate();
    const comparableDays = Math.min(elapsedDays, previousMonthDays);
    const historicalMonths = Array.from({ length: 3 }, (_, index) => {
        const date = new Date(Date.UTC(year, monthNumber - 2 - index, 1));
        return date.toISOString().slice(0, 7);
    });

    categories.forEach((category) => {
        const currentAmount = selectedTotals.get(category) || 0;
        const previousAmount = previousTotals.get(category) || 0;
        const currentComparable = sumThroughDay(month, category, comparableDays)
            ?? (isCurrentMonth ? currentAmount : (currentAmount / daysInMonth) * comparableDays);
        const previousComparable = sumThroughDay(previousMonth, category, comparableDays)
            ?? (previousAmount / previousMonthDays) * comparableDays;
        if (previousComparable > 0) {
            const changePercent = ((currentComparable - previousComparable) / previousComparable) * 100;
            if (Math.abs(changePercent) >= 30 && Math.abs(currentComparable - previousComparable) >= 20) {
                insights.push({
                    type: 'month_over_month',
                    severity: changePercent > 0 ? 'caution' : 'positive',
                    category,
                    title: `${category} spending ${changePercent > 0 ? 'is up' : 'is down'} ${Math.abs(changePercent).toFixed(0)}%`,
                    message: `${category} spending is ${formatMoney(currentComparable)} over the first ${comparableDays} days, compared with ${formatMoney(previousComparable)} over the same days in ${previousMonth}.`,
                    evidence: { currentAmount: currentComparable, previousComparable, changePercent, comparableDays, previousMonth },
                });
            }
        }

        if (elapsedDays < 7) return;
        const monthsWithData = historicalMonths.filter((historicalMonth) => (
            (totals.get(historicalMonth)?.get(category) || 0) > 0
        ));
        if (monthsWithData.length < 2) return;
        const historicalAverage = historicalMonths.reduce(
            (sum, historicalMonth) => sum + (totals.get(historicalMonth)?.get(category) || 0),
            0
        ) / historicalMonths.length;
        const projected = (currentAmount / elapsedDays) * daysInMonth;
        if (historicalAverage > 0 && projected >= historicalAverage * 1.5 && projected - historicalAverage >= 50) {
            insights.push({
                type: 'unusual_spending',
                severity: 'caution',
                category,
                title: `${category} spending is above your recent pattern`,
                message: `At the current pace, ${category.toLowerCase()} spending may reach ${formatMoney(projected)} this month; your average for the previous three months was ${formatMoney(historicalAverage)}.`,
                evidence: { projected, historicalAverage, monthsWithData: monthsWithData.length, elapsedDays, daysInMonth },
            });
        }
    });

    return {
        month,
        generatedAt: now.toISOString(),
        insights: insights.slice(0, 8),
        dataSufficiency: {
            historicalMonthsAvailable: historicalMonths.filter((historicalMonth) => totals.has(historicalMonth)).length,
            elapsedDays,
            message: historicalMonths.filter((historicalMonth) => totals.has(historicalMonth)).length < 2
                ? 'Add more monthly transaction history for personalized trend and unusual-spending insights.'
                : null,
        },
    };
};

module.exports = { buildSpendingInsights };
