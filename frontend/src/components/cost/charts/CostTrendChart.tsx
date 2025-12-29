'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface TrendData {
  date: string;
  budget: number;
  actual: number;
  forecast: number;
  commitment: number;
}

interface CostTrendChartProps {
  data: TrendData[];
}

export function CostTrendChart({ data }: CostTrendChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span>
                  {entry.name}: ${entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="budget"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Budget"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            name="Actual"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Forecast"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="commitment"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Commitment"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
