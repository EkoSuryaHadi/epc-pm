'use client';

import { useState } from 'react';
import { Risk, getRiskLevel } from '@/lib/validations/risk';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RiskMatrixChartProps {
  risks: Risk[];
}

export function RiskMatrixChart({ risks }: RiskMatrixChartProps) {
  // Group risks by probability and impact
  const matrix: { [key: string]: Risk[] } = {};
  
  risks.forEach((risk) => {
    const key = `${risk.probability}-${risk.impact}`;
    if (!matrix[key]) {
      matrix[key] = [];
    }
    matrix[key].push(risk);
  });

  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Matrix colors based on risk score
  const getCellColor = (probability: number, impact: number): string => {
    const score = probability * impact;
    const level = getRiskLevel(score);
    
    const colorMap: Record<string, string> = {
      red: 'bg-red-100 hover:bg-red-200 border-red-300',
      orange: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
      yellow: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
      blue: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
      green: 'bg-green-100 hover:bg-green-200 border-green-300',
    };
    
    return colorMap[level.color] || 'bg-gray-50';
  };

  const probabilityLabels = [
    { value: 5, label: 'Very High' },
    { value: 4, label: 'High' },
    { value: 3, label: 'Medium' },
    { value: 2, label: 'Low' },
    { value: 1, label: 'Very Low' },
  ];

  const impactLabels = [
    { value: 1, label: 'Insignificant' },
    { value: 2, label: 'Minor' },
    { value: 3, label: 'Moderate' },
    { value: 4, label: 'Major' },
    { value: 5, label: 'Catastrophic' },
  ];

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Risk Level:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
          <span className="text-sm">Very Low (1-4)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
          <span className="text-sm">Low (5-9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
          <span className="text-sm">Medium (10-14)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-200 border border-orange-400 rounded"></div>
          <span className="text-sm">High (15-19)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
          <span className="text-sm">Extreme (20-25)</span>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-32 p-2 text-xs font-medium text-gray-600"></th>
                {impactLabels.map((impact) => (
                  <th key={impact.value} className="p-2 text-xs font-medium text-gray-700 text-center">
                    <div>{impact.value}</div>
                    <div className="text-[10px] text-gray-500 font-normal">{impact.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {probabilityLabels.map((probability) => (
                <tr key={probability.value}>
                  <td className="p-2 text-xs font-medium text-gray-700">
                    <div className="text-right">
                      <div>{probability.value}</div>
                      <div className="text-[10px] text-gray-500 font-normal">{probability.label}</div>
                    </div>
                  </td>
                  {impactLabels.map((impact) => {
                    const key = `${probability.value}-${impact.value}`;
                    const cellRisks = matrix[key] || [];
                    const score = probability.value * impact.value;
                    const cellColor = getCellColor(probability.value, impact.value);

                    return (
                      <td key={key} className="p-1">
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredCell(key)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <Card
                            className={`h-24 w-full ${cellColor} border-2 cursor-pointer transition-all hover:scale-105 flex flex-col items-center justify-center p-2`}
                          >
                            <div className="text-lg font-bold text-gray-700">{score}</div>
                            {cellRisks.length > 0 && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {cellRisks.length} risk{cellRisks.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </Card>
                          
                          {/* Tooltip on hover */}
                          {hoveredCell === key && cellRisks.length > 0 && (
                            <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
                              <div className="space-y-2">
                                <p className="font-semibold">
                                  {cellRisks.length} Risk{cellRisks.length > 1 ? 's' : ''} (Score: {score})
                                </p>
                                <div className="space-y-1">
                                  {cellRisks.slice(0, 5).map((risk) => (
                                    <div key={risk.id}>
                                      • {risk.title}
                                    </div>
                                  ))}
                                  {cellRisks.length > 5 && (
                                    <div className="text-gray-400">
                                      +{cellRisks.length - 5} more...
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Arrow */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Axis Labels */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-center">
              <div className="text-sm font-medium text-gray-700">
                IMPACT →
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-700 -rotate-90 origin-center absolute left-0 transform -translate-x-8">
                ← PROBABILITY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        {[
          { label: 'Very Low', color: 'green', count: risks.filter(r => r.riskScore <= 4).length },
          { label: 'Low', color: 'blue', count: risks.filter(r => r.riskScore >= 5 && r.riskScore <= 9).length },
          { label: 'Medium', color: 'yellow', count: risks.filter(r => r.riskScore >= 10 && r.riskScore <= 14).length },
          { label: 'High', color: 'orange', count: risks.filter(r => r.riskScore >= 15 && r.riskScore <= 19).length },
          { label: 'Extreme', color: 'red', count: risks.filter(r => r.riskScore >= 20).length },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-sm text-gray-600">{stat.label} Risk</div>
            <div className={`text-3xl font-bold text-${stat.color}-600`}>{stat.count}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
