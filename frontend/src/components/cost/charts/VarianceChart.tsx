'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

interface VarianceData {
  name: string;
  variance: number;
  variancePercent: number;
}

interface VarianceChartProps {
  data: VarianceData[];
}

export function VarianceChart({ data }: VarianceChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isPositive = item.variance >= 0;
      
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{item.name}</p>
          <div className="space-y-1 text-sm">
            <div className={isPositive ? 'text-green-600' : 'text-red-600'}>
              Variance: ${Math.abs(item.variance).toLocaleString()}
            </div>
            <div className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? 'Under' : 'Over'} Budget: {Math.abs(item.variancePercent).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground pt-1 border-t">
              {isPositive ? '✓ Within budget' : '⚠ Exceeds budget'}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Bar
            dataKey="variance"
            name="Variance (Budget - Actual)"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.variance >= 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend explanation */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded"></span>
          Positive = Under budget
        </span>
        <span className="mx-2">|</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded"></span>
          Negative = Over budget
        </span>
      </div>
    </div>
  );
}
