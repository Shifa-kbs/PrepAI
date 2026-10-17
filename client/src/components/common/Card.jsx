import React from 'react';

const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/80 backdrop-blur-sm border border-slate-800/80 rounded-xl p-5 shadow-lg shadow-black/20 ${
        hover ? 'hover:border-slate-700 hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
