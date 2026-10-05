import React from 'react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import { FaFileCsv } from "react-icons/fa6";

const ExportCSV = ({ expenses = [] }) => {
    const exportCSV = () => {
        if (!expenses || expenses.length === 0) {
            toast.error("No expenses available to export.");
            return;
        }

        try {
            const headers = ['Date', 'Category', 'Description', 'Amount'];
            const rows = expenses.map(expense => [
                `"${new Date(expense.date).toLocaleDateString()}"`,
                `"${(expense.category || '').replace(/"/g, '""')}"`,
                `"${(expense.description || '').replace(/"/g, '""')}"`,
                `"${Number(expense.amount).toFixed(2)}"`
            ]);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'expenses.csv');
            toast.success("CSV exported successfully!");
        } catch (err) {
            console.error("Export CSV error:", err);
            toast.error("Failed to generate CSV file.");
        }
    };

    return (
        <button 
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer" 
            onClick={exportCSV}
        >
            <FaFileCsv className="text-emerald-500 text-sm" />
            <span>Export CSV</span>
        </button>
    );
};

export default ExportCSV;