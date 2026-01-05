import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import LoginSelection from './pages/LoginSelection'
import RegisterSchool from './pages/RegisterSchool'
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
import Navbar from './components/Navbar'
import MobileNav from './components/MobileNav'
import Attendance from './pages/Attendance'
import AttendanceDashboard from './pages/AttendanceDashboard'
import GradeBook from './pages/GradeBook'
import StudentDetails from './pages/StudentDetails'
import AssignmentView from './pages/AssignmentView'
import { NotificationProvider } from './components/NotificationSystem'
import NetworkStatus from './components/NetworkStatus'

export default function App() {
  return (
    <NotificationProvider>
      <div className="app">
        <NetworkStatus />
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login-select" element={<LoginSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-school" element={<RegisterSchool />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-portal" element={<StudentLogin />} />
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student/assignment/:id" element={<AssignmentView />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <Navbar />
              <Classes />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Navbar />
              <Students />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <Navbar />
              <Subjects />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects-enhanced"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <Navbar />
              <SubjectsEnhanced />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scores"
          element={
            <ProtectedRoute roles={["TEACHER"]}>
              <Navbar />
              <EnterScores />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom"
          element={
            <ProtectedRoute>
              <Navbar />
              <ClassroomHub />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <Navbar />
              <Teachers />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <Navbar />
              <SchoolSettings />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute roles={["TEACHER"]}>
              <Navbar />
              <Attendance />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-dashboard"
          element={
            <ProtectedRoute roles={["SCHOOL_ADMIN","PRINCIPAL"]}>
              <Navbar />
              <AttendanceDashboard />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gradebook"
          element={
            <ProtectedRoute roles={["TEACHER"]}>
              <Navbar />
              <GradeBook />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-details"
          element={
            <ProtectedRoute roles={["TEACHER", "SCHOOL_ADMIN", "PRINCIPAL"]}>
              <Navbar />
              <StudentDetails />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Navbar />
              <Reports />
              <MobileNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vclass"
          element={
            <ProtectedRoute>
              <Navbar />
              <VirtualClassroom />
              <MobileNav />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
    </NotificationProvider>
  )
}
