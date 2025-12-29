'use client';

import { useState } from 'react';
import { Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import { Risk, RISK_STATUSES, getRiskLevel } from '@/lib/validations/risk';
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

interface RiskTableProps {
  risks: Risk[];
  onEdit: (risk: Risk) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function RiskTable({ risks, onEdit, onDelete, isDeleting }: RiskTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort by risk score (highest first)
  const sortedRisks = [...filteredRisks].sort((a, b) => b.riskScore - a.riskScore);

  const getStatusBadge = (status: string) => {
    const statusConfig = RISK_STATUSES.find((s) => s.value === status);
    if (!statusConfig) return <Badge>{status}</Badge>;

    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      green: 'bg-green-100 text-green-800',
    };

    return (
      <Badge className={colorMap[statusConfig.color]}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getRiskScoreBadge = (score: number) => {
    const level = getRiskLevel(score);

    const colorMap: Record<string, string> = {
      red: 'bg-red-100 text-red-800 border-red-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
    };

    return (
      <div className="flex items-center gap-2">
        <Badge className={`${colorMap[level.color]} border font-bold`}>
          {score}
        </Badge>
        {score >= 15 && <AlertTriangle className="h-4 w-4 text-red-600" />}
      </div>
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, description, or category..."
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
            {RISK_STATUSES.map((status) => (
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
              <TableHead>Risk Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-center">Probability</TableHead>
              <TableHead className="text-center">Impact</TableHead>
              <TableHead className="text-center">Risk Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRisks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No risks found matching your filters'
                    : 'No risks identified yet'}
                </TableCell>
              </TableRow>
            ) : (
              sortedRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div>
                      <p className="font-medium">{risk.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {risk.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{risk.category}</TableCell>
                  <TableCell className="text-sm">{risk.owner || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{risk.probability}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{risk.impact}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getRiskScoreBadge(risk.riskScore)}
                  </TableCell>
                  <TableCell>{getStatusBadge(risk.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(risk.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(risk)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(risk.id)}
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
            <AlertDialogTitle>Delete Risk</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this risk? This action cannot be undone.
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
