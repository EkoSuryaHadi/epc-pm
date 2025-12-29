'use client';

import { useState } from 'react';
import { Edit, Trash2, Search } from 'lucide-react';
import { ChangeOrder, CHANGE_ORDER_TYPES, CHANGE_ORDER_STATUSES } from '@/lib/validations/risk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { format } from 'date-fns';

interface ChangeOrderTableProps {
  changeOrders: ChangeOrder[];
  onEdit: (changeOrder: ChangeOrder) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ChangeOrderTable({ changeOrders, onEdit, onDelete, isDeleting }: ChangeOrderTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredChangeOrders = changeOrders.filter((co) => {
    const matchesSearch =
      co.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      co.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || co.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedChangeOrders = [...filteredChangeOrders].sort(
    (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = CHANGE_ORDER_STATUSES.find((s) => s.value === status);
    if (!statusConfig) return <Badge>{status}</Badge>;

    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={colorMap[statusConfig.color]}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = CHANGE_ORDER_TYPES.find((t) => t.value === type);
    return typeConfig?.icon || '📝';
  };

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const totalCostImpact = changeOrders.reduce((sum, co) => sum + (co.costImpact || 0), 0);
  const totalTimeImpact = changeOrders.reduce((sum, co) => sum + (co.timeImpact || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600">Total Change Orders</p>
          <p className="text-2xl font-bold">{changeOrders.length}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {changeOrders.filter(co => co.status === 'PENDING').length}
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">Total Cost Impact</p>
          <p className={`text-2xl font-bold ${totalCostImpact > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(totalCostImpact).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-600">Total Time Impact</p>
          <p className={`text-2xl font-bold ${totalTimeImpact > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {Math.abs(totalTimeImpact)} days
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {CHANGE_ORDER_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead className="text-right">Cost Impact</TableHead>
              <TableHead className="text-right">Time Impact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedChangeOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No change orders found matching your filters'
                    : 'No change orders yet'}
                </TableCell>
              </TableRow>
            ) : (
              sortedChangeOrders.map((co) => (
                <TableRow key={co.id}>
                  <TableCell>
                    <span className="text-xl">{getTypeIcon(co.type)}</span>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div>
                      <p className="font-medium">{co.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {co.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{co.requestedBy}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${
                      co.costImpact > 0 ? 'text-red-600' : 
                      co.costImpact < 0 ? 'text-green-600' : 
                      'text-gray-600'
                    }`}>
                      {co.costImpact > 0 ? '+' : ''}{co.costImpact < 0 ? '-' : ''}$
                      {Math.abs(co.costImpact || 0).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${
                      co.timeImpact > 0 ? 'text-orange-600' : 
                      co.timeImpact < 0 ? 'text-green-600' : 
                      'text-gray-600'
                    }`}>
                      {co.timeImpact > 0 ? '+' : ''}{co.timeImpact} days
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(co.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(co.requestDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(co)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(co.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Change Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this change order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
