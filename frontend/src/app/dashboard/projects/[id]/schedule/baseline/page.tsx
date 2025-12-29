'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Camera, AlertCircle } from 'lucide-react';

import { BaselineForm } from '@/components/schedule/BaselineForm';
import { BaselineTable } from '@/components/schedule/BaselineTable';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { ScheduleBaseline, BaselineFormData } from '@/lib/validations/baseline';

export default function BaselinePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [baselines, setBaselines] = useState<ScheduleBaseline[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

        // Fetch baselines
        const baselinesRes = await api.schedule.getBaselines(projectId);
        setBaselines(baselinesRes.data);

        // Fetch schedule tasks to get count
        const tasksRes = await api.schedule.getAll(projectId);
        setTaskCount(tasksRes.data.length);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load baselines',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  // Handle create baseline
  const handleSubmit = async (data: BaselineFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

      const payload = {
        ...data,
        projectId,
      };

      const response = await api.schedule.createBaseline(payload);
      setBaselines((prev) => [response.data, ...prev]);
      
      toast({
        title: 'Success',
        description: `Baseline "${data.name}" created with ${response.data._count?.tasks || taskCount} tasks`,
      });
      
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error creating baseline:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create baseline',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!session?.user?.accessToken || !deleteId) return;

    setIsDeleting(true);
    try {
      const api = createApiMethods(session.user.accessToken);
      await api.schedule.deleteBaseline(deleteId);

      setBaselines((prev) => prev.filter((baseline) => baseline.id !== deleteId));
      toast({
        title: 'Success',
        description: 'Baseline deleted successfully',
      });
      setDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting baseline:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete baseline',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle activate
  const handleActivate = async (baseline: ScheduleBaseline) => {
    if (!session?.user?.accessToken) return;

    try {
      const api = createApiMethods(session.user.accessToken);
      await api.schedule.activateBaseline(baseline.id, projectId);

      // Update local state
      setBaselines((prev) =>
        prev.map((b) => ({
          ...b,
          isActive: b.id === baseline.id,
        }))
      );

      toast({
        title: 'Success',
        description: `"${baseline.name}" is now the active baseline`,
      });
    } catch (error: any) {
      console.error('Error activating baseline:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to activate baseline',
      });
    }
  };

  // Handle view baseline
  const handleView = (baseline: ScheduleBaseline) => {
    router.push(`/dashboard/projects/${projectId}/schedule/baseline/${baseline.id}`);
  };

  // Handle view variance
  const handleViewVariance = (baseline: ScheduleBaseline) => {
    router.push(`/dashboard/projects/${projectId}/schedule/baseline/${baseline.id}/variance`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading baselines...</p>
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
          <Link
            href={`/dashboard/projects/${projectId}/schedule`}
            className="hover:text-gray-900"
          >
            Schedule
          </Link>
          <span>/</span>
          <span className="text-gray-900">Baselines</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Camera className="h-8 w-8" />
                Schedule Baselines
              </h1>
              <p className="text-muted-foreground mt-1">
                Capture and compare schedule performance over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Baseline Info */}
      {baselines.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Baselines</div>
            <div className="text-2xl font-bold">{baselines.length}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active Baseline</div>
            <div className="text-lg font-semibold">
              {baselines.find((b) => b.isActive)?.name || 'None'}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Current Tasks</div>
            <div className="text-2xl font-bold">{taskCount}</div>
          </div>
        </div>
      )}

      {/* Baseline Table */}
      <BaselineTable
        data={baselines}
        onView={handleView}
        onActivate={handleActivate}
        onViewVariance={handleViewVariance}
        onDelete={(id) => setDeleteId(id)}
        onAdd={() => setIsFormOpen(true)}
        isLoading={loading}
      />

      {/* Baseline Form Dialog */}
      <BaselineForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        taskCount={taskCount}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Baseline
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this baseline? This action cannot be undone.
              All baseline tasks will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
