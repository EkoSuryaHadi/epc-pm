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
  Cell,
} from 'recharts';

interface BudgetVsActualData {
  name: string;
  budget: number;
  actual: number;
  variance: number;
}

interface BudgetVsActualChartProps {
  data: BudgetVsActualData[];
}

export function BudgetVsActualChart({ data }: BudgetVsActualChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Budget: ${payload[0].value.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Actual: ${payload[1].value.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t">
              <span className="font-medium">
                Variance: ${payload[0].payload.variance.toLocaleString()}
              </span>
              <span className={payload[0].payload.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                ({payload[0].payload.variance >= 0 ? '+' : ''}{((payload[0].payload.variance / payload[0].value) * 100).toFixed(1)}%)
              </span>
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
          <Bar
            dataKey="budget"
            fill="#3b82f6"
            name="Budget"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="actual"
            fill="#10b981"
            name="Actual"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
