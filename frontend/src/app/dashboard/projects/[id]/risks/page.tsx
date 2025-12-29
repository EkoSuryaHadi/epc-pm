'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Risk, RiskFormData } from '@/lib/validations/risk';
import { createApiMethods } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskForm } from '@/components/risks/RiskForm';
import { RiskTable } from '@/components/risks/RiskTable';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function RisksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();
  const { toast } = useToast();

  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRisks = async () => {
    if (!session?.user?.accessToken) return;

    setIsLoading(true);
    try {
      const api = createApiMethods(session.user.accessToken);
      const response = await api.risks.getAll(projectId);
      setRisks(response.data);
    } catch (error) {
      console.error('Error fetching risks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load risks',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchRisks();
    }
  }, [session, projectId]);

  const handleCreate = () => {
    setSelectedRisk(null);
    setFormOpen(true);
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setFormOpen(true);
  };

  const handleSubmit = async (data: RiskFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

      if (selectedRisk) {
        await api.risks.update(selectedRisk.id, data);
        toast({
          title: 'Success',
          description: 'Risk updated successfully',
        });
      } else {
        await api.risks.create({ ...data, projectId });
        toast({
          title: 'Success',
          description: 'Risk created successfully',
        });
      }

      setFormOpen(false);
      setSelectedRisk(null);
      fetchRisks();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save risk',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.accessToken) return;

    setIsDeleting(true);
    try {
      const api = createApiMethods(session.user.accessToken);
      await api.risks.delete(id);

      toast({
        title: 'Success',
        description: 'Risk deleted successfully',
      });

      fetchRisks();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete risk',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Statistics
  const stats = {
    total: risks.length,
    extreme: risks.filter(r => r.riskScore >= 20).length,
    high: risks.filter(r => r.riskScore >= 15 && r.riskScore < 20).length,
    medium: risks.filter(r => r.riskScore >= 10 && r.riskScore < 15).length,
    active: risks.filter(r => r.status !== 'CLOSED').length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Risk Management</h1>
          <p className="text-gray-600 mt-1">Identify, assess, and mitigate project risks</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${projectId}/risks/matrix`}>
            <Button variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Risk Matrix
            </Button>
          </Link>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Risk
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Extreme Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-red-600">{stats.extreme}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-orange-600">{stats.high}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Medium Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-yellow-600">{stats.medium}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-blue-600">{stats.active}</span>
          </CardContent>
        </Card>
      </div>

      {/* Risk Register */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Register</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading risks...</div>
          ) : (
            <RiskTable 
              risks={risks} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )}
        </CardContent>
      </Card>

      {/* Risk Form Dialog */}
      <RiskForm
        risk={selectedRisk}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedRisk(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
