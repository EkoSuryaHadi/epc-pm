'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import { ChangeOrder, ChangeOrderFormData } from '@/lib/validations/risk';
import { createApiMethods } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangeOrderForm } from '@/components/risks/ChangeOrderForm';
import { ChangeOrderTable } from '@/components/risks/ChangeOrderTable';
import { useToast } from '@/hooks/use-toast';

export default function ChangeOrdersPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();
  const { toast } = useToast();

  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchChangeOrders = async () => {
    if (!session?.user?.accessToken) return;

    setIsLoading(true);
    try {
      const api = createApiMethods(session.user.accessToken);
      const response = await api.risks.getChangeOrders(projectId);
      setChangeOrders(response.data);
    } catch (error) {
      console.error('Error fetching change orders:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load change orders',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchChangeOrders();
    }
  }, [session, projectId]);

  const handleCreate = () => {
    setSelectedChangeOrder(null);
    setFormOpen(true);
  };

  const handleEdit = (changeOrder: ChangeOrder) => {
    setSelectedChangeOrder(changeOrder);
    setFormOpen(true);
  };

  const handleSubmit = async (data: ChangeOrderFormData) => {
    if (!session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      const api = createApiMethods(session.user.accessToken);

      if (selectedChangeOrder) {
        await api.risks.updateChangeOrder(selectedChangeOrder.id, data);
        toast({
          title: 'Success',
          description: 'Change order updated successfully',
        });
      } else {
        await api.risks.createChangeOrder({ ...data, projectId });
        toast({
          title: 'Success',
          description: 'Change order created successfully',
        });
      }

      setFormOpen(false);
      setSelectedChangeOrder(null);
      fetchChangeOrders();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save change order',
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
      await api.risks.deleteChangeOrder(id);

      toast({
        title: 'Success',
        description: 'Change order deleted successfully',
      });

      fetchChangeOrders();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete change order',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Change Orders</h1>
          <p className="text-gray-600 mt-1">Manage project change requests and their impacts</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Change Order
        </Button>
      </div>

      {/* Change Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Change Order Register</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading change orders...</div>
          ) : (
            <ChangeOrderTable 
              changeOrders={changeOrders} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )}
        </CardContent>
      </Card>

      {/* Change Order Form Dialog */}
      <ChangeOrderForm
        changeOrder={selectedChangeOrder}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedChangeOrder(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
