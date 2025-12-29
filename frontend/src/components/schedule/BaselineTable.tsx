'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
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
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  BarChart3,
  Trash2,
  ArrowUpDown,
  Camera,
} from 'lucide-react';
import { ScheduleBaseline } from '@/lib/validations/baseline';
import { format } from 'date-fns';

interface BaselineTableProps {
  data: ScheduleBaseline[];
  onView: (baseline: ScheduleBaseline) => void;
  onActivate: (baseline: ScheduleBaseline) => void;
  onViewVariance: (baseline: ScheduleBaseline) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export function BaselineTable({
  data,
  onView,
  onActivate,
  onViewVariance,
  onDelete,
  onAdd,
  isLoading = false,
}: BaselineTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ]);

  const columns = useMemo<ColumnDef<ScheduleBaseline>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Baseline Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div className="font-medium">{row.getValue('name')}</div>;
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const description = row.original.description;
          return description ? (
            <div className="max-w-[300px] truncate" title={description}>
              {description}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: 'baselineDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Baseline Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return format(new Date(row.getValue('baselineDate')), 'MMM dd, yyyy');
        },
      },
      {
        accessorKey: '_count.tasks',
        header: 'Tasks',
        cell: ({ row }) => {
          const count = row.original._count?.tasks || 0;
          return (
            <div className="text-center">
              <Badge variant="outline">{count}</Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isActive = row.getValue('isActive') as boolean;
          return isActive ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const baseline = row.original;

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
                <DropdownMenuItem onClick={() => onView(baseline)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {!baseline.isActive && (
                  <DropdownMenuItem onClick={() => onActivate(baseline)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Set as Active
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onViewVariance(baseline)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Variance Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(baseline.id)}
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
    [onView, onActivate, onViewVariance, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return <div className="text-center py-10">Loading baselines...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Schedule Baselines</h3>
          <p className="text-sm text-muted-foreground">
            {data.length} baseline{data.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <Button onClick={onAdd}>
          <Camera className="mr-2 h-4 w-4" />
          Create Baseline
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No baselines found. Click &quot;Create Baseline&quot; to capture current schedule.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
