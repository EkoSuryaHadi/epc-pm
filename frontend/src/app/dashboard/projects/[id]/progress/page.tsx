'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, TrendingUp, AlertCircle } from 'lucide-react';

import { ProgressUpdateForm } from '@/components/progress/ProgressUpdateForm';
import { ProgressUpdateTable } from '@/components/progress/ProgressUpdateTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  ProgressUpdate,
  ProgressUpdateFormData,
  ProgressSummary,
  formatProgress,
} from '@/lib/validations/progress';
import { WBSNode } from '@/lib/validations/wbs';

export default function ProgressPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProgressUpdate | null>(null);
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

        // Fetch progress updates
        const updatesRes = await api.progress.getUpdates(projectId);
        setUpdates(updatesRes.data);

        // Fetch WBS nodes for dropdown
        const wbsRes = await api.wbs.getAll(projectId);
        setWbsNodes(wbsRes.data);

        // Fetch progress summary
        const summaryRes = await api.progress.getSummary(projectId);
        setSummary(summaryRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load progress updates',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  // Handle create/update
  const handleSubmit = async (data: ProgressUpdateFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

      const payload = {
        ...data,
        reportDate: data.reportDate.toISOString(),
      };

      if (editingUpdate) {
        // Update existing
        const response = await api.progress.updateUpdate(editingUpdate.id, payload);
        setUpdates((prev) =>
          prev.map((update) =>
            update.id === editingUpdate.id ? response.data : update
          )
        );
        toast({
          title: 'Success',
          description: 'Progress update updated successfully',
        });
      } else {
        // Create new
        const response = await api.progress.createUpdate(payload);
        setUpdates((prev) => [response.data, ...prev]);
        toast({
          title: 'Success',
          description: 'Progress update created successfully',
        });
      }

      // Refresh summary
      const summaryRes = await api.progress.getSummary(projectId);
      setSummary(summaryRes.data);

      setIsFormOpen(false);
      setEditingUpdate(null);
    } catch (error: any) {
      console.error('Error saving update:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save progress update',
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
      await api.progress.deleteUpdate(deleteId);

      setUpdates((prev) => prev.filter((update) => update.id !== deleteId));
      toast({
        title: 'Success',
        description: 'Progress update deleted successfully',
      });
      setDeleteId(null);

      // Refresh summary
      const summaryRes = await api.progress.getSummary(projectId);
      setSummary(summaryRes.data);
    } catch (error: any) {
      console.error('Error deleting update:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete progress update',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit
  const handleEdit = (update: ProgressUpdate) => {
    setEditingUpdate(update);
    setIsFormOpen(true);
  };

  // Handle view (for now, same as edit)
  const handleView = (update: ProgressUpdate) => {
    handleEdit(update);
  };

  // Handle add new
  const handleAdd = () => {
    setEditingUpdate(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading progress...</p>
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
          <span className="text-gray-900">Progress Tracking</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <TrendingUp className="h-8 w-8" />
                Progress Tracking
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and monitor project progress at WBS level
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/projects/${projectId}/evm`}>
              <Button variant="outline">EVM Dashboard</Button>
            </Link>
            <Link href={`/dashboard/projects/${projectId}/kpi`}>
              <Button variant="outline">KPI Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatProgress(summary.overallProgress)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Weighted by WBS
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Planned Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatProgress(summary.overallPlanned)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Expected by now
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              summary.variance >= 0
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            <CardHeader>
              <CardTitle
                className={`text-sm font-medium ${
                  summary.variance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                Variance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  summary.variance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {summary.variance >= 0 ? '+' : ''}
                {formatProgress(summary.variance)}
              </div>
              <div
                className={`text-xs mt-1 ${
                  summary.variance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {summary.variance >= 0 ? 'Ahead of plan' : 'Behind plan'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Updates Table */}
      <ProgressUpdateTable
        data={updates}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        onAdd={handleAdd}
        isLoading={loading}
      />

      {/* Progress Update Form Dialog */}
      <ProgressUpdateForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingUpdate(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingUpdate}
        wbsNodes={wbsNodes}
        projectId={projectId}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Progress Update
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this progress update? This action cannot be
              undone.
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
