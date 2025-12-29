'use client';

import { reportTypes, reportTypeLabels, reportTypeDescriptions } from '@/lib/validations/report';
import { Card } from '@/components/ui/card';
import { FileText, DollarSign, Calendar, AlertTriangle, FileBarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

const reportIcons = {
  PROGRESS: FileText,
  COST: DollarSign,
  SCHEDULE: Calendar,
  RISK: AlertTriangle,
  COMPREHENSIVE: FileBarChart,
};

const reportColors = {
  PROGRESS: 'bg-blue-100 text-blue-700 border-blue-300',
  COST: 'bg-green-100 text-green-700 border-green-300',
  SCHEDULE: 'bg-purple-100 text-purple-700 border-purple-300',
  RISK: 'bg-red-100 text-red-700 border-red-300',
  COMPREHENSIVE: 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

interface ReportTypeSelectorProps {
  value: typeof reportTypes[number];
  onChange: (type: typeof reportTypes[number]) => void;
}

export function ReportTypeSelector({ value, onChange }: ReportTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportTypes.map((type) => {
        const Icon = reportIcons[type];
        const isSelected = value === type;
        
        return (
          <Card
            key={type}
            className={cn(
              'p-4 cursor-pointer transition-all hover:shadow-md',
              isSelected && 'ring-2 ring-primary'
            )}
            onClick={() => onChange(type)}
          >
            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-lg', reportColors[type])}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{reportTypeLabels[type]}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportTypeDescriptions[type]}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
