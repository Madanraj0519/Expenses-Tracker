import React from 'react';
import { saveAs } from 'file-saver';


const ExportCSV = ({expenses}) => {

    const convertToCSV = (data) => {
        const array = [Object.keys(data[0])].concat(data);

        return array.map((row) => {
            return Object.values(row).map((value) => `"${value}"`).join(',');
        }).join('\n');
    }


    const exportCSV = () => {
        const csvData = convertToCSV(expenses);
        const blob = new Blob([csvData], { type : 'text/csv;charset=utf-8;' });
        saveAs(blob, 'expenses.csv');
    }


    return (
        <>
         <button className="text-white bg-[#090e3dc7]" onClick={exportCSV}>
           ExportCSV
         </button>
        </>
    )
};


export default ExportCSV;