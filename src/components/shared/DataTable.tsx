import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, actions?: any) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: string;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  actions?: any;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKey,
  pageSize = 10,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = searchKey
    ? data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      )}

      <div className="stat-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((col) => (
                  <th key={col.key} className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-muted-foreground text-sm">
                    No data found.
                  </td>
                </tr>
              ) : (
                paged.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="p-4 text-sm">
                        {col.render ? col.render(item, actions) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
