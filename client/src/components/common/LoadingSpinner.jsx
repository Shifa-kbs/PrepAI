import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, label = 'Loading PrepAI...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        {label && <p className="text-sm font-medium text-slate-300 animate-pulse">{label}</p>}
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3 w-full">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      {label && <p className="text-xs font-medium text-slate-400">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
