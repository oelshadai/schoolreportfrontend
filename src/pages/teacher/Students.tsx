import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Eye, UserCheck, UserX, Loader2 } from 'lucide-react';
import { secureApiClient } from '@/lib/secureApiClient';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  other_names: string;
  gender: string;
  date_of_birth: string;
  age: number;
  current_class: number;
  class_name: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  guardian_address: string;
  admission_date: string;
  is_active: boolean;
  username: string;
  password: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await secureApiClient.get('/students/');
      const data = Array.isArray(response) ? response : response.results || response.data || [];
      setStudents(data);
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load students", 
        variant: "destructive" 
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  const handleToggleStatus = async (student: Student) => {
    try {
      setActionLoading(true);
      // Backend toggles status on DELETE request for teachers
      await secureApiClient.delete(`/students/${student.id}/`);
      
      toast({ 
        title: "Success", 
        description: `Student ${student.is_active ? 'deactivated' : 'activated'} successfully` 
      });
      
      await fetchStudents();
    } catch (error: any) {
      console.error('Failed to toggle student status:', error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.detail || "Failed to update student status", 
        variant: "destructive" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { 
      key: 'student_id', 
      label: 'Student ID',
      render: (s: Student) => (
        <span className="font-medium text-foreground">{s.student_id}</span>
      )
    },
    { 
      key: 'full_name', 
      label: 'Full Name',
      render: (s: Student) => (
        <span className="font-medium text-foreground">{s.full_name}</span>
      )
    },
    { 
      key: 'gender', 
      label: 'Gender',
      render: (s: Student) => (
        <span className="text-sm text-muted-foreground">
          {s.gender === 'M' ? 'Male' : 'Female'}
        </span>
      )
    },
    { 
      key: 'age', 
      label: 'Age',
      render: (s: Student) => (
        <span className="text-sm text-muted-foreground">{s.age} years</span>
      )
    },
    { 
      key: 'class_name', 
      label: 'Class',
      render: (s: Student) => (
        <Badge variant="outline">{s.class_name || 'No Class'}</Badge>
      )
    },
    { 
      key: 'guardian_phone', 
      label: 'Guardian Phone',
      render: (s: Student) => (
        <span className="text-sm text-muted-foreground">{s.guardian_phone}</span>
      )
    },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (s: Student) => (
        <Badge variant={s.is_active ? "default" : "secondary"}>
          {s.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (s: Student) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleView(s)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleToggleStatus(s)}
            disabled={actionLoading}
            title={s.is_active ? 'Deactivate' : 'Activate'}
          >
            {s.is_active ? (
              <UserX className="h-4 w-4 text-destructive" />
            ) : (
              <UserCheck className="h-4 w-4 text-green-600" />
            )}
          </Button>
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Students" 
        description="View and manage students in your class"
      />
      
      {students.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No students found in your class.</p>
          <p className="text-sm mt-2">Students will appear here once they are assigned to your class.</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={students} 
          searchKey="full_name" 
          searchPlaceholder="Search students..." 
        />
      )}

      {/* View Student Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information about the student
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-medium text-foreground">{selectedStudent.student_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">{selectedStudent.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium text-foreground">
                      {selectedStudent.gender === 'M' ? 'Male' : 'Female'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedStudent.date_of_birth).toLocaleDateString()} ({selectedStudent.age} years)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="font-medium text-foreground">{selectedStudent.class_name || 'No Class'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admission Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedStudent.admission_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={selectedStudent.is_active ? "default" : "secondary"}>
                      {selectedStudent.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Guardian Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Guardian Name</p>
                    <p className="font-medium text-foreground">{selectedStudent.guardian_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{selectedStudent.guardian_phone}</p>
                  </div>
                  {selectedStudent.guardian_email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{selectedStudent.guardian_email}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{selectedStudent.guardian_address}</p>
                  </div>
                </div>
              </div>

              {/* Login Credentials */}
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Student Portal Access</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium text-foreground font-mono">{selectedStudent.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Password</p>
                    <p className="font-medium text-foreground font-mono">{selectedStudent.password}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share these credentials with the student for portal access
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
