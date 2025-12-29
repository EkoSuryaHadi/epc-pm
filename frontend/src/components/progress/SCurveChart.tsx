'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SCurveDataPoint, formatCurrency } from '@/lib/validations/progress';
import { format } from 'date-fns';

interface SCurveChartProps {
  data: SCurveDataPoint[];
  currency?: string;
}

export function SCurveChart({ data, currency = 'USD' }: SCurveChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>S-Curve: Planned vs Actual Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No progress data available yet. Create progress updates to see the S-curve.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart with date validation
  const chartData = data
    .filter((point) => point.date) // Filter out null/undefined dates
    .map((point) => {
      try {
        const dateObj = new Date(point.date);
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
          console.warn('Invalid date:', point.date);
          return null;
        }
        return {
          date: format(dateObj, 'MMM dd'),
          fullDate: point.date,
          plannedValue: point.plannedValue || 0,
          earnedValue: point.earnedValue || 0,
        };
      } catch (error) {
        console.warn('Error parsing date:', point.date, error);
        return null;
      }
    })
    .filter((point) => point !== null) as any[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>S-Curve: Planned vs Actual Progress</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Cumulative planned value and earned value over time
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, currency)}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value, currency), '']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="plannedValue"
              stroke="#9ca3af"
              strokeWidth={2}
              name="Planned Value (PV)"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="earnedValue"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Earned Value (EV)"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend Description */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded mt-0.5"></div>
            <div>
              <div className="font-medium">Planned Value (PV)</div>
              <div className="text-muted-foreground">
                Expected progress value based on the project plan
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded mt-0.5"></div>
            <div>
              <div className="font-medium">Earned Value (EV)</div>
              <div className="text-muted-foreground">
                Actual value of work completed based on progress updates
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
