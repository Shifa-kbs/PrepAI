import React from 'react';
import { Layers } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Layers,
  title = 'No Data Available',
  description = 'There are no items to show right now.',
  actionText,
  onAction,
}) => {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
      <div className="p-3 bg-slate-800/60 rounded-full text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
