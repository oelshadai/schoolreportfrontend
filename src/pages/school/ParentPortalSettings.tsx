import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Users, MessageSquare, Shield } from 'lucide-react';

const ParentPortalSettings = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Parent Portal Settings</h1>
      <p className="text-muted-foreground mt-1">Configure parent access and communication preferences</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-secondary" /><h3 className="font-semibold text-foreground">Access Settings</h3></div>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><Label>Enable Parent Portal</Label><p className="text-xs text-muted-foreground">Allow parents to access the portal</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><Label>View Grades</Label><p className="text-xs text-muted-foreground">Parents can view student grades</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><Label>View Attendance</Label><p className="text-xs text-muted-foreground">Parents can view attendance records</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><Label>View Report Cards</Label><p className="text-xs text-muted-foreground">Parents can download report cards</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><Label>View Fee Status</Label><p className="text-xs text-muted-foreground">Parents can see fee payment status</p></div><Switch /></div>
        </div>
      </div>

      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2 mb-2"><MessageSquare className="h-5 w-5 text-info" /><h3 className="font-semibold text-foreground">Communication</h3></div>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><Label>Message Teachers</Label><p className="text-xs text-muted-foreground">Parents can send messages to teachers</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><Label>Receive Announcements</Label><p className="text-xs text-muted-foreground">Parents receive school announcements</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><Label>SMS Notifications</Label><p className="text-xs text-muted-foreground">Send SMS for important updates</p></div><Switch /></div>
          <div><Label>Parent Support Email</Label><Input defaultValue="parents@elite.edu" className="mt-1" /></div>
        </div>
      </div>
    </div>

    <div className="flex justify-end"><Button><Save className="h-4 w-4 mr-2" />Save Settings</Button></div>
  </div>
);

export default ParentPortalSettings;
