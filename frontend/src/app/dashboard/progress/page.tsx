'use client';

import { InfoPageTemplate } from '@/components/ui/info-page-template';
import { TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  return (
    <InfoPageTemplate
      title="Progress Tracking"
      description="Monitor project progress and earned value performance"
      icon={TrendingUp}
      gradient="purple"
      features={[
        "Physical progress tracking by WBS",
        "Earned Value Management (EVM) metrics",
        "S-Curve analysis (PV vs EV vs AC)",
        "Performance indicators (CPI, SPI, CV, SV)",
        "Progress reports and forecasting",
        "Variance analysis and trends",
        "Real-time progress updates"
      ]}
    />
  );
}
