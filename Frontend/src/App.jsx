import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ✅ ADMIN TOKEN
import { getAdminToken } from "./helper/SessionHelper";
import { GetProfileDetails } from "./APIRequest/AdminAPIRequest";

import FullscreenLoader from "./components/MasterLayout/FullscreenLoader";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import LandingPage from "./pages/LandingPage";

// -------- ADMIN AUTH PAGES --------
import LoginPage from "./pages/Admin/LoginPage";
import RegistrationPage from "./pages/Admin/RegistrationPage";
import SendOTPPage from "./pages/Admin/SendOTPPage";
import VerifyOTPPage from "./pages/Admin/VerifyOTPPage";
import CreatePasswordPage from "./pages/Admin/CreatePasswordPage";
import ProfilePage from "./pages/Admin/ProfilePage";

// -------- MAIN PAGES --------
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DepartmentListPage from "./pages/Department/DepartmentListPage";
import DepartmentCreateUpdatePage from "./pages/Department/DepartmentCreateUpdatePage";
import SeasonRangeSetupPage from "./pages/Admission/SeasonRangeSetupPage";
import DepartmentRangeListPage from "./pages/Admission/DepartmentRangeListPage";

// Notice Page
import NoticePage from "./pages/Notice/NoticePage";

// ✅ ADMIN PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
  return getAdminToken() ? children : <Navigate to="/login" replace />;
};

const App = () => {

  // ✅ AUTO LOAD PROFILE IF TOKEN EXISTS
  useEffect(() => {
    if (getAdminToken()) {
      GetProfileDetails();
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* ---------- ROOT ---------- */}
          <Route
            path="/"
            element={
              getAdminToken()
                ? <Navigate to="/dashboard" replace />
                : <LandingPage />
            }
          />

          {/* ---------- PUBLIC ADMIN AUTH ---------- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/send-otp" element={<SendOTPPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/create-password" element={<CreatePasswordPage />} />

          {/* ---------- PROTECTED ADMIN ROUTES ---------- */}
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
            path="/department-list"
            element={
              <ProtectedRoute>
                <DepartmentListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/DepartmentCreateUpdatePage"
            element={
              <ProtectedRoute>
                <DepartmentCreateUpdatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/season-range"
            element={
              <ProtectedRoute>
                <SeasonRangeSetupPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admission-seasons"
            element={
              <ProtectedRoute>
                <DepartmentRangeListPage />
              </ProtectedRoute>
            }
          />

          <Route
  path="/notices"
  element={
    <ProtectedRoute>
      <NoticePage />
    </ProtectedRoute>
  }
/>


          {/* ---------- NOT FOUND ---------- */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>

      {/* ---------- GLOBAL COMPONENTS ---------- */}
      <FullscreenLoader />
      <Toaster position="top-center" />
    </>
  );
};

export default App;
