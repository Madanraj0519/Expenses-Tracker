import React, {useState} from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import moment from 'moment-timezone';


ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ expenses }) => {

    const [category, setCategory] = useState('category');

    const categoryTotals = expenses.reduce((acc, expense) =>{
        acc[category === 'date' ? moment(expense.date).format('MMMM Do YYYY') : expense.category ] = (acc[expense.date] || 0) + expense.amount;
        return acc;
    }, {});


    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };


    const categories = Object.keys(categoryTotals);

    const colors = categories.map(() => getRandomColor());

    const data = {
        labels : Object.keys(categoryTotals),
        datasets : [
            {
                label : 'Expense by category',
                data : Object.values(categoryTotals),
                backgroundColor : colors,
                hoverBackgroundColor: colors,
            }
        ]
    }
  return (
    <div>
        <div className='flex justify-end'>
        <select className='bg-[#c5c0c097] p-0.5 mb-2 rounded font-medium cursor-pointer text-center' 
        value={category} onChange={(e) => setCategory(e.target.value)} >
             <option value="category">By Category</option>
             <option value="date">By Date</option>
        </select>
        </div>
        <Pie className='cursor-pointer' data={data} />
        <span className='text-center flex justify-center font-medium capitalize'>Expenses by {category}</span>
    </div>
  )
}

export default PieChart