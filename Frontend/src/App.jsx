import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ✅ ADMIN TOKEN
import { getAdminToken,getToken  } from "./helper/SessionHelper";
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

// -------- Users AUTH PAGES --------
import UserLoginPage from "./pages/Users/UserLoginPage";
import UserRegistrationPage from "./pages/Users/UserRegistrationPage";
import UserSendOTPPage from "./pages/Users/UserSendOTPPage";
import UserVerifyOTPPage from "./pages/Users/UserVerifyOTPPage";
import UserCreatePasswordPage from "./pages/Users/UserCreatePasswordPage";
import UserProfilePage from "./pages/Users/UserProfilePage";
import UserDashboardPage from "./pages/Users/UserDashboardPage";

import AdminCreateUserPage from "./pages/Users/AdminCreateUserPage";
import AdminUsersListPage from "./pages/Users/AdminUsersListPage";
import AdminTnureListPage from "./pages/Admin/AdminTnureListPage";

// -------- MAIN PAGES --------
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DepartmentListPage from "./pages/Department/DepartmentListPage";
import DepartmentCreateUpdatePage from "./pages/Department/DepartmentCreateUpdatePage";
import SeasonRangeSetupPage from "./pages/Admission/SeasonRangeSetupPage";
import DepartmentRangeListPage from "./pages/Admission/DepartmentRangeListPage";
import HallListPage from "./pages/Hall/HallListPage";
import HallCreateUpdatePage from "./pages/Hall/HallCreateUpdatePage";

import DeanUsersListPage from "./pages/Dean/DeanUsersListPage";
import ChairmanTenurePage from "./pages/Dean/ChairmanTenurePage";
import ChairmanSupervisorsListPage from "./pages/Chairman/ChairmanSupervisorsListPage";
import ChairmanDecisionBlueprintListPage from "./pages/Chairman/ChairmanDecisionBlueprintListPage";

// Notice Page
import NoticePage from "./pages/Notice/NoticePage";
import PublicNoticeListPage from "./pages/Notice/PublicNoticeListPage";

// Application
import ApplyAdmissionPage from "./pages/Admission/ApplyAdmissionPage";
import TemporaryLoginPage from "./pages/Admission/TemporaryLoginPage";
import ApplicationSuccessPage from "./pages/Admission/ApplicationSuccessPage";

// Enrollment
import TempEnrollmentRoute from "./route/TempEnrollmentRoute";
import StudentEnrollmentPage from "./pages/Enrollment/StudentEnrollmentPage";

// ✅ ADMIN PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
  return getAdminToken() ? children : <Navigate to="/login" replace />;
};

// USER PROTECTED ROUTE
const UserProtectedRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/users/login" replace />;
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
          <Route path="/CreatePassword" element={<CreatePasswordPage />} />
          <Route path="/notices" element={<PublicNoticeListPage />} />

          

          {/* ---------- PUBLIC Users AUTH ---------- */}
          <Route path="/users/login" element={<UserLoginPage />} />
          <Route path="/users/registration" element={<UserRegistrationPage />} />
          <Route path="/users/send-otp" element={<UserSendOTPPage />} />
          <Route path="/users/verify-otp" element={<UserVerifyOTPPage />} />
          <Route path="/users/create-password" element={<UserCreatePasswordPage />} />


          <Route path="/ApplyAdmissionPage" element={<ApplyAdmissionPage />} />
          <Route path="/application-success" element={<ApplicationSuccessPage />}/>
          <Route path="/admission/temporary-login" element={<TemporaryLoginPage />}/>

          <Route
  path="/enrollment/:applicationId"
  element={
    <TempEnrollmentRoute>
      <StudentEnrollmentPage />
    </TempEnrollmentRoute>
  }
/>

  

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
            path="/HallCreateUpdatePage"
            element={
              <ProtectedRoute>
                <HallCreateUpdatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/HallListPage"
            element={
              <ProtectedRoute>
                <HallListPage />
              </ProtectedRoute>
            }
          />

          <Route
  path="/admin/notices"
  element={
    <ProtectedRoute>
      <NoticePage />
    </ProtectedRoute>
  }
/>
<Route path="/AdminCreateUserPage" element={<ProtectedRoute><AdminCreateUserPage /></ProtectedRoute>} />
<Route path="/AdminUsersListPage" element={<ProtectedRoute><AdminUsersListPage /></ProtectedRoute>} />
<Route path="/AdminTnureListPage" element={<ProtectedRoute><AdminTnureListPage /></ProtectedRoute>} />

<Route
  path="/users/dashboard"
  element={
    <UserProtectedRoute>
      <UserDashboardPage />
    </UserProtectedRoute>
  }
/>
<Route
  path="/users/profile"
  element={
    <UserProtectedRoute>
      <UserProfilePage />
    </UserProtectedRoute>
  }
/>

<Route
  path="/DeanUsersListPage"
  element={
    <UserProtectedRoute>
      <DeanUsersListPage />
    </UserProtectedRoute>
  }
/>

<Route
  path="/ChairmanTenurePage"
  element={
    <UserProtectedRoute>
      <ChairmanTenurePage />
    </UserProtectedRoute>
  }
/>

<Route
  path="/ChairmanSupervisorsListPage"
  element={
    <UserProtectedRoute>
      <ChairmanSupervisorsListPage />
    </UserProtectedRoute>
  }
/>

<Route
  path="/ChairmanDecisionBlueprintListPage"
  element={
    <UserProtectedRoute>
      <ChairmanDecisionBlueprintListPage />
    </UserProtectedRoute>
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
