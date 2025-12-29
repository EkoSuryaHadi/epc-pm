'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Flag, AlertCircle } from 'lucide-react';

import { MilestoneForm } from '@/components/schedule/MilestoneForm';
import { MilestoneTable } from '@/components/schedule/MilestoneTable';
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
import { Milestone, MilestoneFormData } from '@/lib/validations/milestone';

export default function MilestonesPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
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

        // Fetch milestones
        const milestonesRes = await api.schedule.getMilestones(projectId);
        setMilestones(milestonesRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load milestones',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  // Handle create/update
  const handleSubmit = async (data: MilestoneFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

      // Convert dates to ISO strings
      const payload = {
        ...data,
        projectId,
        targetDate: data.targetDate.toISOString(),
        actualDate: data.actualDate ? data.actualDate.toISOString() : null,
      };

      if (editingMilestone) {
        // Update existing
        const response = await api.schedule.updateMilestone(editingMilestone.id, payload);
        setMilestones((prev) =>
          prev.map((milestone) =>
            milestone.id === editingMilestone.id ? response.data : milestone
          )
        );
        toast({
          title: 'Success',
          description: 'Milestone updated successfully',
        });
      } else {
        // Create new
        const response = await api.schedule.createMilestone(payload);
        setMilestones((prev) => [...prev, response.data]);
        toast({
          title: 'Success',
          description: 'Milestone created successfully',
        });
      }

      setIsFormOpen(false);
      setEditingMilestone(null);
    } catch (error: any) {
      console.error('Error saving milestone:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save milestone',
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
      await api.schedule.deleteMilestone(deleteId);

      setMilestones((prev) => prev.filter((milestone) => milestone.id !== deleteId));
      toast({
        title: 'Success',
        description: 'Milestone deleted successfully',
      });
      setDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting milestone:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete milestone',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit
  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setIsFormOpen(true);
  };

  // Handle add new
  const handleAdd = () => {
    setEditingMilestone(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading milestones...</p>
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
          <span className="text-gray-900">Milestones</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Flag className="h-8 w-8" />
                Milestones
              </h1>
              <p className="text-muted-foreground mt-1">
                Track important project milestones and key events
              </p>
            </div>
          </div>

          <Link href={`/dashboard/projects/${projectId}/schedule`}>
            <Button variant="outline">
              View Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Milestone Table */}
      <MilestoneTable
        data={milestones}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        onAdd={handleAdd}
        isLoading={loading}
      />

      {/* Milestone Form Dialog */}
      <MilestoneForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingMilestone(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingMilestone}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Milestone
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this milestone? This action cannot be undone.
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
