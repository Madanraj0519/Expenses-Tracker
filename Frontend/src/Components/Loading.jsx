import React from 'react';
import loading from "../assets/expense-loading-unscreen.gif";

const Loading = () => {
  return (
    <div>
      <img className='w-[250px] h-[250px] object-cover' src={loading} />
    </div>
  )
}

export default Loading