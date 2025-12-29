'use client';

import { InfoPageTemplate } from '@/components/ui/info-page-template';
import { AlertTriangle } from 'lucide-react';

export default function RisksPage() {
  return (
    <InfoPageTemplate
      title="Risk Management"
      description="Comprehensive risk assessment and mitigation tracking"
      icon={AlertTriangle}
      gradient="pink"
      features={[
        "Risk register and identification",
        "5×5 Risk matrix visualization",
        "Risk scoring (Probability × Impact)",
        "Mitigation strategies and action plans",
        "Change order management workflow",
        "Risk trend analysis and reporting",
        "Critical risk monitoring and alerts"
      ]}
    />
  );
}
