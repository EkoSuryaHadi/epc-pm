'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

import { CostEntryTable } from '@/components/cost/CostEntryTable';
import { CostEntryForm } from '@/components/cost/CostEntryForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { CostEntry, CostEntryFormData } from '@/lib/validations/cost-entry';
import { CostCode } from '@/lib/validations/cost-code';

export default function CostEntriesPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
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

        // Fetch cost entries
        const entriesRes = await api.cost.getCostEntries(projectId);
        setCostEntries(entriesRes.data);

        // Fetch cost codes for dropdown
        const codesRes = await api.cost.getCostCodes(projectId);
        setCostCodes(codesRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load cost entries',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  // Handle create
  const handleSubmit = async (data: CostEntryFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

      // Convert date to ISO string
      const payload = {
        ...data,
        projectId,
        entryDate: data.entryDate.toISOString(),
      };

      const response = await api.cost.createCostEntry(payload);
      setCostEntries((prev) => [response.data, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Cost entry created successfully',
      });

      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error saving cost entry:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to save cost entry',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add new
  const handleAdd = () => {
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading cost entries...</p>
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
          <span className="text-gray-900">Cost Entries</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cost Entries</h1>
            <p className="text-muted-foreground mt-1">
              Track budget, actual, forecast, and commitment transactions
            </p>
          </div>
        </div>
      </div>

      {/* Cost Entry Table */}
      <CostEntryTable
        data={costEntries}
        onAdd={handleAdd}
        isLoading={loading}
      />

      {/* Form Dialog */}
      <CostEntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        costCodes={costCodes}
        isLoading={isSubmitting}
      />
    </div>
  );
}
