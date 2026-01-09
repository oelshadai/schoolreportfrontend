import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import LoginSelection from './pages/LoginSelection'
import RegisterSchool from './pages/RegisterSchool'
import PasswordReset from './pages/PasswordReset'
import Landing from './pages/Landing'
import Teachers from './pages/Teachers'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import EnterScores from './pages/EnterScores'
import Reports from './pages/Reports'
import Classes from './pages/Classes'
import Subjects from './pages/Subjects'
import SubjectsEnhanced from './pages/SubjectsEnhanced'
import SchoolSettings from './pages/SchoolSettings'
import TeacherRemarks from './pages/TeacherRemarks'
import ClassroomHub from './pages/ClassroomHub'
import StudentPortal from './pages/StudentPortal'
import StudentLogin from './pages/StudentLogin'
import StudentDashboard from './pages/StudentDashboard'
import VirtualClassroom from './pages/VirtualClassroom'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar-mobile-first'
import BottomNavigation from './components/BottomNavigation'
import ResponsiveLayout from './components/ResponsiveLayout'
import Attendance from './pages/Attendance'
import AttendanceDashboard from './pages/AttendanceDashboard'
import GradeBook from './pages/GradeBook'
import StudentDetails from './pages/StudentDetails'
import AssignmentView from './pages/AssignmentView'
import { NotificationProvider } from './components/NotificationSystem'
import { SidebarProvider } from './state/SidebarContext'
import NetworkStatus from './components/NetworkStatus'

export default function App() {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <div className="app">
          <NetworkStatus />
          <ResponsiveLayout>
            <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login-select" element={<LoginSelection showNavigation={false} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-school" element={<RegisterSchool />} />
        <Route path="/reset-password/:token" element={<PasswordReset />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-portal" element={<StudentLogin />} />
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student/assignment/:id" element={<AssignmentView />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <Classes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects-enhanced"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <SubjectsEnhanced />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scores"
          element={
            <ProtectedRoute roles={["TEACHER"]}>
              <EnterScores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom"
          element={
            <ProtectedRoute>
              <ClassroomHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <Teachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <SchoolSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute roles={["TEACHER"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-dashboard"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <AttendanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gradebook"
          element={
            <ProtectedRoute roles={["TEACHER"]}>
              <GradeBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-details"
          element={
            <ProtectedRoute roles={["TEACHER", "SCHOOL_ADMIN", "PRINCIPAL"]}>
              <StudentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vclass"
          element={
            <ProtectedRoute>
              <VirtualClassroom />
            </ProtectedRoute>
          }
        />
      </Routes>
            </ResponsiveLayout>
    </div>
    </NotificationProvider>
    </SidebarProvider>
  )
}
