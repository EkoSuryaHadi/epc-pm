'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { exportReportToCSV } from '@/lib/utils/export';

interface CriticalPathReportProps {
  projectId: string;
  projectName?: string;
}

export function CriticalPathReport({ projectId, projectName = 'project' }: CriticalPathReportProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.schedule.getCriticalPathReport(projectId);
        setData(response.data);
      } catch (error: any) {
        console.error('Error fetching critical path:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load critical path report',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  const handleExport = () => {
    if (data) {
      exportReportToCSV(data, 'critical-path', projectName);
      toast({
        title: 'Success',
        description: 'Critical path report exported to CSV',
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

  const riskColor = data.summary.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Critical Path Analysis</h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalTasks}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-600">Critical Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {data.summary.criticalTasksCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalDuration}</div>
            <div className="text-sm text-muted-foreground">days</div>
          </CardContent>
        </Card>

        <Card className={riskColor}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              <div className="text-2xl font-bold">{data.summary.riskLevel}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Path Info */}
      {data.summary.criticalPathStart && data.summary.criticalPathEnd && (
        <Card>
          <CardHeader>
            <CardTitle>Critical Path Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="text-lg font-semibold">
                  {format(new Date(data.summary.criticalPathStart), 'MMM dd, yyyy')}
                </div>
              </div>
              <div className="flex-1 h-2 bg-red-200 rounded-full" />
              <div>
                <div className="text-sm text-muted-foreground">End Date</div>
                <div className="text-lg font-semibold">
                  {format(new Date(data.summary.criticalPathEnd), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {data.criticalTasks.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>WBS Code</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.criticalTasks.map((task: any) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.taskName}</TableCell>
                      <TableCell>
                        {task.wbsCode ? (
                          <Badge variant="outline">{task.wbsCode}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(task.startDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(task.endDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-center">
                        {task.duration} days
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{task.progress}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No critical tasks found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Non-Critical Tasks Info */}
      {data.summary.nonCriticalTasksCount > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">
                {data.summary.nonCriticalTasksCount}
              </div>
              <div className="text-sm text-green-700 mt-1">
                Non-critical tasks with float time
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
