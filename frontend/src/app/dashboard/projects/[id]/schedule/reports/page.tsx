'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryReport } from '@/components/schedule/reports/SummaryReport';
import { CriticalPathReport } from '@/components/schedule/reports/CriticalPathReport';
import { PerformanceReport } from '@/components/schedule/reports/PerformanceReport';
import { CompletionReport } from '@/components/schedule/reports/CompletionReport';
import { createApiMethods } from '@/lib/api-client';

export default function ScheduleReportsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const projectId = params.id as string;
  
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!session?.user?.accessToken || !projectId) return;

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.projects.getById(projectId);
        setProjectName(response.data.name);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [session, projectId]);

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/dashboard/projects" className="hover:text-gray-900">
            Projects
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="hover:text-gray-900"
          >
            {projectName || 'Project'}
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/projects/${projectId}/schedule`}
            className="hover:text-gray-900"
          >
            Schedule
          </Link>
          <span>/</span>
          <span className="text-gray-900">Reports</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Schedule Reports
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyze schedule performance and identify trends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="critical">Critical Path</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <SummaryReport projectId={projectId} projectName={projectName} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceReport projectId={projectId} projectName={projectName} />
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <CriticalPathReport projectId={projectId} projectName={projectName} />
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <CompletionReport projectId={projectId} projectName={projectName} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
