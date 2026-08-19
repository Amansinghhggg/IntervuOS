import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../ui/shared/ProtectedRoute";
import SelectRolePage from "../features/auth/SelectRolePage";
import EmployerDashboard from "../features/employer/EmployerDashboard";
import EmployerVerificationPage from "../features/employer/EmployerVerificationPage";
import EmployerLayout from "../features/employer/EmployerLayout";
import CandidateDashboard from "../features/candidate/CandidateDashboard";
import CreateInterviewPage from "../features/employer/CreateInterviewPage";
import EditInterviewPage from "../features/employer/EditInterviewPage";
import InterviewDetailsPage from "../features/employer/InterviewDetailsPage";
import InterviewInstructionsPage from "../features/candidate/InterviewInstructionsPage";
import CandidateLayout from "../features/candidate/CandidateLayout";
import LiveInterviewPage from "../features/interview/LiveInterviewPage";
import EmployerInterviewResultPage from "../features/employer/EmployerInterviewResultPage";
import VoiceTestPage from "../features/interview/VoiceTestPage";
import AvatarTestPage from "../features/interview/AvatarTestPage";
import HowItWorksPage from "../features/employer/HowItWorksPage";
import ProfilePage from "../features/shared/ProfilePage";
import MockInterviewPage from "../features/candidate/MockInterviewPage";
import CandidateSubscriptionsPage from "../features/candidate/CandidateSubscriptionsPage";
import CandidateHelpSupportPage from "../features/candidate/CandidateHelpSupportPage";
import MockReportsPage from "../features/candidate/MockReportsPage";
import AdminLayout from "../features/admin/AdminLayout";
import AdminDashboardPage from "../features/admin/AdminDashboardPage";
import CandidateLandingPage from "../features/marketing/CandidateLandingPage";
import EmployerLandingPage from "../features/marketing/EmployerLandingPage";
import { Loader2 } from "lucide-react";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
          <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const getRoleDefaultRoute = () => {
    if (!user?.role) return "/select-role";
    if (user.role === "admin") return "/admin";
    if (user.role === "employer") return "/employer/dashboard";
    return "/candidate/mock-interview";
  };

  const getRedirectRoute = () => {
    return location.state?.from || getRoleDefaultRoute();
  };

  return (
    <>
      <Routes>
        {/* Test Route */}
        <Route path="/test/voice" element={<VoiceTestPage />} />
        <Route path="/test/avatar" element={<AvatarTestPage />} />

        {/* Public Dedicated Landing Routes */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={getRoleDefaultRoute()} replace />
            ) : (
              <CandidateLandingPage />
            )
          }
        />
        <Route
          path="/employers"
          element={
            user ? (
              <Navigate to={getRoleDefaultRoute()} replace />
            ) : (
              <EmployerLandingPage />
            )
          }
        />
        <Route path="/candidates" element={<Navigate to="/" replace />} />
        <Route path="/for-candidates" element={<Navigate to="/" replace />} />
        <Route path="/for-business" element={<Navigate to="/employers" replace />} />
        <Route path="/business" element={<Navigate to="/employers" replace />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={getRedirectRoute()} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to={getRedirectRoute()} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Compulsory Role Selection Route */}
        <Route path="/select-role" element={<SelectRolePage />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/campaigns/:id/edit" element={<EditInterviewPage />} />
        </Route>

        {/* Employer Routes */}
        <Route element={<ProtectedRoute role="employer"><EmployerLayout /></ProtectedRoute>}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/how-it-works" element={<HowItWorksPage />} />
          <Route path="/employer/contact" element={<EmployerVerificationPage />} />
          <Route path="/employer/create-interview" element={<CreateInterviewPage />} />
          <Route path="/employer/interviews/:id/edit" element={<EditInterviewPage />} />
          <Route path="/employer/interviews/:id" element={<InterviewDetailsPage />} />
          <Route path="/employer/interviews/:id/results/:resultId" element={<EmployerInterviewResultPage />} />
          <Route path="/employer/profile" element={<ProfilePage />} />
        </Route>

        {/* Candidate Routes */}
        <Route element={<ProtectedRoute role="candidate"><CandidateLayout /></ProtectedRoute>}>
          <Route path="/candidate" element={<Navigate to="/candidate/mock-interview" replace />} />
          <Route path="/candidate/mock-interview" element={<MockInterviewPage />} />
          <Route path="/candidate/mock-reports" element={<MockReportsPage />} />
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/join" element={<Navigate to="/candidate/dashboard" replace />} />
          <Route path="/candidate/interviews/:id" element={<InterviewInstructionsPage />} />
          <Route path="/candidate/subscriptions" element={<CandidateSubscriptionsPage />} />
          <Route path="/candidate/help" element={<CandidateHelpSupportPage />} />
          <Route path="/candidate/profile" element={<ProfilePage />} />
        </Route>
        <Route
          path="/candidate/interviews/:id/live"
          element={
            <ProtectedRoute role="candidate">
              <LiveInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/mock-interview/:id/live"
          element={
            <ProtectedRoute role="candidate">
              <LiveInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/mock-interview/:id/prepare"
          element={
            <ProtectedRoute role="candidate">
              <LiveInterviewPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
