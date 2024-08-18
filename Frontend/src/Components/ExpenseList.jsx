import React, {useState, useEffect} from 'react';
import axiosInstance from '../Constant/Backend/axiosInstance';

const ExpenseList = ({incomes, setIncomes}) => {

    // const [expenses, setExpenses] = useState([]);
    const [sortBy, setSortBy] = useState('');
    const [order, setOrder] = useState('asc');
    const [category, setCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');


    useEffect(() => {
        const fetchIncomes = async() => {
                try {
                  const res = await axiosInstance.get('/api/expense/getExpense', {
                    params: { sortBy, order, category, startDate, endDate, minAmount, maxAmount },
                  });
                //   console.log(res.data.expenses);
                  setIncomes(res.data.expenses);
                } catch (error) {
                  console.log(error);
                }
              };
          
              fetchIncomes();
      }, [sortBy, order, minAmount, maxAmount, startDate, endDate, category]);

    const uniqueCategory = (array) => {
      return Array.from(
        array.reduce((set, item) => set.add(item.category), new Set())
      )
    }

    const ListOfCategories = uniqueCategory(incomes);

  return (
  <div className='grid grid-cols-2 base:grid-cols-3 gap-3 mt-3'>        
   <select className='bg-[#ffffffcd] p-0.5 rounded font-medium ' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
    <option value="">Sort By</option>
    <option value="date">Date</option>
    <option value="amount">Amount</option>
    <option value="category">Category</option>
  </select>

  <select className='bg-[#ffffffcd] p-0.5 rounded font-medium' value={order} onChange={(e) => setOrder(e.target.value)}>
    <option value="asc">Ascending</option>
    <option value="desc">Descending</option>
  </select>

  <select className='bg-[#ffffffcd] p-0.5 rounded font-medium' value={category} onChange={(e) => setCategory(e.target.value)}>
    <option value="">Filter by Category</option>{
          ListOfCategories.map((item) => (
        <option value={item}>{item}</option>
      ))
    }
  </select>

  <div>
    <label>Start Date</label>
    <input className='bg-[#ffffffcd] p-0.5 rounded font-medium text-black w-full'
     type="date"
     value={startDate}
     onChange={(e) => setStartDate(e.target.value)}
     placeholder="Start Date"
    />
  </div>

  <div>
  <label>End Date</label>
  <input className='bg-[#ffffffcd] p-0.5 rounded font-medium text-black w-full'
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    placeholder="End Date"
  />
  </div>

  {/* <input className='bg-[#ffffffcd] p-0.5 rounded font-medium'
    type="number"
    value={minAmount}
    onChange={(e) => setMinAmount(e.target.value)}
    placeholder="Min Amount"
  />
  <input className='bg-[#ffffffcd] p-0.5 rounded font-medium'
    type="number"
    value={maxAmount}
    onChange={(e) => setMaxAmount(e.target.value)}
    placeholder="Max Amount"
  /> */}

</div>
  )
}

export default ExpenseList