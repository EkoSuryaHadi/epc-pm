'use client';

import { InfoPageTemplate } from '@/components/ui/info-page-template';
import { DollarSign } from 'lucide-react';

export default function CostControlPage() {
  return (
    <InfoPageTemplate
      title="Cost Control"
      description="Comprehensive cost management across all your projects"
      icon={DollarSign}
      gradient="green"
      features={[
        "Budget allocation and tracking by cost codes",
        "Actual vs planned cost analysis",
        "Cost variance reports and forecasting",
        "Expense entry management",
        "Cost performance indicators (CPI, CV)",
        "Category-wise budget breakdown",
        "Cost trend analysis and charts"
      ]}
    />
  );
}
