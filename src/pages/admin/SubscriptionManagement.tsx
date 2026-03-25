import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, CreditCard } from 'lucide-react';

const mockSubscriptions = [
  { id: 1, school: 'Elite Academy', plan: 'Premium', amount: '$99/mo', startDate: '2024-09-01', endDate: '2025-09-01', status: 'active' },
  { id: 2, school: 'Bright Future School', plan: 'Basic', amount: '$49/mo', startDate: '2024-10-15', endDate: '2025-10-15', status: 'active' },
  { id: 3, school: 'Golden Star Academy', plan: 'Free Trial', amount: '$0', startDate: '2025-02-01', endDate: '2025-03-01', status: 'trial' },
  { id: 4, school: 'Excellence College', plan: 'Premium', amount: '$99/mo', startDate: '2024-06-01', endDate: '2025-06-01', status: 'active' },
  { id: 5, school: 'Pioneer School', plan: 'Basic', amount: '$49/mo', startDate: '2024-08-01', endDate: '2025-08-01', status: 'expired' },
];

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  trial: 'bg-warning/10 text-warning border-warning/20',
  expired: 'bg-destructive/10 text-destructive border-destructive/20',
};

const columns = [
  { key: 'school', label: 'School', render: (s: typeof mockSubscriptions[0]) => <span className="font-medium text-foreground">{s.school}</span> },
  { key: 'plan', label: 'Plan', render: (s: typeof mockSubscriptions[0]) => <Badge variant="outline">{s.plan}</Badge> },
  { key: 'amount', label: 'Amount', render: (s: typeof mockSubscriptions[0]) => <span className="font-medium text-foreground">{s.amount}</span> },
  { key: 'startDate', label: 'Start Date', render: (s: typeof mockSubscriptions[0]) => <span className="text-muted-foreground">{s.startDate}</span> },
  { key: 'endDate', label: 'End Date', render: (s: typeof mockSubscriptions[0]) => <span className="text-muted-foreground">{s.endDate}</span> },
  { key: 'status', label: 'Status', render: (s: typeof mockSubscriptions[0]) => <Badge variant="outline" className={statusColors[s.status]}>{s.status}</Badge> },
  { key: 'actions', label: 'Actions', render: () => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8"><CreditCard className="h-4 w-4" /></Button>
    </div>
  )},
];

const SubscriptionManagement = () => (
  <div className="space-y-6 animate-fade-in">
    <PageHeader title="Subscription Management" description="Manage school subscriptions and billing" actionLabel="Add Plan" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[{ label: 'Monthly Revenue', value: '$2,450', sub: '22 active subscriptions' }, { label: 'Trial Schools', value: '3', sub: 'Expiring soon' }, { label: 'Churn Rate', value: '2.1%', sub: 'Last 30 days' }].map((s) => (
        <div key={s.label} className="stat-card">
          <p className="text-sm text-muted-foreground">{s.label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
        </div>
      ))}
    </div>
    <DataTable columns={columns} data={mockSubscriptions} searchKey="school" searchPlaceholder="Search subscriptions..." />
  </div>
);

export default SubscriptionManagement;
