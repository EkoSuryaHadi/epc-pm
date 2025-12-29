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
} from 'lucide-react';
import { CostCode, getCategoryInfo } from '@/lib/validations/cost-code';

interface CostCodeTableProps {
  data: CostCode[];
  onEdit: (costCode: CostCode) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export function CostCodeTable({
  data,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
}: CostCodeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<CostCode>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Code
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('code')}</div>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const description = row.original.description;
          return (
            <div>
              <div className="font-medium">{row.getValue('name')}</div>
              {description && (
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const category = row.getValue('category') as string;
          const categoryInfo = getCategoryInfo(category);
          return (
            <Badge variant="outline" className="font-normal">
              {categoryInfo.label}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'budget',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Budget
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('budget'));
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
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
              <div className="text-muted-foreground">{wbs.name}</div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: '_count',
        header: 'Entries',
        cell: ({ row }) => {
          const count = row.original._count?.costEntries || 0;
          return (
            <div className="text-center">
              <Badge variant="secondary">{count}</Badge>
            </div>
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const costCode = row.original;

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
                <DropdownMenuItem onClick={() => onEdit(costCode)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(costCode.id)}
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

  const table = useReactTable({
    data,
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
  });

  if (isLoading) {
    return <div className="text-center py-10">Loading cost codes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cost codes..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Cost Code
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
                  No cost codes found. Click &quot;Add Cost Code&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} cost code(s) total
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
