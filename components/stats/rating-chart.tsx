'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RatingChartProps {
  data: { rating: number; count: number }[];
}

const RATING_COLORS = [
  'hsl(0, 70%, 50%)',    // 1 star - red
  'hsl(30, 80%, 50%)',   // 2 stars - orange
  'hsl(45, 90%, 50%)',   // 3 stars - yellow
  'hsl(90, 60%, 45%)',   // 4 stars - light green
  'hsl(120, 60%, 40%)',  // 5 stars - green
];

export function RatingChart({ data }: RatingChartProps) {
  const chartData = data.map((item) => ({
    name: `${item.rating} ★`,
    rating: item.rating,
    count: item.count,
  }));
  
  const totalRatings = data.reduce((sum, d) => sum + d.count, 0);
  
  if (totalRatings === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        No rating data available
      </div>
    );
  }
  
  return (
    <div className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" barCategoryGap="15%">
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={50}
            tick={{ fontSize: 14 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} books`, 'Count']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={RATING_COLORS[entry.rating - 1]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

