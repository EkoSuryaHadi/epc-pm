'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  Search,
  Plus,
  Filter,
} from 'lucide-react';
import { ScheduleTask, getTaskStatus } from '@/lib/validations/schedule';
import { format } from 'date-fns';

interface TaskTableProps {
  data: ScheduleTask[];
  onEdit: (task: ScheduleTask) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export function TaskTable({
  data,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
}: TaskTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'startDate', desc: false }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const columns = useMemo<ColumnDef<ScheduleTask>[]>(
    () => [
      {
        accessorKey: 'taskName',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Task Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isCritical = row.original.isCritical;
          return (
            <div className="flex items-center gap-2">
              <div className="font-medium">{row.getValue('taskName')}</div>
              {isCritical && (
                <Badge variant="destructive" className="text-xs">
                  Critical
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Start Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return format(new Date(row.getValue('startDate')), 'MMM dd, yyyy');
        },
      },
      {
        accessorKey: 'endDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              End Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return format(new Date(row.getValue('endDate')), 'MMM dd, yyyy');
        },
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {row.getValue('duration')} days
            </div>
          );
        },
      },
      {
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }) => {
          const progress = row.getValue('progress') as number;
          return (
            <div className="flex items-center gap-2">
              <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground min-w-[40px]">
                {progress}%
              </span>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = getTaskStatus(row.original);
          const colorClasses: Record<string, string> = {
            'Not Started': 'bg-gray-100 text-gray-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'Delayed': 'bg-red-100 text-red-800',
          };
          return (
            <Badge className={colorClasses[status]}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'wbs',
        header: 'WBS',
        cell: ({ row }) => {
          const wbs = row.original.wbs;
          return wbs ? (
            <div className="text-sm">
              <div className="font-medium">{wbs.code}</div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: 'resources',
        header: 'Resources',
        cell: ({ row }) => {
          const resources = row.getValue('resources') as string[];
          return resources && resources.length > 0 ? (
            <div className="text-sm">
              {resources.slice(0, 2).join(', ')}
              {resources.length > 2 && (
                <span className="text-muted-foreground">
                  {' '}+{resources.length - 2}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const task = row.original;

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
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
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
    [onEdit, onDelete]
  );

  // Filter by status
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter((task) => getTaskStatus(task) === statusFilter);
  }, [data, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (isLoading) {
    return <div className="text-center py-10">Loading schedule tasks...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
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
                  No schedule tasks found. Click &quot;Add Task&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} task(s) total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
