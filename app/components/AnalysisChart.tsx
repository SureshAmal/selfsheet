'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDaysInMonth, format, isAfter, parseISO, startOfDay } from 'date-fns';

interface ProtocolLog {
  id: string;
  protocolId: string;
  date: string;
  status: boolean;
}

interface AnalysisChartProps {
  currentDate: Date;
  logs: ProtocolLog[];
  totalProtocols: number;
}

export function AnalysisChart({ currentDate, logs, totalProtocols }: AnalysisChartProps) {
  const data = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const monthPrefix = format(currentDate, 'yyyy-MM');
    const dayData = [];

    const today = startOfDay(new Date());

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${monthPrefix}-${day.toString().padStart(2, '0')}`;
      const cellDate = parseISO(dateStr);
      
      let completedCount: number | null = null;
      if (!isAfter(cellDate, today)) {
        completedCount = logs.filter(l => l.date === dateStr && l.status).length;
      }

      dayData.push({
        day: day.toString(),
        completed: completedCount
      });
    }
    return dayData;
  }, [currentDate, logs]);

  const yDomainMax = totalProtocols > 0 ? totalProtocols : 13;
  const yTicks = Array.from({ length: yDomainMax + 1 }, (_, i) => i);

  return (
    <div className="analysis-container glass-panel">
      <h3>Analysis</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis 
               dataKey="day" 
               stroke="var(--text-secondary)" 
               fontSize={12} 
               tickLine={false} 
               axisLine={false} 
               padding={{ left: 15, right: 15 }} 
            />
            <YAxis 
              domain={[0, yDomainMax]} 
              ticks={yTicks}
              stroke="var(--text-secondary)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="var(--accent-color)" 
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--bg-primary)', stroke: 'var(--accent-color)', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
