import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import AdminSignup from './pages/AdminSignup';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminStudentAdd from './pages/AdminStudentAdd';
import AdminStudentView from './pages/AdminStudentView';
import AdminStudentEdit from './pages/AdminStudentEdit';
import StudentProfile from './pages/StudentProfile';
import AdminProfile from './pages/AdminProfile';
import StudentFees from './pages/StudentFees';
import AdminFees from './pages/AdminFees';
import StudentAttendance from './pages/StudentAttendance';
import AdminAttendance from './pages/AdminAttendance';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/select-role" element={<RoleSelection />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/student-signup" element={<StudentSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route element={<ProtectedRoute allowedRole="student" />}>
                <Route path="/student" element={<DashboardLayout role="student" />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="fees" element={<StudentFees />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="attendance" element={<StudentAttendance />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route path="/admin" element={<DashboardLayout role="admin" />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="students/add" element={<AdminStudentAdd />} />
                  <Route path="students/view/:id" element={<AdminStudentView />} />
                  <Route path="students/edit/:id" element={<AdminStudentEdit />} />
                  <Route path="fees" element={<AdminFees />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
