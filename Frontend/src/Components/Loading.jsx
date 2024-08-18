import React from 'react';
import loading from "../assets/expense-loading-unscreen.gif";

const Loading = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <img className='w-[250px] h-[250px] object-cover' src={loading} />
    </div>
  )
}

export default Loading