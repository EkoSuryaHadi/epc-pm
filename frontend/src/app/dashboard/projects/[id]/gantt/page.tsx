'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, BarChart3 } from 'lucide-react';

import { GanttChart } from '@/components/schedule/GanttChart';
import { TaskForm } from '@/components/schedule/TaskForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { ScheduleTask, ScheduleTaskFormData } from '@/lib/validations/schedule';
import { WBSNode } from '@/lib/validations/wbs';
import { Milestone } from '@/lib/validations/milestone';

export default function GanttPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Fetch milestones
        const milestonesRes = await api.schedule.getMilestones(projectId);
        setMilestones(milestonesRes.data);

        // Fetch WBS nodes for form
        const wbsRes = await api.wbs.getAll(projectId);
        setWbsNodes(wbsRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load Gantt chart data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  // Handle task click (open edit form)
  const handleTaskClick = (task: ScheduleTask) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Handle task date update (drag in Gantt)
  const handleTaskUpdate = async (
    task: ScheduleTask,
    startDate: string,
    endDate: string
  ) => {
    if (!session?.user?.accessToken) return;

    try {
      const api = createApiMethods(session.user.accessToken);

      // Calculate new duration
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      await api.schedule.update(task.id, {
        startDate,
        endDate,
        duration,
      });

      // Update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, startDate, endDate, duration }
            : t
        )
      );

      toast({
        title: 'Success',
        description: 'Task dates updated',
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update task dates',
      });
    }
  };

  // Handle form submit
  const handleSubmit = async (data: ScheduleTaskFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

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
        const response = await api.schedule.update(editingTask.id, payload);
        setTasks((prev) =>
          prev.map((task) => (task.id === editingTask.id ? response.data : task))
        );
        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
      } else {
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
        description: error.response?.data?.message || 'Failed to save task',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading Gantt chart...</p>
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
          <span className="text-gray-900">Gantt Chart</span>
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
                Gantt Chart
              </h1>
              <p className="text-muted-foreground mt-1">
                Visual timeline of project schedule
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/projects/${projectId}/schedule`}>
              <Button variant="outline">
                View Table
              </Button>
            </Link>
            <Button onClick={() => setIsFormOpen(true)}>
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <GanttChart
        tasks={tasks}
        milestones={milestones}
        onTaskClick={handleTaskClick}
        onTaskUpdate={handleTaskUpdate}
        onMilestoneClick={(milestone) => {
          toast({
            title: 'Milestone',
            description: `${milestone.name} - Status: ${milestone.status}`,
          });
        }}
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
    </div>
  );
}
