import React, { useState, useEffect } from 'react';
import axiosInstance from '../Constant/Backend/axiosInstance';
import { toast } from 'react-hot-toast';

const ExpenseList = ({ incomes = [], setIncomes }) => {
    const [sortBy, setSortBy] = useState('');
    const [order, setOrder] = useState('asc');
    const [category, setCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchExpenses = async () => {
            try {
                const res = await axiosInstance.get('/api/expense/getExpense', {
                    params: { sortBy, order, category, startDate, endDate },
                });
                if (isMounted && res.data && res.data.expenses) {
                    setIncomes(res.data.expenses);
                }
            } catch (error) {
                console.error("Failed to filter expenses:", error);
                const msg = error.friendlyMessage || "Failed to load filtered expenses.";
                toast.error(msg);
            }
        };

        fetchExpenses();

        return () => {
            isMounted = false;
        };
    }, [sortBy, order, startDate, endDate, category, setIncomes]);

    const uniqueCategory = (array) => {
        if (!Array.isArray(array)) return [];
        return Array.from(
            array.reduce((set, item) => {
                if (item && item.category) {
                    set.add(item.category);
                }
                return set;
            }, new Set())
        );
    };

    const ListOfCategories = uniqueCategory(incomes);

    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3 text-xs'>
            <select
                className='bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 p-2 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
            >
                <option value="">Sort By</option>
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
            </select>

            <select
                className='bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 p-2 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
                value={order}
                onChange={(e) => setOrder(e.target.value)}
            >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>

            <select
                className='bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 p-2 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="">All Categories</option>
                {ListOfCategories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                ))}
            </select>

            <div>
                <input
                    className='bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 p-2 rounded-xl font-medium w-full focus:outline-none focus:ring-1 focus:ring-blue-500'
                    type="date"
                    title="From Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>

            <div>
                <input
                    className='bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 p-2 rounded-xl font-medium w-full focus:outline-none focus:ring-1 focus:ring-blue-500'
                    type="date"
                    title="To Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
        </div>
    );
};

export default ExpenseList;