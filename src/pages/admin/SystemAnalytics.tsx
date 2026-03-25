import StatCard from '@/components/shared/StatCard';
import { BarChart3, Users, School, TrendingUp, Activity, Globe } from 'lucide-react';

const metrics = [
  { label: 'Total Logins (30d)', value: '8,234', icon: <Activity className="h-5 w-5" />, color: 'text-secondary', trend: '+12% vs last month' },
  { label: 'Active Users', value: '1,456', icon: <Users className="h-5 w-5" />, color: 'text-info' },
  { label: 'Assignments Created', value: '342', icon: <BarChart3 className="h-5 w-5" />, color: 'text-success', trend: '+23% vs last month' },
  { label: 'Reports Generated', value: '89', icon: <TrendingUp className="h-5 w-5" />, color: 'text-accent' },
];

const topSchools = [
  { name: 'Elite Academy', score: 92, students: 245 },
  { name: 'Excellence College', score: 88, students: 310 },
  { name: 'Bright Future School', score: 85, students: 180 },
  { name: 'Heritage International', score: 82, students: 198 },
  { name: 'Golden Star Academy', score: 78, students: 120 },
];

const usageByRole = [
  { role: 'Students', percentage: 62, count: '2,383' },
  { role: 'Teachers', percentage: 25, count: '186' },
  { role: 'School Admins', percentage: 10, count: '24' },
  { role: 'Super Admins', percentage: 3, count: '3' },
];

const SystemAnalytics = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">System Analytics</h1>
      <p className="text-muted-foreground mt-1">Platform-wide analytics and performance metrics</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => <StatCard key={m.label} {...m} />)}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-4">Top Performing Schools</h3>
        <div className="space-y-3">
          {topSchools.map((school, i) => (
            <div key={school.name} className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{school.name}</span>
                  <span className="text-sm text-muted-foreground">{school.score}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${school.score}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-4">Usage by Role</h3>
        <div className="space-y-4">
          {usageByRole.map((item) => (
            <div key={item.role}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{item.role}</span>
                <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-info rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-3">Platform Growth</h3>
        <div className="space-y-2">
          {[{ label: 'New Schools (30d)', value: '+3' }, { label: 'New Users (30d)', value: '+168' }, { label: 'Retention Rate', value: '94%' }].map((m) => (
            <div key={m.label} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-medium text-foreground">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-3">Server Performance</h3>
        <div className="space-y-2">
          {[{ label: 'CPU Usage', value: '34%' }, { label: 'Memory', value: '62%' }, { label: 'Storage', value: '45%' }].map((m) => (
            <div key={m.label} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-medium text-foreground">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-3">API Statistics</h3>
        <div className="space-y-2">
          {[{ label: 'Total Requests (24h)', value: '45.2K' }, { label: 'Avg Latency', value: '120ms' }, { label: 'Error Rate', value: '0.02%' }].map((m) => (
            <div key={m.label} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-medium text-foreground">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SystemAnalytics;
