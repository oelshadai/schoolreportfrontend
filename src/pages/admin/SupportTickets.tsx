import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Eye } from 'lucide-react';

const mockTickets = [
  { id: 1, subject: 'Cannot generate report cards', school: 'Elite Academy', submitter: 'john@elite.edu', priority: 'high', status: 'open', created: '2025-02-17' },
  { id: 2, subject: 'Student login not working', school: 'Bright Future', submitter: 'james@bright.edu', priority: 'critical', status: 'in_progress', created: '2025-02-16' },
  { id: 3, subject: 'Need to change academic year', school: 'Golden Star', submitter: 'admin@golden.edu', priority: 'medium', status: 'open', created: '2025-02-15' },
  { id: 4, subject: 'Feature request: SMS notifications', school: 'Excellence College', submitter: 'admin@excellence.edu', priority: 'low', status: 'closed', created: '2025-02-10' },
  { id: 5, subject: 'Billing issue with subscription', school: 'Heritage Int.', submitter: 'info@heritage.edu', priority: 'high', status: 'resolved', created: '2025-02-08' },
];

const priorityColors: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-info/10 text-info border-info/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const statusColors: Record<string, string> = {
  open: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-info/10 text-info border-info/20',
  resolved: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const columns = [
  { key: 'id', label: '#', render: (t: typeof mockTickets[0]) => <span className="text-muted-foreground font-mono">#{t.id}</span> },
  { key: 'subject', label: 'Subject', render: (t: typeof mockTickets[0]) => <span className="font-medium text-foreground">{t.subject}</span> },
  { key: 'school', label: 'School', render: (t: typeof mockTickets[0]) => <span className="text-muted-foreground">{t.school}</span> },
  { key: 'priority', label: 'Priority', render: (t: typeof mockTickets[0]) => <Badge variant="outline" className={priorityColors[t.priority]}>{t.priority}</Badge> },
  { key: 'status', label: 'Status', render: (t: typeof mockTickets[0]) => <Badge variant="outline" className={statusColors[t.status]}>{t.status.replace('_', ' ')}</Badge> },
  { key: 'created', label: 'Created', render: (t: typeof mockTickets[0]) => <span className="text-muted-foreground text-xs">{t.created}</span> },
  { key: 'actions', label: '', render: () => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="h-4 w-4" /></Button>
    </div>
  )},
];

const SupportTickets = () => (
  <div className="space-y-6 animate-fade-in">
    <PageHeader title="Support Tickets" description="Manage support requests from schools" />
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[{ label: 'Open', value: '2', color: 'text-warning' }, { label: 'In Progress', value: '1', color: 'text-info' }, { label: 'Resolved', value: '1', color: 'text-success' }, { label: 'Closed', value: '1', color: 'text-muted-foreground' }].map((s) => (
        <div key={s.label} className="stat-card text-center">
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-sm text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
    <DataTable columns={columns} data={mockTickets} searchKey="subject" searchPlaceholder="Search tickets..." />
  </div>
);

export default SupportTickets;
