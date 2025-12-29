'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { ProgressUpdate, formatProgress, getVarianceColor } from '@/lib/validations/progress';

interface ProgressUpdateTableProps {
  data: ProgressUpdate[];
  onView: (update: ProgressUpdate) => void;
  onEdit: (update: ProgressUpdate) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export function ProgressUpdateTable({
  data,
  onView,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
}: ProgressUpdateTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'reportDate', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns: ColumnDef<ProgressUpdate>[] = useMemo(
    () => [
      {
        accessorKey: 'reportDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Report Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue('reportDate'));
          return format(date, 'MMM dd, yyyy');
        },
      },
      {
        accessorKey: 'wbs.code',
        header: 'WBS Code',
        cell: ({ row }) => {
          const wbs = row.original.wbs;
          return (
            <div>
              <div className="font-medium">{wbs?.code}</div>
              <div className="text-sm text-muted-foreground">{wbs?.name}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'physicalProgress',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Physical Progress
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const actual = Number(row.getValue('physicalProgress'));
          return (
            <div className="font-medium">
              {formatProgress(actual)}
            </div>
          );
        },
      },
      {
        accessorKey: 'plannedProgress',
        header: 'Planned Progress',
        cell: ({ row }) => {
          const planned = Number(row.getValue('plannedProgress'));
          return formatProgress(planned);
        },
      },
      {
        id: 'variance',
        header: 'Variance',
        cell: ({ row }) => {
          const actual = Number(row.getValue('physicalProgress'));
          const planned = Number(row.getValue('plannedProgress'));
          const variance = actual - planned;
          
          const Icon = variance > 0 ? TrendingUp : variance < 0 ? TrendingDown : Minus;
          
          return (
            <div className={`flex items-center gap-1 ${getVarianceColor(variance)}`}>
              <Icon className="h-4 w-4" />
              {formatProgress(Math.abs(variance))}
            </div>
          );
        },
      },
      {
        accessorKey: 'manhours',
        header: 'Manhours',
        cell: ({ row }) => {
          const manhours = row.getValue('manhours');
          return manhours ? Number(manhours).toLocaleString() : '-';
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const actual = Number(row.getValue('physicalProgress'));
          const planned = Number(row.getValue('plannedProgress'));
          const variance = actual - planned;
          
          let status = 'On Track';
          let color = 'bg-blue-100 text-blue-800';
          
          if (variance >= 5) {
            status = 'Ahead';
            color = 'bg-green-100 text-green-800';
          } else if (variance <= -5) {
            status = 'Behind';
            color = 'bg-red-100 text-red-800';
          }
          
          return <Badge className={color}>{status}</Badge>;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const update = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(update)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(update)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(update.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-muted-foreground">Loading progress updates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search updates..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
        </div>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Progress Update
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    No progress updates found. Click &quot;Add Progress Update&quot; to get started.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {table.getFilteredRowModel().rows.length} of {data.length} updates
        </div>
      </div>
    </div>
  );
}
