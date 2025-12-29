'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

import { CostCodeTable } from '@/components/cost/CostCodeTable';
import { CostCodeForm } from '@/components/cost/CostCodeForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import { createApiMethods } from '@/lib/api-client';
import { CostCode, CostCodeFormData } from '@/lib/validations/cost-code';
import { WBSNode } from '@/lib/validations/wbs';

export default function CostCodesPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCostCode, setEditingCostCode] = useState<CostCode | null>(null);
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

        // Fetch cost codes
        const costCodesRes = await api.cost.getCostCodes(projectId);
        setCostCodes(costCodesRes.data);

        // Fetch WBS nodes for dropdown
        const wbsRes = await api.wbs.getAll(projectId);
        setWbsNodes(wbsRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load cost codes',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  // Handle create/update
  const handleSubmit = async (data: CostCodeFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

      if (editingCostCode) {
        // Update existing
        const response = await api.cost.updateCostCode(editingCostCode.id, data);
        setCostCodes((prev) =>
          prev.map((cc) => (cc.id === editingCostCode.id ? response.data : cc))
        );
        toast({
          title: 'Success',
          description: 'Cost code updated successfully',
        });
      } else {
        // Create new
        const payload = { ...data, projectId };
        const response = await api.cost.createCostCode(payload);
        setCostCodes((prev) => [...prev, response.data]);
        toast({
          title: 'Success',
          description: 'Cost code created successfully',
        });
      }

      setIsFormOpen(false);
      setEditingCostCode(null);
    } catch (error: any) {
      console.error('Error saving cost code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to save cost code',
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
      await api.cost.deleteCostCode(deleteId);

      setCostCodes((prev) => prev.filter((cc) => cc.id !== deleteId));
      toast({
        title: 'Success',
        description: 'Cost code deleted successfully',
      });
      setDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting cost code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to delete cost code',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit
  const handleEdit = (costCode: CostCode) => {
    setEditingCostCode(costCode);
    setIsFormOpen(true);
  };

  // Handle add new
  const handleAdd = () => {
    setEditingCostCode(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading cost codes...</p>
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
          <span className="text-gray-900">Cost Codes</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cost Codes</h1>
            <p className="text-muted-foreground mt-1">
              Manage cost codes and budget allocation for this project
            </p>
          </div>
        </div>
      </div>

      {/* Cost Code Table */}
      <CostCodeTable
        data={costCodes}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        onAdd={handleAdd}
        isLoading={loading}
      />

      {/* Form Dialog */}
      <CostCodeForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCostCode(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingCostCode}
        wbsNodes={wbsNodes}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Cost Code
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cost code? This action cannot
              be undone. All associated cost entries will remain but will no
              longer be linked to this code.
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
