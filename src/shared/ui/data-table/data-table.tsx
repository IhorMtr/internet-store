'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type RowData } from '@tanstack/react-table';
import { cn } from '@/shared/lib/cn';

// ========== Types ==========

type DataTableProps<TData extends RowData> = {
  columns: Array<ColumnDef<TData>>;
  data: Array<TData>;
  className?: string;
  tableClassName?: string;
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  getRowId?: (originalRow: TData, index: number) => string;
};

// ========== Constants ==========

const DEFAULT_LOADING_TEXT = 'Loading... ';
const DEFAULT_EMPTY_TEXT = 'No data found.';

// ========== Component ==========

export function DataTable<TData extends RowData>({
  columns,
  data,
  className,
  tableClassName,
  isLoading = false,
  loadingText = DEFAULT_LOADING_TEXT,
  emptyText = DEFAULT_EMPTY_TEXT,
  getRowId,
}: DataTableProps<TData>) {
  // React compiler cannot safely memoize TanStack table internals.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  const colSpan = columns.length > 0 ? columns.length : 1;

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border/70 bg-background', className)}>
      <table className={cn('w-full min-w-160 border-collapse text-left text-sm', tableClassName)}>
        <thead className="bg-muted/30">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-border/70">
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-4 py-3 font-semibold text-foreground/90">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={colSpan}>
                {loadingText}
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={colSpan}>
                {emptyText}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-border/70 transition-colors hover:bg-muted/20">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 align-top text-foreground/90">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
