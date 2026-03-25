import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Shield } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'John Admin', email: 'john@elite.edu', role: 'SCHOOL_ADMIN', school: 'Elite Academy', status: 'active', lastLogin: '2025-02-15' },
  { id: 2, name: 'Mary Teacher', email: 'mary@elite.edu', role: 'TEACHER', school: 'Elite Academy', status: 'active', lastLogin: '2025-02-16' },
  { id: 3, name: 'James Principal', email: 'james@bright.edu', role: 'PRINCIPAL', school: 'Bright Future', status: 'active', lastLogin: '2025-02-14' },
  { id: 4, name: 'Sarah Teacher', email: 'sarah@golden.edu', role: 'TEACHER', school: 'Golden Star', status: 'inactive', lastLogin: '2025-01-20' },
  { id: 5, name: 'Admin Super', email: 'super@system.edu', role: 'SUPER_ADMIN', school: 'System', status: 'active', lastLogin: '2025-02-17' },
  { id: 6, name: 'Tom Teacher', email: 'tom@excellence.edu', role: 'TEACHER', school: 'Excellence College', status: 'active', lastLogin: '2025-02-16' },
];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-destructive/10 text-destructive border-destructive/20',
  SCHOOL_ADMIN: 'bg-info/10 text-info border-info/20',
  PRINCIPAL: 'bg-accent/10 text-accent border-accent/20',
  TEACHER: 'bg-success/10 text-success border-success/20',
  STUDENT: 'bg-secondary/10 text-secondary border-secondary/20',
};

const columns = [
  { key: 'name', label: 'Name', render: (u: typeof mockUsers[0]) => <span className="font-medium text-foreground">{u.name}</span> },
  { key: 'email', label: 'Email', render: (u: typeof mockUsers[0]) => <span className="text-muted-foreground">{u.email}</span> },
  { key: 'role', label: 'Role', render: (u: typeof mockUsers[0]) => <Badge variant="outline" className={roleColors[u.role]}>{u.role.replace('_', ' ')}</Badge> },
  { key: 'school', label: 'School', render: (u: typeof mockUsers[0]) => <span className="text-muted-foreground">{u.school}</span> },
  { key: 'status', label: 'Status', render: (u: typeof mockUsers[0]) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{u.status}</span>
  )},
  { key: 'lastLogin', label: 'Last Login', render: (u: typeof mockUsers[0]) => <span className="text-muted-foreground text-xs">{u.lastLogin}</span> },
  { key: 'actions', label: 'Actions', render: () => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8"><Shield className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
    </div>
  )},
];

const UsersManagement = () => (
  <div className="space-y-6 animate-fade-in">
    <PageHeader title="Users Management" description="Manage users across all schools" actionLabel="Add User" />
    <DataTable columns={columns} data={mockUsers} searchKey="name" searchPlaceholder="Search users..." />
  </div>
);

export default UsersManagement;
