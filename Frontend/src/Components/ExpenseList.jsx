import React, { useState, useEffect } from 'react';
import axiosInstance from '../Constant/Backend/axiosInstance';
import { toast } from 'react-hot-toast';

const ExpenseList = ({ incomes = [], setIncomes, pagination, setPagination, refreshKey }) => {
    const [sortBy, setSortBy] = useState('');
    const [order, setOrder] = useState('desc');
    const [category, setCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        let isMounted = true;

        const fetchExpenses = async () => {
            try {
                const res = await axiosInstance.get('/api/expense/getExpense', {
                    params: { sortBy, order, category, startDate, endDate, search, page, limit: 10 },
                });
                if (isMounted && res.data && res.data.expenses) {
                    const totalPages = res.data.pagination?.totalPages || 0;
                    if (page > Math.max(1, totalPages)) {
                        setPage(Math.max(1, totalPages));
                        return;
                    }
                    setIncomes(res.data.expenses);
                    setPagination({ ...res.data.pagination, categories: res.data.categories || [] });
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
    }, [sortBy, order, startDate, endDate, category, search, page, setIncomes, setPagination, refreshKey]);

    useEffect(() => {
        setPage(1);
    }, [sortBy, order, startDate, endDate, category, search]);

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

    const ListOfCategories = pagination?.categories || uniqueCategory(incomes);

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

            <input
                className='col-span-2 sm:col-span-3 md:col-span-5 bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 p-2 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-blue-500'
                type="search"
                aria-label="Search expense category or description"
                placeholder="Search category or description"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            <div>
                <input
                    className='bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 p-2 rounded-xl font-medium w-full focus:outline-none focus:ring-1 focus:ring-blue-500'
                    type="date"
                    title="To Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="col-span-2 sm:col-span-3 md:col-span-5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} expenses</span>
                    <div className="flex gap-2">
                        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 disabled:opacity-40">Previous</button>
                        <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 disabled:opacity-40">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;