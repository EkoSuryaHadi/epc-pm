'use client';

import { InfoPageTemplate } from '@/components/ui/info-page-template';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <InfoPageTemplate
      title="Document Management"
      description="Centralized document repository with version control"
      icon={FileText}
      gradient="orange"
      features={[
        "Document upload and secure storage",
        "Version control and history tracking",
        "Document categories and disciplines",
        "Status workflow (Draft, Review, Approved)",
        "Comments and review system",
        "File type support (PDF, DOC, XLS, CAD)",
        "Search and filter capabilities"
      ]}
    />
  );
}
