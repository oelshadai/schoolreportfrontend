import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { secureApiClient } from '@/lib/secureApiClient';
import { toast } from 'sonner';
import {
  User, GraduationCap, Shield, Loader2, AlertCircle,
  RefreshCw, Eye, EyeOff, Save, Phone, Mail
} from 'lucide-react';

interface StudentData {
  name: string;
  first_name: string;
  last_name: string;
  student_id: string;
  email: string | null;
  class: string;
  gender: string;
  date_of_birth: string | null;
  school: string | null;
  photo: string | null;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string | null;
  admission_date: string | null;
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground text-right max-w-[55%] break-words">{value || '—'}</span>
  </div>
);

const StudentProfile = () => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await secureApiClient.get('/students/auth/dashboard/');
      setStudent(res?.student ?? null);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPw.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPw(true);
    try {
      await secureApiClient.post('/students/auth/change-password/', {
        current_password: currentPw,
        new_password: newPw,
      });
      toast.success('Password updated successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-center text-sm text-muted-foreground">{error ?? 'Profile not found'}</p>
        <Button onClick={() => fetchData()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">My Profile</h1>
            <p className="text-xs text-muted-foreground">Student information</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => fetchData(true)} disabled={refreshing} className="h-9 w-9">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4">
          {student.photo ? (
            <img src={student.photo} alt={student.name} className="h-16 w-16 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary">{initials(student.name)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground truncate">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.school ?? 'School'}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge className="bg-primary/10 text-primary border-0 text-[10px]">{student.student_id}</Badge>
              <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">{student.class}</Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Active</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Personal Information</p>
        </div>
        <Row label="Full Name" value={student.name} />
        <Row label="Student ID" value={student.student_id} />
        <Row label="Gender" value={student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender} />
        <Row label="Date of Birth" value={formatDate(student.date_of_birth)} />
        {student.email && <Row label="Email" value={student.email} />}
        <Row label="Admission Date" value={formatDate(student.admission_date)} />
      </div>

      {/* Academic details */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Academic Details</p>
        </div>
        <Row label="School" value={student.school ?? '—'} />
        <Row label="Class" value={student.class} />
      </div>

      {/* Guardian info */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Phone className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Guardian Information</p>
        </div>
        <Row label="Name" value={student.guardian_name} />
        <Row label="Phone" value={student.guardian_phone} />
        {student.guardian_email && <Row label="Email" value={student.guardian_email} />}
      </div>

      {/* Change password */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Change Password</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Current Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPw ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className="pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPw(v => !v)}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">New Password</Label>
            <Input
              type={showPw ? 'text' : 'password'}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              className="mt-1"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
            <Input
              type={showPw ? 'text' : 'password'}
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="mt-1"
              placeholder="Repeat new password"
            />
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleChangePassword}
            disabled={savingPw || !currentPw || !newPw || !confirmPw}
          >
            {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingPw ? 'Updating…' : 'Update Password'}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default StudentProfile;
