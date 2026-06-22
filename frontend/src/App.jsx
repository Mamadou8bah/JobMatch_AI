import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/auth.css";
import "./styles/dashboard.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminJobs from "./pages/admin/AdminJobs.jsx";
import AdminApplications from "./pages/admin/AdminApplications.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminAiConfig from "./pages/admin/AdminAiConfig.jsx";
import AdminTraining from "./pages/admin/AdminTraining.jsx";

import EmployerLayout from "./pages/employer/EmployerLayout.jsx";
import EmployerOverview from "./pages/employer/EmployerOverview.jsx";
import EmployerPostJob from "./pages/employer/EmployerPostJob.jsx";
import EmployerJobs from "./pages/employer/EmployerJobs.jsx";
import EmployerEditJob from "./pages/employer/EmployerEditJob.jsx";
import EmployerCandidates from "./pages/employer/EmployerCandidates.jsx";
import EmployerRanking from "./pages/employer/EmployerRanking.jsx";
import EmployerAnalytics from "./pages/employer/EmployerAnalytics.jsx";
import EmployerProfile from "./pages/employer/EmployerProfile.jsx";

import SeekerLayout from "./pages/seeker/SeekerLayout.jsx";
import SeekerOverview from "./pages/seeker/SeekerOverview.jsx";
import SeekerProfile from "./pages/seeker/SeekerProfile.jsx";
import SeekerRecommendations from "./pages/seeker/SeekerRecommendations.jsx";
import SeekerApplications from "./pages/seeker/SeekerApplications.jsx";
import SeekerTraining from "./pages/seeker/SeekerTraining.jsx";
import SeekerCareerCoach from "./pages/seeker/SeekerCareerCoach.jsx";

import Notifications from "./pages/shared/Notifications.jsx";
import Messages from "./pages/shared/Messages.jsx";

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="training" element={<AdminTraining />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="ai-config" element={<AdminAiConfig />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployerOverview />} />
          <Route path="post" element={<EmployerPostJob />} />
          <Route path="jobs" element={<EmployerJobs />} />
          <Route path="jobs/:id/edit" element={<EmployerEditJob />} />
          <Route path="candidates" element={<EmployerCandidates />} />
          <Route path="ranking" element={<EmployerRanking />} />
          <Route path="analytics" element={<EmployerAnalytics />} />
          <Route path="profile" element={<EmployerProfile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        <Route
          path="/seeker"
          element={
            <ProtectedRoute allowedRoles={["job_seeker"]}>
              <SeekerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SeekerOverview />} />
          <Route path="profile" element={<SeekerProfile />} />
          <Route path="recommendations" element={<SeekerRecommendations />} />
          <Route path="applications" element={<SeekerApplications />} />
          <Route path="training" element={<SeekerTraining />} />
          <Route path="coach" element={<SeekerCareerCoach />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
