import React from 'react';

const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-sky-100 rounded-xl p-5 shadow-sm text-slate-800 ${
        hover ? 'hover:border-sky-300 hover:shadow-md hover:translate-y-[-1px] transition-all cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
