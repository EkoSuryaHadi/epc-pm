'use client';

import { InfoPageTemplate } from '@/components/ui/info-page-template';
import { Calendar } from 'lucide-react';

export default function SchedulePage() {
  return (
    <InfoPageTemplate
      title="Schedule Management"
      description="Advanced scheduling and timeline management for your projects"
      icon={Calendar}
      gradient="blue"
      features={[
        "Interactive Gantt chart visualization",
        "Task dependencies and critical path",
        "Milestone tracking and achievements",
        "Schedule baseline comparison",
        "Variance analysis (Schedule Performance)",
        "Resource allocation planning",
        "Schedule performance reports"
      ]}
    />
  );
}
