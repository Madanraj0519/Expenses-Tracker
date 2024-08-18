import react from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useDispatch, useSelector } from 'react-redux';

const ExportPDF = ({expenses}) => {

    const {currentUser} = useSelector(state => state.authUser);

    const exportPDF = () => {

        const doc = new jsPDF();

        doc.text(`${currentUser.user.userName}'s Expense Report`, 14, 22);
    
        const tableColumn = ['Date', 'Category', 'Description', 'Amount'];
        const tableRows = [];
    
        expenses.forEach((expense) => {
            const expenseData = [
                new Date(expense.date).toLocaleDateString(),
                expense.category, expense.description || '-',
                `$${expense.amount.toFixed(2)}`
            ];
            tableRows.push(expenseData);
        });
    
        doc.autoTable(tableColumn, tableRows, { startY : 30 });
    
        doc.save('expenses.pdf');
    }

    return (
        <>
          <button onClick={exportPDF} className="text-white">
            ExportPDF
          </button>
        </>
    )
}


export default ExportPDF;