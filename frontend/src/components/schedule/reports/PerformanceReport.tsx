'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { exportReportToCSV } from '@/lib/utils/export';

interface PerformanceReportProps {
  projectId: string;
  projectName?: string;
}

export function PerformanceReport({ projectId, projectName = 'project' }: PerformanceReportProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.schedule.getPerformanceReport(projectId);
        setData(response.data);
      } catch (error: any) {
        console.error('Error fetching performance:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load performance report',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  const handleExport = () => {
    if (data) {
      exportReportToCSV(data, 'performance', projectName);
      toast({
        title: 'Success',
        description: 'Performance report exported to CSV',
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

  const summary = data.summary;
  const spiColor =
    summary.spi >= 1
      ? 'text-green-600'
      : summary.spi >= 0.9
      ? 'text-yellow-600'
      : 'text-red-600';

  const spiIcon =
    summary.spi >= 1 ? TrendingUp : summary.spi >= 0.9 ? Minus : TrendingDown;
  const SpiIcon = spiIcon;

  const statusColor =
    summary.status === 'On Track'
      ? 'bg-green-100 text-green-800'
      : summary.status === 'At Risk'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule Performance</h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SPI Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Schedule Performance Index (SPI)
              <SpiIcon className={`h-5 w-5 ${spiColor}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-5xl font-bold ${spiColor}`}>
              {summary.spi.toFixed(2)}
            </div>
            <Badge className={`mt-2 ${statusColor}`}>{summary.status}</Badge>
            <div className="text-xs text-muted-foreground mt-2">
              {summary.spi >= 1 ? 'Ahead of schedule' : 'Behind schedule'}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Variance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Schedule Variance (SV)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-4xl font-bold ${
                summary.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {summary.scheduleVariance >= 0 ? '+' : ''}
              {summary.scheduleVariance.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {summary.scheduleVariance >= 0 ? 'days ahead' : 'days behind'}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Earned Value:</span>
                <span className="font-semibold">{summary.earnedValue.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Planned Value:</span>
                <span className="font-semibold">{summary.plannedValue.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Actual Progress</span>
                  <span className="text-sm font-bold">{summary.overallProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${summary.overallProgress}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Planned Progress</span>
                  <span className="text-sm font-bold">{summary.plannedProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gray-400 h-3 rounded-full transition-all"
                    style={{ width: `${summary.plannedProgress}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Variance:</span>
                <span
                  className={`text-sm font-bold ${
                    summary.progressVariance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {summary.progressVariance >= 0 ? '+' : ''}
                  {summary.progressVariance.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-600">
                {data.status.notStarted}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Not Started</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (data.status.notStarted /
                        (data.status.notStarted +
                          data.status.inProgress +
                          data.status.completed)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {data.status.inProgress}
              </div>
              <div className="text-sm text-muted-foreground mt-1">In Progress</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (data.status.inProgress /
                        (data.status.notStarted +
                          data.status.inProgress +
                          data.status.completed)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {data.status.completed}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Completed</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (data.status.completed /
                        (data.status.notStarted +
                          data.status.inProgress +
                          data.status.completed)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">{data.status.overdue}</div>
              <div className="text-sm text-muted-foreground mt-1">Overdue</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (data.status.overdue /
                        (data.status.notStarted +
                          data.status.inProgress +
                          data.status.completed)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Dates */}
      {data.dates && (
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Project Start</div>
                <div className="text-lg font-semibold">
                  {format(new Date(data.dates.projectStart), 'MMM dd, yyyy')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Date</div>
                <div className="text-lg font-semibold">
                  {format(new Date(data.dates.currentDate), 'MMM dd, yyyy')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Project End</div>
                <div className="text-lg font-semibold">
                  {format(new Date(data.dates.projectEnd), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
