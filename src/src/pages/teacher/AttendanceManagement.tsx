import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, XCircle, Clock, Users, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { secureApiClient } from "@/lib/secureApiClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: number;
  student_id: string;
  name: string;
  photo?: string;
  current_status: 'present' | 'absent' | 'late';
}

interface Class {
  id: number;
  name: string;
  level: string;
  student_count: number;
  attendance_taken_today: boolean;
}

const AttendanceManagement = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [attendanceAlreadyTaken, setAttendanceAlreadyTaken] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      const response = await secureApiClient.get("/students/teacher-attendance/my-classes/");
      const classesData = response.classes || [];
      setClasses(classesData);
      
      // Auto-select the first class if only one
      if (classesData.length === 1) {
        setSelectedClass(classesData[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load your assigned classes. You may not be assigned as a class teacher.", 
        variant: "destructive" 
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const response = await secureApiClient.get(
        `/students/teacher-attendance/class-students/?class_id=${selectedClass}&date=${dateStr}`
      );
      
      setStudents(response.students || []);
      setAttendanceAlreadyTaken(response.attendance_already_taken || false);
      
      // Set initial attendance state from existing records
      const initialAttendance: Record<number, string> = {};
      response.students?.forEach((student: Student) => {
        initialAttendance[student.id] = student.current_status;
      });
      setAttendance(initialAttendance);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
    }
  };

  const markAttendance = (studentId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const allPresentAttendance: Record<number, string> = {};
    students.forEach(student => {
      allPresentAttendance[student.id] = 'present';
    });
    setAttendance(allPresentAttendance);
  };

  const markAllAbsent = () => {
    const allAbsentAttendance: Record<number, string> = {};
    students.forEach(student => {
      allAbsentAttendance[student.id] = 'absent';
    });
    setAttendance(allAbsentAttendance);
  };

  const saveAttendance = async () => {
    if (!selectedClass) {
      toast({ title: "Error", description: "Please select a class", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const attendanceData = students.map(student => ({
        student_id: student.id,
        status: attendance[student.id] || 'absent'
      }));

      const response = await secureApiClient.post("/students/teacher-attendance/save-attendance/", {
        class_id: parseInt(selectedClass),
        date: format(date, "yyyy-MM-dd"),
        attendance: attendanceData
      });

      toast({ 
        title: "Success", 
        description: `Attendance saved successfully. ${response.saved_count} new records, ${response.updated_count} updated.`
      });
      
      // Refresh classes to update attendance status
      fetchClasses();
      setAttendanceAlreadyTaken(true);
      
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || "Failed to save attendance", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceSummary = () => {
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const late = Object.values(attendance).filter(status => status === 'late').length;
    const total = students.length;
    
    return { present, absent, late, total };
  };

  const summary = getAttendanceSummary();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Class Attendance Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Take attendance for your assigned classes. Attendance data is saved permanently.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              {classes.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 border rounded-md">
                  No classes assigned. Only class teachers can take attendance.
                </div>
              ) : (
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{cls.name}</span>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge variant="outline">{cls.student_count} students</Badge>
                            {cls.attendance_taken_today && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Taken
                              </Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={(d) => d && setDate(d)}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedClass && students.length > 0 && (
            <>
              {/* Attendance Summary */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{summary.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
                  <p className="text-sm text-muted-foreground">Late</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={markAllPresent}>
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" onClick={markAllAbsent}>
                  Mark All Absent
                </Button>
                {attendanceAlreadyTaken && (
                  <Badge variant="secondary" className="ml-auto">
                    Attendance already taken for this date
                  </Badge>
                )}
              </div>

              {/* Student List */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Student ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{student.student_id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {student.photo && (
                              <img 
                                src={student.photo} 
                                alt={student.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <span className="text-sm">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant={attendance[student.id] === "present" ? "default" : "outline"}
                              onClick={() => markAttendance(student.id, "present")}
                              className={attendance[student.id] === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance[student.id] === "absent" ? "destructive" : "outline"}
                              onClick={() => markAttendance(student.id, "absent")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance[student.id] === "late" ? "secondary" : "outline"}
                              onClick={() => markAttendance(student.id, "late")}
                              className={attendance[student.id] === "late" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button 
                onClick={saveAttendance} 
                disabled={loading || students.length === 0} 
                className="w-full"
                size="lg"
              >
                {loading ? "Saving..." : "Save Attendance"}
              </Button>
            </>
          )}
          
          {classes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Classes Assigned</p>
              <p className="text-sm">You are not assigned as a class teacher.</p>
              <p className="text-sm">Only class teachers can take attendance for their classes.</p>
            </div>
          )}
          
          {selectedClass && students.length === 0 && classes.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found in this class</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
