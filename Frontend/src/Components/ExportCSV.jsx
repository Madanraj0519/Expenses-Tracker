import React from 'react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import { FaFileCsv } from "react-icons/fa6";
import { useCurrency } from '../Context/CurrencyContext';

const escapeCell = (value) => {
    const text = String(value ?? '');
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
};

const ExportCSV = ({ transactions = [], month, disabled = false }) => {
    const { currency, convertFromBase } = useCurrency();
    const exportCSV = () => {
        if (!transactions || transactions.length === 0) {
            toast.error("No transactions available to export for this month.");
            return;
        }

        try {
            const headers = ['Type', 'Date', 'Category', 'Description', `Amount (${currency})`];
            const rows = transactions.map(transaction => [
                transaction.type,
                new Date(transaction.date).toLocaleDateString(),
                transaction.category || '',
                transaction.description || '',
                convertFromBase(transaction.amount).toFixed(currency === 'JPY' ? 0 : 2),
            ].map(escapeCell));

            const csvContent = [headers.map(escapeCell).join(','), ...rows.map(r => r.join(','))].join('\r\n');
            const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `financial-report-${month || 'all'}.csv`);
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
            disabled={disabled}
        >
            <FaFileCsv className="text-emerald-500 text-sm" />
            <span>Export CSV</span>
        </button>
    );
};

export default ExportCSV;