'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineChartProps {
  data: { year: number; count: number }[] | { month: string; count: number }[];
  type?: 'yearly' | 'monthly';
}

export function TimelineChart({ data, type = 'yearly' }: TimelineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        No timeline data available
      </div>
    );
  }
  
  const chartData = data.map((item) => ({
    name: type === 'yearly' ? (item as { year: number }).year : (item as { month: string }).month,
    books: (item as { count: number }).count,
  }));
  
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} books`, 'Read']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="books"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#colorBooks)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

