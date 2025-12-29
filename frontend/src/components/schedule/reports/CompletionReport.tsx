'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Download, Calendar } from 'lucide-react';
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

interface CompletionReportProps {
  projectId: string;
  projectName?: string;
}

export function CompletionReport({ projectId, projectName = 'project' }: CompletionReportProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.schedule.getCompletionReport(projectId);
        setData(response.data);
      } catch (error: any) {
        console.error('Error fetching completion:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load completion report',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  const handleExport = () => {
    if (data) {
      exportReportToCSV(data, 'completion', projectName);
      toast({
        title: 'Success',
        description: 'Completion report exported to CSV',
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

  const completionColor =
    data.summary.completionRate >= 75
      ? 'text-green-600'
      : data.summary.completionRate >= 50
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Completion Analysis</h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {data.summary.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {data.summary.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {data.summary.notStarted}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {data.summary.overdue}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${completionColor}`}>
              {data.summary.completionRate.toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.avgDuration.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-2xl font-bold">{data.summary.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={`h-6 rounded-full transition-all ${
                  data.summary.completionRate >= 75
                    ? 'bg-green-600'
                    : data.summary.completionRate >= 50
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${data.summary.completionRate}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {data.summary.completed} of {data.summary.total} tasks completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">Next 7 Days</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">
                {data.upcomingTasks.next7Days}
              </div>
              <div className="text-sm text-muted-foreground mt-1">tasks due</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">Next 14 Days</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">
                {data.upcomingTasks.next14Days}
              </div>
              <div className="text-sm text-muted-foreground mt-1">tasks due</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">Next 30 Days</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {data.upcomingTasks.next30Days}
              </div>
              <div className="text-sm text-muted-foreground mt-1">tasks due</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion by WBS */}
      <Card>
        <CardHeader>
          <CardTitle>Completion by WBS</CardTitle>
        </CardHeader>
        <CardContent>
          {data.wbsData && data.wbsData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WBS Code</TableHead>
                    <TableHead>WBS Name</TableHead>
                    <TableHead className="text-center">Total Tasks</TableHead>
                    <TableHead className="text-center">Completed</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.wbsData.map((wbs: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{wbs.wbsCode}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{wbs.wbsName}</TableCell>
                      <TableCell className="text-center">{wbs.total}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-semibold">{wbs.completed}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                wbs.completionRate >= 75
                                  ? 'bg-green-600'
                                  : wbs.completionRate >= 50
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${wbs.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">
                            {wbs.completionRate.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No WBS data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
