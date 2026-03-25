import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';

const mockSchools = [
  { id: 1, name: 'Elite Academy', email: 'admin@elite.edu', location: 'Accra', students: 245, teachers: 18, plan: 'Premium', status: 'active' },
  { id: 2, name: 'Bright Future School', email: 'info@brightfuture.edu', location: 'Kumasi', students: 180, teachers: 12, plan: 'Basic', status: 'active' },
  { id: 3, name: 'Golden Star Academy', email: 'contact@goldenstar.edu', location: 'Tamale', students: 120, teachers: 8, plan: 'Free Trial', status: 'pending' },
  { id: 4, name: 'Excellence College', email: 'admin@excellence.edu', location: 'Cape Coast', students: 310, teachers: 22, plan: 'Premium', status: 'active' },
  { id: 5, name: 'Heritage International', email: 'info@heritage.edu', location: 'Accra', students: 198, teachers: 15, plan: 'Basic', status: 'active' },
  { id: 6, name: 'Pioneer School', email: 'admin@pioneer.edu', location: 'Takoradi', students: 95, teachers: 7, plan: 'Free Trial', status: 'suspended' },
];

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

const columns = [
  { key: 'name', label: 'School Name', render: (s: typeof mockSchools[0]) => <span className="font-medium text-foreground">{s.name}</span> },
  { key: 'email', label: 'Email', render: (s: typeof mockSchools[0]) => <span className="text-muted-foreground">{s.email}</span> },
  { key: 'location', label: 'Location', render: (s: typeof mockSchools[0]) => <span className="text-muted-foreground">{s.location}</span> },
  { key: 'students', label: 'Students', render: (s: typeof mockSchools[0]) => <span className="text-foreground">{s.students}</span> },
  { key: 'teachers', label: 'Teachers', render: (s: typeof mockSchools[0]) => <span className="text-foreground">{s.teachers}</span> },
  { key: 'plan', label: 'Plan', render: (s: typeof mockSchools[0]) => <Badge variant="outline">{s.plan}</Badge> },
  { key: 'status', label: 'Status', render: (s: typeof mockSchools[0]) => <Badge variant="outline" className={statusColors[s.status]}>{s.status}</Badge> },
  { key: 'actions', label: 'Actions', render: () => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
    </div>
  )},
];

const SchoolsManagement = () => (
  <div className="space-y-6 animate-fade-in">
    <PageHeader title="Schools Management" description="Create and manage schools on the platform" actionLabel="Add School" />
    <DataTable columns={columns} data={mockSchools} searchKey="name" searchPlaceholder="Search schools..." />
  </div>
);

export default SchoolsManagement;
