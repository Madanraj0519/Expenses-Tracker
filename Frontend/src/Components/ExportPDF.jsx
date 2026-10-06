import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FaFilePdf } from "react-icons/fa6";
import { useCurrency } from '../Context/CurrencyContext';

const ExportPDF = ({ transactions = [], month, disabled = false }) => {
    const { currentUser } = useSelector(state => state.authUser);
    const { currency, convertFromBase } = useCurrency();

    const exportPDF = () => {
        if (!transactions || transactions.length === 0) {
            toast.error("No transactions available to export for this month.");
            return;
        }

        try {
            const doc = new jsPDF();
            const userName = currentUser?.user?.userName || currentUser?.userName || 'User';

            doc.setFontSize(16);
            doc.text(`${userName}'s Financial Report${month ? ` - ${month}` : ''}`, 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 26);

            const tableColumn = ['Type', 'Date', 'Category', 'Description', `Amount (${currency})`];
            const tableRows = [];

            transactions.forEach((transaction) => {
                const transactionData = [
                    transaction.type || '-',
                    new Date(transaction.date).toLocaleDateString(),
                    transaction.category || '-',
                    transaction.description || '-',
                    `${currency} ${convertFromBase(transaction.amount).toLocaleString('en-US', {
                        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
                        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
                    })}`
                ];
                tableRows.push(transactionData);
            });

            doc.autoTable(tableColumn, tableRows, { 
                startY: 32,
                headStyles: { fillColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [248, 250, 252] }
            });
            doc.save(`financial-report-${month || 'all'}.pdf`);
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
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
            <FaFilePdf className="text-rose-500 text-sm" />
            <span>Export PDF</span>
        </button>
    );
};

export default ExportPDF;