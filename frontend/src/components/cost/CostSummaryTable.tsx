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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

interface CostSummaryData {
  code: string;
  name: string;
  category: string;
  budget: number;
  actual: number;
  commitment: number;
  forecast: number;
  variance: number;
  variancePercent: number;
}

interface CostSummaryTableProps {
  data: CostSummaryData[];
}

export function CostSummaryTable({ data }: CostSummaryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<CostSummaryData>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('code')}</div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="max-w-xs truncate">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.getValue('category')}
          </Badge>
        ),
      },
      {
        accessorKey: 'budget',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Budget
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            ${row.getValue<number>('budget').toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'actual',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Actual
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            ${row.getValue<number>('actual').toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'commitment',
        header: 'Commitment',
        cell: ({ row }) => (
          <div className="text-right">
            ${row.getValue<number>('commitment').toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'forecast',
        header: 'Forecast',
        cell: ({ row }) => (
          <div className="text-right">
            ${row.getValue<number>('forecast').toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'variance',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Variance
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const variance = row.getValue<number>('variance');
          return (
            <div
              className={`text-right font-medium ${
                variance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ${Math.abs(variance).toLocaleString()}
            </div>
          );
        },
      },
      {
        accessorKey: 'variancePercent',
        header: 'Var %',
        cell: ({ row }) => {
          const percent = row.getValue<number>('variancePercent');
          return (
            <div
              className={`text-right font-medium ${
                percent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {percent >= 0 ? '+' : ''}
              {percent.toFixed(1)}%
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const variancePercent = row.original.variancePercent;
          let status = 'On Track';
          let color = 'bg-green-100 text-green-800';

          if (variancePercent < -10) {
            status = 'Over Budget';
            color = 'bg-red-100 text-red-800';
          } else if (variancePercent < 0) {
            status = 'At Risk';
            color = 'bg-amber-100 text-amber-800';
          }

          return <Badge className={color}>{status}</Badge>;
        },
      },
    ],
    []
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

  return (
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
              <TableRow key={row.id}>
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
                No cost data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
