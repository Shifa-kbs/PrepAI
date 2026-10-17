import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start space-x-2 text-rose-300 text-xs ${className}`}>
      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
