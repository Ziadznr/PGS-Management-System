import React, { Fragment } from 'react';
import { getToken } from "./helper/SessionHelper";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import FullscreenLoader from "./components/MasterLayout/FullscreenLoader.jsx";
import NotFoundPage from "./pages/NotFound/NotFoundPage";

// ------------------ Landing Page ------------------
import LandingPage from "./pages/LandingPage";

// ------------------ User Pages ------------------
import LoginPage from "./pages/Admin/LoginPage.jsx";
import RegistrationPage from "./pages/Admin/RegistrationPage";
import SendOTPPage from "./pages/Admin/SendOTPPage";
import VerifyOTPPage from "./pages/Admin/VerifyOTPPage";
import CreatePasswordPage from "./pages/Admin/CreatePasswordPage";
import ProfilePage from "./pages/Admin/ProfilePage";

// ------------------ Chairman Pages ------------------
import CustomerLoginPage from "./pages/Customers/CustomerLoginPage.jsx";
import CustomerRegistrationPage from "./pages/Customers/CustomerRegistrationPage.jsx";
import CustomerSendOTPPage from "./pages/Customers/CustomerSendOTPPage.jsx";
import CustomerVerifyOTPPage from "./pages/Customers/CustomerVerifyOTPPage.jsx";
import CustomerCreatePasswordPage from "./pages/Customers/CustomerCreatePasswordPage.jsx";
import CustomerProfilePage from "./pages/Customers/CustomerProfilePage.jsx";

// ------------------ Dashboard & Other Pages ------------------
import DashboardPage from "./pages/Dashboard/DashboardPage";
import BrandCreateUpdatePage from "./pages/Brand/BrandCreateUpdatePage";
import BrandListPage from "./pages/Brand/BrandListPage";
import CategoryCreateUpdatePage from "./pages/Category/CategoryCreateUpdatePage";
import CategoryListPage from "./pages/Category/CategoryListPage";
// import CustomerCreateUpdatePage from "./pages/Customer/CustomerCreateUpdatePage";
import CustomerListPage from "./pages/Customer/CustomerListPage";
import ExpenseTypeCreateUpdatePage from "./pages/ExpenseType/ExpenseTypeCreateUpdatePage";
import ExpenseTypeListPage from "./pages/ExpenseType/ExpenseTypeListPage";
import ExpenseCreateUpdatePage from "./pages/Expense/ExpenseCreateUpdatePage";
import ExpenseListPage from "./pages/Expense/ExpenseListPage";
import ProductCreateUpdatePage from "./pages/Product/ProductCreateUpdatePage";
import ProductListPage from "./pages/Product/ProductListPage";
import PurchaseCreateUpdatePage from "./pages/Purchase/PurchaseCreateUpdatePage";
import PurchaseListPage from "./pages/Purchase/PurchaseListPage";
import PurchaseReportPage from "./pages/Report/PurchaseReportPage";
import ReturnReportPage from "./pages/Report/ReturnReportPage";
import SaleReportPage from "./pages/Report/SaleReportPage";
import ExpenseReportPage from "./pages/Report/ExpenseReportPage";
import CustomerProductReportPage from "./pages/Report/CustomerProductReportPage.jsx";
import ReturnCreateUpdatePage from "./pages/Return/ReturnCreateUpdatePage";
import ReturnListPage from "./pages/Return/ReturnListPage";
import SalesCreateUpdatePage from "./pages/Sales/SalesCreateUpdatePage";
import SalesListPage from "./pages/Sales/SalesListPage";
import SupplierCreateUpdatePage from "./pages/Supplier/SupplierCreateUpdatePage";
import SupplierListPage from "./pages/Supplier/SupplierListPage";
import DepartmentListPage from "./pages/Department/DepartmentListPage";
import DepartmentCreateUpdatePage from "./pages/Department/DepartmentCreateUpdatePage";
import FacultyOperationPage from './pages/Faculty/FacultyOperationPage';
import SectionOperationPage from './pages/Section/SectionOperationPage.jsx';
import CustomerDashboardPage from './pages/Customers/CustomerDashboardPage.jsx';
import CustomerProductListPage from './pages/Customers/CustomerProductListPage.jsx';
import CreateCustomerProductPage from './pages/Customer/CreateCustomerProductPage.jsx';
import CustomerProductEntryListPage from './pages/Customer/CustomerProductEntryListPage.jsx';
import IndividualProductEntryListPage from './pages/Customer/IndividualProductEntryListPage.jsx';
import TakeFromCSPage from './pages/Customer/TakeFromCSPage.jsx';

const App = () => {
  const token = getToken();

  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          {/* Default landing page */}
          <Route path="/" element={token ? <Navigate to="/Dashboard" /> : <LandingPage />} />

          {/* Authenticated routes */}
          {token && (
            <>
              <Route path="/Dashboard" element={<DashboardPage />} />
              <Route path="/Profile" element={<ProfilePage />} />
              {/* Other protected routes */}
              <Route path="/BrandCreateUpdatePage" element={<BrandCreateUpdatePage />} />
              <Route path="/BrandListPage" element={<BrandListPage />} />
              <Route path="/CategoryCreateUpdatePage" element={<CategoryCreateUpdatePage />} />
              <Route path="/CategoryListPage" element={<CategoryListPage />} />
              <Route path="/SectionOperationPage" element={<SectionOperationPage />} />
              <Route path="/FacultyOperationPage" element={<FacultyOperationPage />} />
              <Route path="/department-list" element={<DepartmentListPage />} />
              <Route path="/DepartmentCreateUpdatePage" element={<DepartmentCreateUpdatePage />} />
              {/* <Route path="/CustomerCreateUpdatePage" element={<CustomerCreateUpdatePage />} /> */}
              <Route path="/CustomerListPage" element={<CustomerListPage />} />
              <Route path="/CreateCustomerProductPage" element={<CreateCustomerProductPage />} />
              <Route path="/CustomerProductEntryListPage" element={<CustomerProductEntryListPage />} />
              <Route path="/ExpenseTypeCreateUpdatePage" element={<ExpenseTypeCreateUpdatePage />} />
              <Route path="/ExpenseTypeListPage" element={<ExpenseTypeListPage />} />
              <Route path="/ExpenseCreateUpdatePage" element={<ExpenseCreateUpdatePage />} />
              <Route path="/ExpenseListPage" element={<ExpenseListPage />} />
              <Route path="/ProductCreateUpdatePage" element={<ProductCreateUpdatePage />} />
              <Route path="/ProductListPage" element={<ProductListPage />} />
              <Route path="/PurchaseCreateUpdatePage" element={<PurchaseCreateUpdatePage />} />
              <Route path="/PurchaseListPage" element={<PurchaseListPage />} />
              <Route path="/ReturnCreateUpdatePage" element={<ReturnCreateUpdatePage />} />
              <Route path="/ReturnListPage" element={<ReturnListPage />} />
              <Route path="/SalesCreateUpdatePage" element={<SalesCreateUpdatePage />} />
              <Route path="/SalesListPage" element={<SalesListPage />} />
              <Route path="/SupplierCreateUpdatePage" element={<SupplierCreateUpdatePage />} />
              <Route path="/SupplierListPage" element={<SupplierListPage />} />
              <Route path="/PurchaseReportPage" element={<PurchaseReportPage />} />
              <Route path="/ReturnReportPage" element={<ReturnReportPage />} />
              <Route path="/SaleReportPage" element={<SaleReportPage />} />
              <Route path="/ExpenseReportPage" element={<ExpenseReportPage />} />
              <Route path="/CustomerProductReportPage" element={<CustomerProductReportPage />} />

              <Route path="/customer-dashboard" element={<CustomerDashboardPage />} />
              <Route path="/CustomerProductListPage" element={<CustomerProductListPage />} />
              <Route path="/CustomerProfile" element={<CustomerProfilePage />} />
              <Route path="/my-entries" element={<IndividualProductEntryListPage />} />
              <Route path="/TakeFromUniversity" element={<TakeFromCSPage />} />
            </>
          )}

          {/* Public routes */}
          {!token && (
            <>
              <Route path="/Start" element={<LandingPage />} />
              <Route path="/Login" element={<LoginPage />} />
              <Route path="/Registration" element={<RegistrationPage />} />
              <Route path="/SendOTP" element={<SendOTPPage />} />
              <Route path="/VerifyOTP" element={<VerifyOTPPage />} />
              <Route path="/CreatePassword" element={<CreatePasswordPage />} />
              <Route path="/CustomerLogin" element={<CustomerLoginPage />} />
              <Route path="/CustomerRegistration" element={<CustomerRegistrationPage />} />
              <Route path="/CustomerSendOTP" element={<CustomerSendOTPPage />} />
              <Route path="/CustomerVerifyOTP" element={<CustomerVerifyOTPPage />} />
              <Route path="/CustomerCreatePassword" element={<CustomerCreatePasswordPage />} />
              
            </>
          )}

          {/* 404 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>

      <FullscreenLoader />
      <Toaster position="top-center" reverseOrder={false} />
    </Fragment>
  );
};

export default App;
