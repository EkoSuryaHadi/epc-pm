'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Download, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { exportReportToCSV } from '@/lib/utils/export';

interface SummaryReportProps {
  projectId: string;
  projectName?: string;
}

export function SummaryReport({ projectId, projectName = 'project' }: SummaryReportProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.schedule.getScheduleSummary(projectId);
        setData(response.data);
      } catch (error: any) {
        console.error('Error fetching summary:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load schedule summary',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  const handleExport = () => {
    if (data) {
      exportReportToCSV(data, 'summary', projectName);
      toast({
        title: 'Success',
        description: 'Summary report exported to CSV',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12">No data available</div>;
  }

  const healthColor =
    data.health.color === 'green'
      ? 'text-green-600 bg-green-50'
      : data.health.color === 'yellow'
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-red-600 bg-red-50';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule Summary</h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Health Score Card */}
      <Card className={healthColor}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.health.score >= 80 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            Schedule Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold">{data.health.score}</div>
          <div className="text-xl font-semibold mt-2">{data.health.status}</div>
        </CardContent>
      </Card>

      {/* Task Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Task Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.tasks.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {data.tasks.completed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {data.tasks.inProgress}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Not Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">
                {data.tasks.notStarted}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-600">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {data.tasks.overdue}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-600">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {data.tasks.critical}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Milestone Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Milestones</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.milestones.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Achieved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {data.milestones.achieved}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {data.milestones.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Delayed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {data.milestones.delayed}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Baselines */}
      <Card>
        <CardHeader>
          <CardTitle>Baselines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Baselines</div>
              <div className="text-2xl font-bold">{data.baselines.total}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Active Baseline</div>
              <div className="text-lg font-semibold">
                {data.baselines.active !== 'None' ? (
                  <Badge className="bg-green-100 text-green-800">
                    {data.baselines.active}
                  </Badge>
                ) : (
                  <Badge variant="secondary">None</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {(data.tasks.overdue > 0 || data.health.score < 80) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <ul className="list-disc list-inside space-y-1">
              {data.tasks.overdue > 0 && (
                <li>{data.tasks.overdue} task(s) are overdue</li>
              )}
              {data.health.score < 80 && data.health.score >= 60 && (
                <li>Schedule health is at risk - review critical tasks</li>
              )}
              {data.health.score < 60 && (
                <li>Schedule health is critical - immediate action needed</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
