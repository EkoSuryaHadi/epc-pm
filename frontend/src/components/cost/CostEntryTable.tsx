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
  ArrowUpDown,
  Search,
  Plus,
  Filter,
} from 'lucide-react';
import { CostEntry, getEntryTypeInfo } from '@/lib/validations/cost-entry';
import { format } from 'date-fns';

interface CostEntryTableProps {
  data: CostEntry[];
  onAdd: () => void;
  isLoading?: boolean;
}

export function CostEntryTable({
  data,
  onAdd,
  isLoading = false,
}: CostEntryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'entryDate', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const columns = useMemo<ColumnDef<CostEntry>[]>(
    () => [
      {
        accessorKey: 'entryDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return format(new Date(row.getValue('entryDate')), 'MMM dd, yyyy');
        },
      },
      {
        accessorKey: 'costCode',
        header: 'Cost Code',
        cell: ({ row }) => {
          const costCode = row.original.costCode;
          return costCode ? (
            <div className="text-sm">
              <div className="font-medium">{costCode.code}</div>
              <div className="text-muted-foreground">{costCode.name}</div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          return (
            <div className="max-w-md">
              <div className="font-medium line-clamp-2">
                {row.getValue('description')}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'entryType',
        header: 'Type',
        cell: ({ row }) => {
          const entryType = row.getValue('entryType') as string;
          const typeInfo = getEntryTypeInfo(entryType);
          const colorClasses: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            purple: 'bg-purple-100 text-purple-800',
            orange: 'bg-orange-100 text-orange-800',
          };
          return (
            <Badge className={colorClasses[typeInfo.color]}>
              {typeInfo.label}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          if (value === 'all') return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('amount'));
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => {
          const reference = row.getValue('reference') as string | null;
          return reference ? (
            <span className="text-sm font-mono">{reference}</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => {
          const createdBy = row.original.createdBy;
          return createdBy ? (
            <div className="text-sm text-muted-foreground">
              {createdBy.name}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    if (typeFilter === 'all') return data;
    return data.filter(entry => entry.entryType === typeFilter);
  }, [data, typeFilter]);

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
    return <div className="text-center py-10">Loading cost entries...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="BUDGET">Budget</SelectItem>
              <SelectItem value="ACTUAL">Actual</SelectItem>
              <SelectItem value="FORECAST">Forecast</SelectItem>
              <SelectItem value="COMMITMENT">Commitment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {['BUDGET', 'ACTUAL', 'FORECAST', 'COMMITMENT'].map((type) => {
          const entries = data.filter(e => e.entryType === type);
          const total = entries.reduce((sum, e) => sum + Number(e.amount), 0);
          const typeInfo = getEntryTypeInfo(type);
          
          return (
            <div key={type} className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">
                {typeInfo.label}
              </div>
              <div className="text-2xl font-bold">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </div>
            </div>
          );
        })}
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
                  No cost entries found. Click &quot;Add Entry&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} entry(ies) total
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
