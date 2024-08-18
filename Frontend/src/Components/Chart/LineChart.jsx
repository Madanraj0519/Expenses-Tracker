import React from 'react';
import moment from 'moment-timezone';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, Tooltip, Legend, CategoryScale, LinearScale);


const LineChart = ({incomes, expenses}) => {

    const monthlyExpenseAndIncome = (data) => {
        return data.reduce((acc, item) => {
            const month = new Date(item.date).toLocaleString('default', { month : 'short', year : 'numeric'});
            acc[month] = (acc[month] || 0) + item.amount;
            return acc;
        }, {});
    };
    
    const expenseData = monthlyExpenseAndIncome(expenses);
    const incomeData = monthlyExpenseAndIncome(incomes);

    const labels = [...new Set([...Object.keys(expenseData), ...Object.keys(incomeData)])].sort();

    const data = {
        labels: incomes.map((inc) =>{
            const {date} = inc
            return moment(date).format('MMM Do YY');
        }),
        datasets: [
            {
                label: 'Income',
                data: [
                    ...incomes.map((income) => {
                        const {amount} = income
                        return amount
                    })
                ],
                backgroundColor: 'green',
                tension: .2
            },
            {
                label: 'Expenses',
                data: [
                    ...expenses.map((expense) => {
                        const {amount} = expense
                        return amount
                    })
                ],
                backgroundColor: 'red',
                tension: .2
            }
        ]
    }

    return (
        <div>
            <Line data={data} />
            <span className='text-center flex justify-center font-medium capitalize mt-5'>Expenses & Income Line chart</span>
        </div>
    )
};

export default LineChart;