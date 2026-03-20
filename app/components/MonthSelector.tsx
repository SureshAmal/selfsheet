'use client';

import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  currentDate: Date;
  onChange: (d: Date) => void;
}

export function MonthSelector({ currentDate, onChange }: MonthSelectorProps) {
  return (
    <div className="month-selector">
      <button onClick={() => onChange(subMonths(currentDate, 1))} className="icon-btn">
        <ChevronLeft size={20} />
      </button>
      <div className="month-display">
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
      </div>
      <button onClick={() => onChange(addMonths(currentDate, 1))} className="icon-btn">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
