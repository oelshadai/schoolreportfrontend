import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Calendar } from 'lucide-react';

const mockYears = [
  { id: 1, name: '2024/2025', startDate: '2024-09-01', endDate: '2025-07-31', terms: 3, status: 'current' },
  { id: 2, name: '2023/2024', startDate: '2023-09-01', endDate: '2024-07-31', terms: 3, status: 'completed' },
  { id: 3, name: '2025/2026', startDate: '2025-09-01', endDate: '2026-07-31', terms: 3, status: 'upcoming' },
];

const mockTerms = [
  { id: 1, name: 'Term 1', year: '2024/2025', start: '2024-09-01', end: '2024-12-20', status: 'completed' },
  { id: 2, name: 'Term 2', year: '2024/2025', start: '2025-01-06', end: '2025-04-11', status: 'current' },
  { id: 3, name: 'Term 3', year: '2024/2025', start: '2025-04-28', end: '2025-07-31', status: 'upcoming' },
];

const statusColors: Record<string, string> = {
  current: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-border',
  upcoming: 'bg-info/10 text-info border-info/20',
};

const yearColumns = [
  { key: 'name', label: 'Academic Year', render: (y: typeof mockYears[0]) => <span className="font-medium text-foreground">{y.name}</span> },
  { key: 'startDate', label: 'Start', render: (y: typeof mockYears[0]) => <span className="text-muted-foreground">{y.startDate}</span> },
  { key: 'endDate', label: 'End', render: (y: typeof mockYears[0]) => <span className="text-muted-foreground">{y.endDate}</span> },
  { key: 'terms', label: 'Terms', render: (y: typeof mockYears[0]) => <span className="text-foreground">{y.terms}</span> },
  { key: 'status', label: 'Status', render: (y: typeof mockYears[0]) => <Badge variant="outline" className={statusColors[y.status]}>{y.status}</Badge> },
  { key: 'actions', label: '', render: () => <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button> },
];

const termColumns = [
  { key: 'name', label: 'Term', render: (t: typeof mockTerms[0]) => <span className="font-medium text-foreground">{t.name}</span> },
  { key: 'year', label: 'Academic Year', render: (t: typeof mockTerms[0]) => <span className="text-muted-foreground">{t.year}</span> },
  { key: 'start', label: 'Start', render: (t: typeof mockTerms[0]) => <span className="text-muted-foreground">{t.start}</span> },
  { key: 'end', label: 'End', render: (t: typeof mockTerms[0]) => <span className="text-muted-foreground">{t.end}</span> },
  { key: 'status', label: 'Status', render: (t: typeof mockTerms[0]) => <Badge variant="outline" className={statusColors[t.status]}>{t.status}</Badge> },
  { key: 'actions', label: '', render: () => <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button> },
];

const AcademicYearManagement = () => (
  <div className="space-y-8 animate-fade-in">
    <PageHeader title="Academic Year Management" description="Configure academic years and terms" actionLabel="New Academic Year" />
    <div>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Calendar className="h-4 w-4" /> Academic Years</h3>
      <DataTable columns={yearColumns} data={mockYears} />
    </div>
    <div>
      <h3 className="font-semibold text-foreground mb-3">Terms / Semesters</h3>
      <DataTable columns={termColumns} data={mockTerms} />
    </div>
  </div>
);

export default AcademicYearManagement;
