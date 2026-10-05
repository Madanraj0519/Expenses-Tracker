import React from 'react';

const Loading = () => {
  return (
    <div className='flex flex-col items-center justify-center p-8 gap-3'>
      <div className='w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin' />
      <span className='text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse'>
        Loading data...
      </span>
    </div>
  );
};

export default Loading;