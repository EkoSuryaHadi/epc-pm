'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

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
import { VarianceReport, getVarianceStatusColor, formatVariance } from '@/lib/validations/baseline';

export default function VarianceReportPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;
  const baselineId = params.baselineId as string;

  const [report, setReport] = useState<VarianceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.schedule.getVarianceReport(baselineId);
        setReport(response.data);
      } catch (error: any) {
        console.error('Error fetching variance report:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load variance report',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [session, baselineId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading variance report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-10">No data available</div>;
  }

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Variance Report
              </h1>
              <p className="text-muted-foreground mt-1">
                {report.baseline.name} - {format(new Date(report.baseline.baselineDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Tasks</div>
          <div className="text-2xl font-bold">{report.summary.totalTasks}</div>
        </div>
        <div className="rounded-lg border p-4 bg-green-50">
          <div className="text-sm text-muted-foreground">On Track</div>
          <div className="text-2xl font-bold text-green-700">
            {report.summary.onTrackCount} <span className="text-sm">({report.summary.onTrackPercentage.toFixed(0)}%)</span>
          </div>
        </div>
        <div className="rounded-lg border p-4 bg-red-50">
          <div className="text-sm text-muted-foreground">Delayed</div>
          <div className="text-2xl font-bold text-red-700">
            {report.summary.delayedCount} <span className="text-sm">({report.summary.delayedPercentage.toFixed(0)}%)</span>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Avg Delay</div>
          <div className="text-2xl font-bold">{report.summary.avgDelay} days</div>
        </div>
      </div>

      {/* Variance Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Planned End</TableHead>
              <TableHead>Actual End</TableHead>
              <TableHead>End Variance</TableHead>
              <TableHead>Duration Variance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.tasks.map((task) => (
              <TableRow key={task.taskId}>
                <TableCell className="font-medium">{task.taskName}</TableCell>
                <TableCell>
                  {format(new Date(task.plannedEnd), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {task.actualEnd
                    ? format(new Date(task.actualEnd), 'MMM dd, yyyy')
                    : '-'}
                </TableCell>
                <TableCell>
                  <span className={task.endVariance && task.endVariance > 0 ? 'text-red-600 font-semibold' : ''}>
                    {formatVariance(task.endVariance)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={task.durationVariance && task.durationVariance > 0 ? 'text-red-600' : ''}>
                    {task.durationVariance !== null
                      ? `${task.durationVariance > 0 ? '+' : ''}${task.durationVariance} days`
                      : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getVarianceStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
