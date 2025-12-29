'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, BarChart3, Download } from 'lucide-react';

import { EVMDashboard } from '@/components/progress/EVMDashboard';
import { SCurveChart } from '@/components/progress/SCurveChart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { EVMMetrics, SCurveDataPoint } from '@/lib/validations/progress';

export default function EVMPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [evmData, setEvmData] = useState<EVMMetrics | null>(null);
  const [sCurveData, setSCurveData] = useState<SCurveDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [projectCurrency, setProjectCurrency] = useState('USD');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken || !projectId) {
        setLoading(false);
        return;
      }

      try {
        const api = createApiMethods(session.user.accessToken);

        // Fetch project info
        const projectRes = await api.projects.getById(projectId);
        setProjectName(projectRes.data.name);
        setProjectCurrency(projectRes.data.currency || 'USD');

        // Fetch EVM metrics
        const evmRes = await api.progress.getEVM(projectId);
        setEvmData(evmRes.data);

        // Fetch S-Curve data
        const sCurveRes = await api.progress.getSCurve(projectId);
        setSCurveData(sCurveRes.data);
      } catch (error: any) {
        console.error('Error fetching EVM data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load EVM metrics',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: 'Export',
      description: 'Export functionality coming soon',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading EVM data...</p>
        </div>
      </div>
    );
  }

  if (!evmData) {
    return (
      <div className="container max-w-7xl py-6">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No EVM Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Create progress updates and cost entries to see Earned Value Management metrics
          </p>
          <Link href={`/dashboard/projects/${projectId}/progress`}>
            <Button>Go to Progress Tracking</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <span className="text-gray-900">EVM Dashboard</span>
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
                Earned Value Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Track cost and schedule performance using EVM metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/projects/${projectId}/progress`}>
              <Button variant="outline">Progress Updates</Button>
            </Link>
            <Link href={`/dashboard/projects/${projectId}/kpi`}>
              <Button variant="outline">KPI Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* EVM Metrics Dashboard */}
      <EVMDashboard data={evmData} currency={projectCurrency} />

      {/* S-Curve Chart */}
      <SCurveChart data={sCurveData} currency={projectCurrency} />
    </div>
  );
}
