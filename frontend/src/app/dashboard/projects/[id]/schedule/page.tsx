'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';

import { TaskForm } from '@/components/schedule/TaskForm';
import { TaskTable } from '@/components/schedule/TaskTable';
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
import { ScheduleTask, ScheduleTaskFormData } from '@/lib/validations/schedule';
import { WBSNode } from '@/lib/validations/wbs';

export default function SchedulePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
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

        // Fetch schedule tasks
        const tasksRes = await api.schedule.getAll(projectId);
        setTasks(tasksRes.data);

        // Fetch WBS nodes for dropdown
        const wbsRes = await api.wbs.getAll(projectId);
        setWbsNodes(wbsRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load schedule tasks',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  // Handle create/update
  const handleSubmit = async (data: ScheduleTaskFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

      // Convert dates to ISO strings
      const payload = {
        ...data,
        projectId,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        wbsId: data.wbsId || null,
        plannedHours: data.plannedHours || null,
        actualHours: data.actualHours || null,
      };

      if (editingTask) {
        // Update existing
        const response = await api.schedule.update(editingTask.id, payload);
        setTasks((prev) =>
          prev.map((task) => (task.id === editingTask.id ? response.data : task))
        );
        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
      } else {
        // Create new
        const response = await api.schedule.create(payload);
        setTasks((prev) => [...prev, response.data]);
        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
      }

      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      console.error('Error saving task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to save task',
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
      await api.schedule.delete(deleteId);

      setTasks((prev) => prev.filter((task) => task.id !== deleteId));
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      setDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to delete task',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit
  const handleEdit = (task: ScheduleTask) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Handle add new
  const handleAdd = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading schedule...</p>
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
          <span className="text-gray-900">Schedule</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Schedule
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage project schedule tasks and timeline
              </p>
            </div>
          </div>

          <Link href={`/dashboard/projects/${projectId}/gantt`}>
            <Button variant="outline">
              View Gantt Chart
            </Button>
          </Link>
          <Link href={`/dashboard/projects/${projectId}/schedule/baseline`}>
            <Button variant="outline">
              Baselines
            </Button>
          </Link>
          <Link href={`/dashboard/projects/${projectId}/schedule/reports`}>
            <Button variant="outline">
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Task Table */}
      <TaskTable
        data={tasks}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        onAdd={handleAdd}
        isLoading={loading}
      />

      {/* Task Form Dialog */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTask}
        wbsNodes={wbsNodes}
        allTasks={tasks}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
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
