import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import secureApiClient from '@/lib/secureApiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const columns = [
  { key: 'full_name', label: 'Name', render: (t: any) => <span className="font-medium text-foreground">{t.full_name || `${t.first_name} ${t.last_name}`}</span> },
  { key: 'email', label: 'Email', render: (t: any) => <span className="text-muted-foreground">{t.email}</span> },
  { key: 'phone_number', label: 'Phone', render: (t: any) => <span className="text-muted-foreground text-xs">{t.phone_number}</span> },
  { key: 'assigned_class', label: 'Assigned Class', render: (t: any) => (
    <span className="text-muted-foreground text-xs">
      {t.assigned_class ? (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {t.assigned_class}
        </Badge>
      ) : (
        <span className="text-gray-400">No class assigned</span>
      )}
    </span>
  )},
  { key: 'specializations_detail', label: 'Subjects', render: (t: any) => <span className="text-muted-foreground text-xs">{t.specializations_detail?.map((s: any) => s.name).join(', ')}</span> },
  { key: 'is_active', label: 'Status', render: (t: any) => (
    <Badge variant="outline" className={t.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
      {t.is_active ? 'Active' : 'Inactive'}
    </Badge>
  )},
  { key: 'actions', label: '', render: (t: any, actions: any) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" title="View Teacher" onClick={() => alert(`View teacher ${t.full_name || t.email}`)}><Eye className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Teacher" onClick={() => alert(`Edit teacher ${t.full_name || t.email}`)}><Edit className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" title="Assign Class" onClick={() => actions?.handleAssignClass(t)}><UserPlus className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete Teacher" onClick={() => alert(`Delete teacher ${t.full_name || t.email}`)}><Trash2 className="h-4 w-4" /></Button>
    </div>
  )},
];

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await secureApiClient.get('/teachers/');
      const list = Array.isArray(response) ? response : response?.results || response?.data || [];
      setTeachers(list);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Add Teacher Modal State
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    hire_date: '',
    qualification: '',
    experience_years: '',
    emergency_contact: '',
    address: '',
    class_id: '',
    specializations: [],
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Assign Class Modal State
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [assigningClass, setAssigningClass] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

  const handleOpenDialog = () => {
    setForm({ 
      employee_id: '',
      first_name: '', 
      last_name: '', 
      email: '', 
      phone_number: '', 
      password: '',
      hire_date: '',
      qualification: '',
      experience_years: '',
      emergency_contact: '',
      address: '',
      class_id: '',
      specializations: [],
    });
    // Load classes and subjects
    secureApiClient.get('/schools/classes/').then(res => {
      const classList = res?.results || res || [];
      setClasses(classList);
    }).catch(() => setClasses([]));
    secureApiClient.get('/schools/subjects/').then(res => {
      const list = res?.results || res || [];
      setSubjects(Array.isArray(list) ? list : []);
    }).catch(() => setSubjects([]));
    setFormError(null);
    setShowDialog(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTeacher = async () => {
    setCreating(true);
    setFormError(null);
    
    try {
      if (!form.employee_id || !form.first_name || !form.last_name || !form.email || !form.password || !form.hire_date) {
        setFormError('Please fill all required fields (Employee ID, Name, Email, Password, Hire Date).');
        return;
      }
      
      await secureApiClient.post('/teachers/', {
        ...form,
        experience_years: form.experience_years ? parseInt(form.experience_years) : 0,
        specializations: form.specializations,
        class_id: form.class_id || null,
      });
      
      setShowDialog(false);
      await fetchTeachers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create teacher');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignClass = async (teacher: any) => {
    setSelectedTeacher(teacher);
    setSelectedClassId('');
    setAssignError(null);
    
    // Fetch available classes (only unassigned ones)
    try {
      const response = await secureApiClient.get('/schools/classes/');
      const classList = response?.results || response || [];
      // Filter out classes that already have a class teacher assigned
      const unassignedClasses = classList.filter((cls: any) => !cls.class_teacher);
      setAvailableClasses(unassignedClasses);
      
      if (unassignedClasses.length === 0) {
        setAssignError('No unassigned classes available');
      }
    } catch (error) {
      setAvailableClasses([]);
      setAssignError('Failed to load classes');
    }
    
    setShowAssignDialog(true);
  };

  const handleConfirmAssignClass = async () => {
    if (!selectedTeacher || !selectedClassId) {
      setAssignError('Please select a class');
      return;
    }

    setAssigningClass(true);
    setAssignError(null);

    try {
      const response = await secureApiClient.patch(`/teachers/${selectedTeacher.id}/assign_as_class_teacher/`, {
        class_id: selectedClassId
      });
      
      // Show success message
      const className = response.class_name || 'the selected class';
      alert(`Successfully assigned ${selectedTeacher.full_name || `${selectedTeacher.first_name} ${selectedTeacher.last_name}`} to ${className}`);
      
      setShowAssignDialog(false);
      await fetchTeachers(); // Refresh the teacher list
    } catch (error: any) {
      setAssignError(error.response?.data?.error || 'Failed to assign class');
    } finally {
      setAssigningClass(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Teachers Management" 
        description="Manage school teachers and their information"
        actionLabel="Add Teacher"
        onAction={handleOpenDialog}
      />
      
      {loading ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">Loading teachers...</div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">{error}</div>
      ) : (
        <DataTable 
          columns={columns} 
          data={teachers} 
          searchKey="full_name" 
          searchPlaceholder="Search teachers..." 
          actions={{ handleAssignClass }}
        />
      )}

      {/* Add Teacher Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Employee ID *</label>
                <Input value={form.employee_id} onChange={e => handleFormChange('employee_id', e.target.value)} placeholder="Employee ID" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Hire Date *</label>
                <Input value={form.hire_date} onChange={e => handleFormChange('hire_date', e.target.value)} placeholder="YYYY-MM-DD" type="date" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">First Name *</label>
                <Input value={form.first_name} onChange={e => handleFormChange('first_name', e.target.value)} placeholder="First Name" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Last Name *</label>
                <Input value={form.last_name} onChange={e => handleFormChange('last_name', e.target.value)} placeholder="Last Name" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Email *</label>
                <Input value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="Email" type="email" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Phone Number</label>
                <Input value={form.phone_number} onChange={e => handleFormChange('phone_number', e.target.value)} placeholder="Phone Number" />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Password *</label>
              <Input value={form.password} onChange={e => handleFormChange('password', e.target.value)} placeholder="Password" type="password" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Qualification</label>
                <Input value={form.qualification} onChange={e => handleFormChange('qualification', e.target.value)} placeholder="e.g., B.Ed, M.A" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Experience (Years)</label>
                <Input value={form.experience_years} onChange={e => handleFormChange('experience_years', e.target.value)} placeholder="0" type="number" min="0" />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Emergency Contact</label>
              <Input value={form.emergency_contact} onChange={e => handleFormChange('emergency_contact', e.target.value)} placeholder="Emergency Contact Number" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input value={form.address} onChange={e => handleFormChange('address', e.target.value)} placeholder="Home Address" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class Assignment</label>
              <select value={form.class_id} onChange={e => handleFormChange('class_id', e.target.value)} className="w-full border rounded p-2 bg-background text-foreground">
                <option value="">No Class</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || `${c.level} ${c.section || ''}`.trim()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subjects (Specializations)</label>
              <select multiple value={form.specializations} onChange={e => handleFormChange('specializations', Array.from(e.target.selectedOptions, option => option.value))} className="w-full border rounded p-2 bg-background text-foreground">
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {formError && <div className="text-destructive text-sm">{formError}</div>}
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTeacher} disabled={creating}>
              {creating ? <span className="mr-2">Creating...</span> : null}
              Add Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Class Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Class to Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Assigning class to: <span className="font-medium">{selectedTeacher?.full_name || `${selectedTeacher?.first_name} ${selectedTeacher?.last_name}`}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Class</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class to assign" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.full_name || `${cls.level} ${cls.section || ''}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {assignError && (
              <div className="text-destructive text-sm">{assignError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)} disabled={assigningClass}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAssignClass} disabled={assigningClass || !selectedClassId}>
              {assigningClass ? 'Assigning...' : 'Assign Class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeachersManagement;