import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import LoginSelection from './pages/LoginSelection'
import RegisterSchool from './pages/RegisterSchool'
import PasswordReset from './pages/PasswordReset'
import ProfessionalLanding from './pages/ProfessionalLanding'
import FeaturesPage from './pages/FeaturesPage'
import Teachers from './pages/Teachers'
import DashboardProduction from './pages/DashboardProduction'
import Students from './pages/Students'
import EnterScores from './pages/EnterScores'
import Reports from './pages/Reports'
import Classes from './pages/Classes'
import Subjects from './pages/Subjects'
import SubjectsEnhanced from './pages/SubjectsEnhanced'
import SchoolSettings from './pages/SchoolSettings'
import TeacherSchedule from './pages/TeacherSchedule'
import TeacherRemarks from './pages/TeacherRemarks'
import ClassroomHub from './pages/ClassroomHub'
import StudentPortal from './pages/StudentPortal'
import StudentPortalNew from './pages/StudentPortalNew'
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
import TerminalReports from './pages/TerminalReports'
import AssignmentView from './pages/AssignmentView'
import { NotificationProvider } from './components/NotificationSystem'
import { SidebarProvider } from './state/SidebarContext'
import NetworkStatus from './components/NetworkStatus'

export default function App() {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <div className="app" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, background: '#ffffff' }}>
          <NetworkStatus />
          <ResponsiveLayout>
            <Routes>
        <Route path="/" element={<ProfessionalLanding />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/login-select" element={<LoginSelection showNavigation={false} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-school" element={<RegisterSchool />} />
        <Route path="/reset-password/:token" element={<PasswordReset />} />
        <Route path="/student-portal" element={<StudentPortalNew />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentPortalNew />} />
        <Route path="/student/assignment/:id" element={<AssignmentView />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardProduction />
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
          path="/terminal-reports"
          element={
            <ProtectedRoute roles={["TEACHER", "SCHOOL_ADMIN", "PRINCIPAL"]}>
              <TerminalReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-schedule"
          element={
            <ProtectedRoute roles={["TEACHER"]}>
              <TeacherSchedule />
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
