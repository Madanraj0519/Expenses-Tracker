import React from 'react'
import DashboardChart from '../Components/DashboardChart'
import Income from '../Components/Income'
import Expense from '../Components/Expense'

const DashboardRight = ({active}) => {
  return (
    <div className='w-full h-full bg-[#e4e4f8df] rounded-[15px]'>
      {
        active === 1 && (
          <DashboardChart />
        )
      }
      {
        active === 2 && (
          <Income />
        )
      }

      {
        active === 3 && (
          <Expense />
        )
      }
    </div>
  )
}

export default DashboardRight