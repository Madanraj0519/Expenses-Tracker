import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FaFilePdf } from "react-icons/fa6";

const ExportPDF = ({ expenses = [] }) => {
    const { currentUser } = useSelector(state => state.authUser);

    const exportPDF = () => {
        if (!expenses || expenses.length === 0) {
            toast.error("No expenses available to export.");
            return;
        }

        try {
            const doc = new jsPDF();
            const userName = currentUser?.user?.userName || currentUser?.userName || 'User';

            doc.setFontSize(16);
            doc.text(`${userName}'s Financial Expense Report`, 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 26);

            const tableColumn = ['Date', 'Category', 'Description', 'Amount'];
            const tableRows = [];

            expenses.forEach((expense) => {
                const expenseData = [
                    new Date(expense.date).toLocaleDateString(),
                    expense.category || '-',
                    expense.description || '-',
                    `$${Number(expense.amount).toFixed(2)}`
                ];
                tableRows.push(expenseData);
            });

            doc.autoTable(tableColumn, tableRows, { 
                startY: 32,
                headStyles: { fillColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [248, 250, 252] }
            });
            doc.save('expenses-report.pdf');
            toast.success("PDF report generated successfully!");
        } catch (err) {
            console.error("Export PDF error:", err);
            toast.error("Failed to generate PDF document.");
        }
    };

    return (
        <button 
            type="button"
            onClick={exportPDF} 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
            <FaFilePdf className="text-rose-500 text-sm" />
            <span>Export PDF</span>
        </button>
    );
};

export default ExportPDF;