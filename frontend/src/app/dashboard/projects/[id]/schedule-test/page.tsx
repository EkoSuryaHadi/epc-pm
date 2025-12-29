'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ScheduleTestPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold">Schedule Test Page</h1>
      <p className="mt-4">Project ID: {projectId}</p>
      <Button className="mt-4">Test Button</Button>
      <p className="mt-4 text-green-600">✅ If you can see this, routing works!</p>
    </div>
  );
}
