import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import ChatPage from './pages/ChatPage';
import FilesPage from './pages/FilesPage';
import AIAssistantPage from './pages/AIAssistantPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/files"
          element={
            <ProtectedRoute>
              <FilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
