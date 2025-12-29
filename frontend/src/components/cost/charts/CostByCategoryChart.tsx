'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface CostByCategoryChartProps {
  data: CategoryData[];
}

const COLORS = {
  MATERIAL: '#3b82f6',    // blue
  LABOR: '#10b981',       // green
  EQUIPMENT: '#f59e0b',   // orange
  SUBCONTRACT: '#8b5cf6', // purple
  OVERHEAD: '#6b7280',    // gray
  OTHER: '#64748b',       // slate
};

export function CostByCategoryChart({ data }: CostByCategoryChartProps) {
  // Custom label
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div>Amount: ${data.value.toLocaleString()}</div>
            <div>Percentage: {data.percentage.toFixed(1)}%</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={130}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.OTHER}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
