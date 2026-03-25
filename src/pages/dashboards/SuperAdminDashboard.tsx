import { useState, useEffect } from 'react';
import StatCard from '@/components/shared/StatCard';
import { School, Users, GraduationCap, DollarSign, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { secureApiClient } from '@/lib/secureApiClient';

interface SystemStats {
  total_schools: number;
  total_students: number;
  total_teachers: number;
  total_admins: number;
  total_assignments: number;
}

interface RecentSchool {
  id: number;
  name: string;
  location?: string;
  enrollment_count: number;
  admin_count: number;
  teacher_count: number;
  status: 'active' | 'inactive' | 'pending';
}

interface SuperAdminDashboardData {
  superadmin: {
    id: number;
    user_id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  system_stats: SystemStats;
  recent_schools: RecentSchool[];
}

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await secureApiClient.get<SuperAdminDashboardData>('/auth/superadmin-dashboard/');
        setData(response);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Schools', 
      value: data.system_stats.total_schools.toString(), 
      icon: <School className="h-5 w-5" />, 
      color: 'text-secondary' 
    },
    { 
      label: 'Total Teachers', 
      value: data.system_stats.total_teachers.toString(), 
      icon: <Users className="h-5 w-5" />, 
      color: 'text-info' 
    },
    { 
      label: 'Total Students', 
      value: data.system_stats.total_students.toString(), 
      icon: <GraduationCap className="h-5 w-5" />, 
      color: 'text-success' 
    },
    { 
      label: 'Total Admins', 
      value: data.system_stats.total_admins.toString(), 
      icon: <DollarSign className="h-5 w-5" />, 
      color: 'text-accent' 
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management · {data.superadmin.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Schools Overview</h3>
            <Badge variant="outline" className="text-xs">{data.recent_schools.length} schools</Badge>
          </div>
          <div className="space-y-3">
            {data.recent_schools.length > 0 ? (
              data.recent_schools.map((school) => (
                <div key={school.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <School className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{school.name}</p>
                      <p className="text-xs text-muted-foreground">{school.enrollment_count} students · {school.teacher_count} teachers · {school.admin_count} admin(s)</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={school.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                    {school.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No schools found</p>
            )}
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4">System Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Assignments</span>
              <span className="font-semibold text-foreground">{data.system_stats.total_assignments}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Schools</span>
              <span className="font-semibold text-foreground">{data.system_stats.total_schools}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Teachers</span>
              <span className="font-semibold text-foreground">{data.system_stats.total_teachers}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Students</span>
              <span className="font-semibold text-foreground">{data.system_stats.total_students}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">School Admins</span>
              <span className="font-semibold text-foreground">{data.system_stats.total_admins}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-4">Super Admin Profile</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="text-foreground">{data.superadmin.name}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">Email:</span>
            <span className="text-foreground">{data.superadmin.email}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">Role:</span>
            <span className="text-foreground">{data.superadmin.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
