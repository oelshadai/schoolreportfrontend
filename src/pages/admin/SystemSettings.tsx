import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Globe, Mail, Shield, Database } from 'lucide-react';

const SystemSettings = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
      <p className="text-muted-foreground mt-1">Configure platform-wide settings</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-secondary" />
          <h3 className="font-semibold text-foreground">General Settings</h3>
        </div>
        <div className="space-y-3">
          <div><Label>Platform Name</Label><Input defaultValue="School Report SaaS" className="mt-1" /></div>
          <div><Label>Support Email</Label><Input defaultValue="support@schoolreport.com" className="mt-1" /></div>
          <div><Label>Default Language</Label><Input defaultValue="English" className="mt-1" /></div>
        </div>
      </div>

      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-info" />
          <h3 className="font-semibold text-foreground">Email Settings</h3>
        </div>
        <div className="space-y-3">
          <div><Label>SMTP Host</Label><Input defaultValue="smtp.gmail.com" className="mt-1" /></div>
          <div><Label>SMTP Port</Label><Input defaultValue="587" className="mt-1" /></div>
          <div><Label>Sender Email</Label><Input defaultValue="noreply@schoolreport.com" className="mt-1" /></div>
        </div>
      </div>

      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><Label>Two-Factor Authentication</Label><p className="text-xs text-muted-foreground">Require 2FA for admin users</p></div><Switch /></div>
          <div className="flex items-center justify-between"><div><Label>Session Timeout</Label><p className="text-xs text-muted-foreground">Auto-logout after inactivity</p></div><Switch defaultChecked /></div>
          <div><Label>Session Duration (minutes)</Label><Input defaultValue="30" type="number" className="mt-1" /></div>
        </div>
      </div>

      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-success" />
          <h3 className="font-semibold text-foreground">Data Management</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><Label>Auto Backup</Label><p className="text-xs text-muted-foreground">Daily automated backups</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><Label>Data Retention</Label><p className="text-xs text-muted-foreground">Keep logs for 90 days</p></div><Switch defaultChecked /></div>
          <div><Label>Backup Frequency</Label><Input defaultValue="Daily" className="mt-1" /></div>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <Button><Save className="h-4 w-4 mr-2" />Save Settings</Button>
    </div>
  </div>
);

export default SystemSettings;
