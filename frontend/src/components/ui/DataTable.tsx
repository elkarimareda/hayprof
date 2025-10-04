import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Switch } from "./switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { Confirm } from "./Confirm";

interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  description?: string;
  columns?: Array<keyof T> | string[];
  showAllColumns?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  // Actions
  onEdit?: (row: T, rowIndex: number) => void;
  onDelete?: (row: T, rowIndex: number) => void;
  /** Called when a boolean cell's Switch is toggled: (row, rowIndex, columnKey, newValue) */
  onToggle?: (row: T, rowIndex: number, column: string, value: boolean) => void;
  showActions?: boolean;
  editButtonText?: string;
  deleteButtonText?: string;
}

function DataTable<T = Record<string, unknown>>({
  data,
  description,
  columns,
  showAllColumns = false,
  enableSorting = true,
  enableFiltering = false,
  enablePagination = false,
  pageSize = 10,
  onEdit,
  onDelete,
  onToggle,
  showActions = false,
  editButtonText = "Edit",
  deleteButtonText = "Delete",
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  // Confirm modal state for deletes
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    item: T | null;
    rowIndex: number | null;
  }>({ item: null, rowIndex: null });

  // Auto-generate columns if not provided
  const actualColumns = useMemo(() => {
    if (columns && columns.length > 0) {
      return columns as string[];
    }

    if (showAllColumns && data.length > 0) {
      const allKeys = new Set<string>();
      data.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach((key) => allKeys.add(key));
        }
      });
      return Array.from(allKeys);
    }

    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      return Object.keys(data[0]);
    }

    return [];
  }, [data, columns, showAllColumns]);

  // Helper to render cell values. If row and rowIndex are provided and onEdit exists,
  // the Switch will call onEdit when toggled.
  const renderCellValue = useMemo(
    () =>
      (
        value: unknown,
        row?: T,
        rowIndex?: number,
        col?: keyof T | string
      ): React.ReactNode => {
        if (value === null || value === undefined) {
          return <span className="text-gray-400 italic">—</span>;
        }
        if (typeof value === "boolean") {
          if (onToggle && row) {
            return (
              <span onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) =>
                    onToggle &&
                    onToggle(
                      row,
                      rowIndex ?? 0,
                      String(col ?? ""),
                      Boolean(checked)
                    )
                  }
                />
              </span>
            );
          }
          return <Switch checked={value} disabled />;
        }
        if (typeof value === "number") {
          return (
            <span className="font-mono tabular-nums">
              {value.toLocaleString()}
            </span>
          );
        }
        if (Array.isArray(value)) {
          return (
            <span className="text-sm text-gray-600">
              [{value.length} items]
            </span>
          );
        }
        if (typeof value === "object") {
          return (
            <code className="text-xs bg-gray-100 px-2 py-1 rounded max-w-xs truncate block">
              {JSON.stringify(value)}
            </code>
          );
        }
        if (typeof value === "string" && value.length > 50) {
          return <span title={value}>{value.substring(0, 50)}...</span>;
        }
        return String(value);
      },
    [onToggle]
  );

  // Helper to format column headers
  const formatColumnHeader = (column: string): string => {
    return column
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ")
      .trim();
  };

  // Create TanStack Table columns
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = actualColumns.map((col) => ({
      accessorKey: col as keyof T,
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>{formatColumnHeader(col)}</span>
          {enableSorting && (
            <button
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              title="Sort column"
            >
              <div className="flex flex-col">
                <div
                  className={`text-xs leading-none ${
                    column.getIsSorted() === "asc"
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  ▲
                </div>
                <div
                  className={`text-xs leading-none ${
                    column.getIsSorted() === "desc"
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  ▼
                </div>
              </div>
            </button>
          )}
        </div>
      ),
      cell: ({ getValue, row }) =>
        renderCellValue(getValue(), row.original as T, row.index, col),
      enableSorting,
    }));

    if (showActions || onEdit || onDelete) {
      cols.push({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const item = row.original as T;
          const rowIndex = row.index;
          return (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) {
                    onEdit(item, rowIndex);
                  }
                }}
                disabled={!onEdit}
              >
                {editButtonText}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!onDelete) return;
                  setPendingDelete({ item, rowIndex });
                  setConfirmOpen(true);
                }}
                disabled={!onDelete}
              >
                {deleteButtonText}
              </Button>
            </div>
          );
        },
        enableSorting: false,
      });
    }

    return cols;
  }, [
    actualColumns,
    enableSorting,
    showActions,
    onEdit,
    onDelete,
    editButtonText,
    deleteButtonText,
    renderCellValue,
  ]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  if (actualColumns.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        {description && <p className="font-medium mb-2">{description}</p>}
        <p>No data or columns to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global Filter */}
      {enableFiltering && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(String(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <Table>
        {description && <TableCaption>{description}</TableCaption>}
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
                data-state={row.getIsSelected() && "selected"}
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
              <TableCell
                colSpan={tableColumns.length}
                className="h-24 text-center text-gray-500"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </p>
            </div>

            <div className="flex items-center space-x-1">
              <button
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {"<<"}
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {"<"}
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {">"}
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Info */}
      <div className="text-sm text-gray-500">
        {enableFiltering && globalFilter && (
          <p>
            Showing {table.getFilteredRowModel().rows.length} of {data.length}{" "}
            results for "{globalFilter}"
          </p>
        )}
        {!enableFiltering && (
          <p>
            {enablePagination
              ? `Showing ${
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                  1
                } to ${Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  data.length
                )} of ${data.length} entries`
              : `Showing ${data.length} entries`}
          </p>
        )}
      </div>
      {/* Confirm modal for deletes */}
      <Confirm
        title="Confirm Deletion"
        open={confirmOpen}
        description="This action cannot be undone. Are you sure you want to delete this item?"
        onConfirm={() => {
          if (
            pendingDelete.item &&
            pendingDelete.rowIndex !== null &&
            onDelete
          ) {
            onDelete(pendingDelete.item, pendingDelete.rowIndex);
          }
          setConfirmOpen(false);
          setPendingDelete({ item: null, rowIndex: null });
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete({ item: null, rowIndex: null });
        }}
      />
    </div>
  );
}

export default DataTable;
